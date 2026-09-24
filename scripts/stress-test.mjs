const baseUrl = (process.env.QUIZ_BASE_URL || "https://weh-quiz.vercel.app").replace(/\/$/, "");
const userCount = Number(process.env.QUIZ_STRESS_USERS || 100);
const pollRounds = Number(process.env.QUIZ_STRESS_ROUNDS || 12);
const roomCode = process.env.QUIZ_ROOM_CODE || "WEH-742";
const runId = `load-${Date.now()}`;
const timings = { join: [], guess: [], poll: [], cleanup: [] };
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

const users = Array.from({ length: userCount }, (_, index) => ({
  name: `Load User ${String(index + 1).padStart(3, "0")}`,
  email: `${runId}-${String(index + 1).padStart(3, "0")}@example.invalid`,
  cookie: "",
}));

console.log(`Starting ${userCount}-user stress test against ${baseUrl}`);

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
  user.cookie = result.response.headers.get("set-cookie")?.split(";", 1)[0] || "";
  if (!user.cookie) failures.push({ kind: "join", error: `No cookie returned for ${user.email}` });
}));

const joinedUsers = users.filter((user) => user.cookie);

await Promise.all(joinedUsers.map(async (user) => {
  const result = await measured("guess", `${baseUrl}/api/guess`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: user.cookie },
    body: JSON.stringify({ guess: "Load Test Founder" }),
  });
  if (result && ![200, 409].includes(result.response.status)) {
    failures.push({ kind: "guess", status: result.response.status, body: result.body.slice(0, 160) });
  }
}));

for (let round = 0; round < pollRounds; round += 1) {
  await Promise.all(joinedUsers.map(async (user) => {
    const result = await measured("poll", `${baseUrl}/api/game`, {
      headers: { cookie: user.cookie },
    });
    if (result && result.response.status !== 200) {
      failures.push({ kind: "poll", status: result.response.status, body: result.body.slice(0, 160) });
    }
  }));
  if (round < pollRounds - 1) await new Promise((resolve) => setTimeout(resolve, 1200));
}

await Promise.all(joinedUsers.map(async (user) => {
  const result = await measured("cleanup", `${baseUrl}/api/players`, {
    method: "DELETE",
    headers: { cookie: user.cookie },
  });
  if (result && result.response.status !== 200) {
    failures.push({ kind: "cleanup", status: result.response.status, body: result.body.slice(0, 160) });
  }
}));

const report = Object.fromEntries(Object.entries(timings).map(([kind, values]) => [kind, {
  requests: values.length,
  p50Ms: Math.round(percentile(values, 0.5)),
  p95Ms: Math.round(percentile(values, 0.95)),
  p99Ms: Math.round(percentile(values, 0.99)),
  maxMs: Math.round(Math.max(0, ...values)),
}]));

console.log(JSON.stringify({
  usersRequested: userCount,
  usersJoined: joinedUsers.length,
  pollRounds,
  failures: failures.length,
  timings: report,
  failureSamples: failures.slice(0, 10),
}, null, 2));

if (joinedUsers.length !== userCount || failures.length) process.exitCode = 1;
