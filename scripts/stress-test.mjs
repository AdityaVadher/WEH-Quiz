const baseUrl = (process.env.QUIZ_BASE_URL || "https://weh-quiz.vercel.app").replace(/\/$/, "");
const userCount = Number(process.env.QUIZ_STRESS_USERS || 100);
const pollRounds = Number(process.env.QUIZ_STRESS_ROUNDS || 12);
const roomCode = process.env.QUIZ_ROOM_CODE || "WEH-742";
const hostPassword = process.env.QUIZ_HOST_PASSWORD || "";
const runId = `load-${Date.now()}`;
const timings = { join: [], guess: [], poll: [], host: [], cleanup: [] };
const failures = [];

function percentile(values, fraction) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function measured(kind, url, options = {}) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, options);
    const body = await response.text();
    timings[kind].push(performance.now() - startedAt);
    return { response, body };
  } catch (error) {
    timings[kind].push(performance.now() - startedAt);
    failures.push({ kind, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

function cookieFrom(response) {
  return response.headers.get("set-cookie")?.split(";", 1)[0] || "";
}

async function hostSnapshot(hostCookie) {
  const result = await measured("host", `${baseUrl}/api/host/game`, { headers: { cookie: hostCookie } });
  if (!result || result.response.status !== 200) {
    if (result) failures.push({ kind: "host", status: result.response.status, body: result.body.slice(0, 160) });
    return null;
  }
  try {
    return JSON.parse(result.body);
  } catch {
    failures.push({ kind: "host", error: "Host response was not valid JSON." });
    return null;
  }
}

if (!hostPassword) {
  console.error("QUIZ_HOST_PASSWORD is required so the test can verify host visibility.");
  process.exit(1);
}

const preflight = await fetch(`${baseUrl}/api/game`, { cache: "no-store" });
const preflightGame = await preflight.json();
if (!preflight.ok || preflightGame.answerRevealed) {
  console.error("The active question must be open before the stress test starts.");
  process.exit(1);
}

const loginResponse = await fetch(`${baseUrl}/host/login`, {
  method: "POST",
  redirect: "manual",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ password: hostPassword }),
});
const hostCookie = cookieFrom(loginResponse);
if (loginResponse.status !== 303 || !hostCookie) {
  console.error(`Host login failed with status ${loginResponse.status}.`);
  process.exit(1);
}

const users = Array.from({ length: userCount }, (_, index) => ({
  name: `Load User ${String((index % 20) + 1).padStart(2, "0")}`,
  email: `${runId}-${String(index + 1).padStart(3, "0")}@example.invalid`,
  cookie: "",
}));

console.log(`Starting ${userCount}-user stress test against ${baseUrl} on question ${preflightGame.question}`);

await Promise.all(users.map(async (user) => {
  const result = await measured("join", `${baseUrl}/api/players`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: user.name, email: user.email, roomCode }),
  });
  if (!result) return;
  if (result.response.status !== 201) {
    failures.push({ kind: "join", status: result.response.status, body: result.body.slice(0, 160) });
    return;
  }
  user.cookie = cookieFrom(result.response);
  if (!user.cookie) failures.push({ kind: "join", error: `No cookie returned for ${user.email}` });
}));

const joinedUsers = users.filter((user) => user.cookie);
let maxHostAnswersSeen = 0;
let allAnswersVisibleAfterMs = null;
let guessingFinished = false;
const guessPhaseStartedAt = performance.now();
const observeHost = (async () => {
  while (!guessingFinished) {
    const snapshot = await hostSnapshot(hostCookie);
    const visible = snapshot?.guesses?.filter((entry) => entry.playerEmail?.startsWith(`${runId}-`)).length ?? 0;
    maxHostAnswersSeen = Math.max(maxHostAnswersSeen, visible);
    if (visible === joinedUsers.length && allAnswersVisibleAfterMs === null) allAnswersVisibleAfterMs = performance.now() - guessPhaseStartedAt;
    if (!guessingFinished) await new Promise((resolve) => setTimeout(resolve, 100));
  }
})();

await Promise.all(joinedUsers.map(async (user) => {
  const result = await measured("guess", `${baseUrl}/api/guess`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user.cookie },
    body: JSON.stringify({ guess: "Load Test Founder" }),
  });
  if (result && result.response.status !== 200) {
    failures.push({ kind: "guess", status: result.response.status, body: result.body.slice(0, 160) });
  }
}));
guessingFinished = true;
await observeHost;

const finalAnswerSnapshot = await hostSnapshot(hostCookie);
const finalVisibleAnswers = finalAnswerSnapshot?.guesses?.filter((entry) => entry.playerEmail?.startsWith(`${runId}-`)).length ?? 0;
maxHostAnswersSeen = Math.max(maxHostAnswersSeen, finalVisibleAnswers);
if (finalVisibleAnswers === joinedUsers.length && allAnswersVisibleAfterMs === null) allAnswersVisibleAfterMs = performance.now() - guessPhaseStartedAt;
if (finalVisibleAnswers !== joinedUsers.length) failures.push({ kind: "host-visibility", expected: joinedUsers.length, actual: finalVisibleAnswers });

for (let round = 0; round < pollRounds; round += 1) {
  await Promise.all([
    ...joinedUsers.map(async (user) => {
      const result = await measured("poll", `${baseUrl}/api/game`, { headers: { cookie: user.cookie } });
      if (result && result.response.status !== 200) failures.push({ kind: "poll", status: result.response.status, body: result.body.slice(0, 160) });
    }),
    hostSnapshot(hostCookie),
  ]);
  if (round < pollRounds - 1) await new Promise((resolve) => setTimeout(resolve, 1200));
}

await Promise.all(joinedUsers.map(async (user) => {
  const result = await measured("cleanup", `${baseUrl}/api/players`, { method: "DELETE", headers: { cookie: user.cookie } });
  if (result && result.response.status !== 200) failures.push({ kind: "cleanup", status: result.response.status, body: result.body.slice(0, 160) });
}));

const cleanupSnapshot = await hostSnapshot(hostCookie);
const remainingTestPlayers = cleanupSnapshot?.leaderboard?.filter((entry) => entry.email?.startsWith(`${runId}-`)).length ?? 0;
const remainingTestAnswers = cleanupSnapshot?.guesses?.filter((entry) => entry.playerEmail?.startsWith(`${runId}-`)).length ?? 0;
if (remainingTestPlayers || remainingTestAnswers) failures.push({ kind: "cleanup-verification", remainingTestPlayers, remainingTestAnswers });

const report = Object.fromEntries(Object.entries(timings).map(([kind, values]) => [kind, {
  requests: values.length,
  p50Ms: Math.round(percentile(values, 0.5)),
  p95Ms: Math.round(percentile(values, 0.95)),
  p99Ms: Math.round(percentile(values, 0.99)),
  maxMs: Math.round(Math.max(0, ...values)),
}]));

console.log(JSON.stringify({
  runId,
  question: preflightGame.question,
  usersRequested: userCount,
  usersJoined: joinedUsers.length,
  pollRounds,
  hostVisibility: {
    expectedAnswers: joinedUsers.length,
    finalVisibleAnswers,
    maxHostAnswersSeen,
    allAnswersVisibleAfterMs: allAnswersVisibleAfterMs === null ? null : Math.round(allAnswersVisibleAfterMs),
  },
  cleanup: { remainingTestPlayers, remainingTestAnswers },
  failures: failures.length,
  timings: report,
  failureSamples: failures.slice(0, 10),
}, null, 2));

if (joinedUsers.length !== userCount || failures.length) process.exitCode = 1;
