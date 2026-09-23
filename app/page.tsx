"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Crown, Gamepad2, LockKeyhole, Medal, Play, Sparkles, Trophy, Users, Zap } from "lucide-react";

const clues = [
  "I helped launch Tinder and led its early marketing before deciding I had another dating app in me.",
  "I founded my next company in 2014 with a yellow identity and one deliberate change to the usual rules.",
  "In heterosexual matches, women had to start the conversation. Millions of men discovered patience for the first time.",
  "The idea expanded from dating into friendship and professional networking, because awkward introductions scale.",
  "My app's name is the noise a bee makes after approving your profile.",
];
const scoreSteps = [50, 40, 30, 20, 10];
const standings = [
  { name: "Rhea", score: 310, change: "+50", avatar: "R" },
  { name: "Kabir", score: 280, change: "+20", avatar: "K" },
  { name: "Maya", score: 260, change: "—", avatar: "M" },
  { name: "Arjun", score: 230, change: "+40", avatar: "A" },
  { name: "Dev", score: 190, change: "+10", avatar: "D" },
];
type View = "player" | "leaderboard";

export default function Home() {
  const [view, setView] = useState<View>("player");
  const [clueIndex] = useState(1);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [joined, setJoined] = useState(true);
  const [playerName, setPlayerName] = useState("Aarav");
  const [roomCode, setRoomCode] = useState("WEH-742");
  const points = scoreSteps[clueIndex];

  function submitGuess() {
    if (!guess.trim() || submitted) return;
    setSubmitted(true);
  }

  useEffect(() => {
    const context = (document as Document & {
      modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void | Promise<void> };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "submit_quiz_guess",
        title: "Submit quiz guess",
        description: "Submit the current player's one allowed guess for this round.",
        inputSchema: { type: "object", properties: { guess: { type: "string" } }, required: ["guess"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input: { guess?: string }) => {
          if (!input.guess?.trim() || submitted) throw new Error("Only one valid guess is allowed.");
          setGuess(input.guess.trim());
          setSubmitted(true);
          return { status: "locked", clue: clueIndex + 1, possiblePoints: points };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [clueIndex, points, submitted]);

  if (!joined) return (
    <main className="min-h-screen bg-[#07111f] px-5 py-8 text-[#f7f0dd] sm:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1b2d] shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[370px] overflow-hidden bg-[#ff5c4d] p-8 sm:p-12">
            <div className="sunburst" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="brand-lockup"><Gamepad2 /> Founder Frenzy</div>
              <div><p className="eyebrow text-[#37140f]">Live founder quiz</p><h1 className="mt-3 max-w-lg font-display text-5xl leading-[.94] text-[#27110e] sm:text-7xl">Spot the founder before everyone else.</h1></div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[#37140f]"><Zap className="size-4" /> One guess. Five clues. No second chances.</div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <Badge className="mb-6 w-fit border-white/10 bg-white/8 text-[#ffd95e]">Players join here</Badge>
            <h2 className="font-display text-4xl">Enter the room</h2>
            <p className="mt-2 text-[#9fb1c8]">Ask your host for the six-character game code.</p>
            <div className="mt-8 space-y-5">
              <label className="block text-sm font-semibold">Display name<Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="mt-2 h-12 border-white/10 bg-[#081421] text-base text-white" /></label>
              <label className="block text-sm font-semibold">Room code<Input value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} className="mt-2 h-12 border-white/10 bg-[#081421] font-mono text-lg tracking-[.18em] text-white" /></label>
              <Button onClick={() => setJoined(true)} className="h-13 w-full rounded-xl bg-[#ffd34e] text-base font-bold text-[#1b2230] hover:bg-[#ffe078]">Join game <ArrowRight /></Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-[#f7f0dd]">
      <header className="border-b border-white/10 bg-[#091522]/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="brand-lockup"><Gamepad2 /> Founder Frenzy</div>
          <nav className="flex rounded-xl bg-white/5 p-1" aria-label="Game views">
            {(["player", "leaderboard"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-3 py-2 text-sm font-bold capitalize transition sm:px-5 ${view === item ? "bg-[#ffd34e] text-[#1a2432]" : "text-[#94a9c2] hover:text-white"}`}>{item}</button>)}
          </nav>
          <div className="hidden items-center gap-3 sm:flex"><span className="live-dot" /><span className="text-sm font-bold">LIVE</span><span className="text-sm text-[#8ca0b8]">{roomCode}</span></div>
        </div>
      </header>

      {view === "player" && <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] sm:px-8">
        <section className="retro-panel min-h-[650px] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#52271e]/15 px-5 py-4 sm:px-8"><div className="flex items-center gap-3"><Badge className="bg-[#ff5c4d] text-white">ROUND 08</Badge><span className="font-bold text-[#603126]">Who am I?</span></div><div className="flex items-center gap-2 text-sm font-bold text-[#603126]"><Users className="size-4" />24 playing</div></div>
          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between gap-5"><div><p className="eyebrow text-[#8e3e2e]">Clue {clueIndex + 1} of 5</p><h1 className="mt-1 font-display text-3xl text-[#3e2119] sm:text-5xl">Guess the founder</h1></div><div className="score-burst"><span>{points}</span><small>PTS</small></div></div>
            <div className="mt-6 flex gap-2">{scoreSteps.map((score, i) => <div key={score} className={`h-2 flex-1 rounded-full ${i <= clueIndex ? "bg-[#ff5c4d]" : "bg-[#d9c8a6]"}`} />)}</div>
            <blockquote className="clue-card mt-8"><Sparkles className="absolute left-5 top-5 size-6 text-[#ff5c4d]" /><p>“{clues[clueIndex]}”</p></blockquote>
            {!submitted ? <div className="mt-8 rounded-2xl border-2 border-dashed border-[#d7bd8a] bg-white/45 p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between"><label htmlFor="guess" className="font-bold text-[#40231b]">Your one guess</label><span className="text-sm font-semibold text-[#9b5e4f]">Worth {points} points</span></div>
              <div className="flex flex-col gap-3 sm:flex-row"><Input id="guess" value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitGuess()} placeholder="Type the founder's name…" className="h-13 flex-1 border-[#bd9a63] bg-white text-base text-[#281710] placeholder:text-[#9b8775]" /><Button onClick={submitGuess} disabled={!guess.trim()} className="h-13 rounded-xl bg-[#1c6f66] px-7 font-bold text-white hover:bg-[#155c55]">Lock my answer <LockKeyhole /></Button></div>
              <p className="mt-3 flex items-start gap-2 text-sm text-[#765244]"><Zap className="mt-0.5 size-4 shrink-0 text-[#ff5c4d]" />Once submitted, you cannot answer any later clue in this round.</p>
            </div> : <div className="mt-8 rounded-2xl border border-[#58a894] bg-[#dff3e9] p-6 text-[#173c35]"><div className="flex items-start gap-4"><div className="rounded-full bg-[#1c7568] p-2 text-white"><Check /></div><div><p className="font-display text-2xl">Answer locked</p><p className="mt-1">You guessed <strong>{guess}</strong> on clue {clueIndex + 1}.</p><p className="mt-2 text-sm text-[#476c64]">The remaining clues are view-only for you.</p></div></div></div>}
          </div>
        </section>
        <aside className="space-y-5">
          <section className="dark-card"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#8198b2]">Your position</p><p className="mt-1 font-display text-4xl">#6</p></div><div className="rounded-2xl bg-[#ffd34e] p-3 text-[#222a36]"><Trophy /></div></div><div className="mt-6 flex items-end justify-between"><div><p className="text-sm text-[#8ba0b7]">Total score</p><p className="font-display text-3xl">180</p></div><span className="text-sm font-bold text-[#71d3b4]">↑ 2 places</span></div></section>
          <section className="dark-card"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Top players</h2><button onClick={() => setView("leaderboard")} className="text-sm font-bold text-[#ffd34e]">View all</button></div><div className="mt-4 space-y-2">{standings.slice(0, 4).map((p, i) => <LeaderboardRow key={p.name} player={p} rank={i + 1} />)}</div></section>
          <section className="rounded-2xl border border-white/10 bg-[#0e1c2c] p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#ff5c4d]/15 p-2 text-[#ff786c]"><LockKeyhole /></div><div><p className="font-bold">One guess per round</p><p className="text-sm text-[#8298b1]">Earlier guesses can win more points.</p></div></div></section>
        </aside>
      </div>}

      {view === "leaderboard" && <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8"><div className="text-center"><p className="eyebrow text-[#ffd34e]">After round 08</p><h1 className="mt-2 font-display text-5xl sm:text-7xl">Leaderboard</h1><p className="mt-3 text-[#8ca1b8]">Fast guesses climb faster.</p></div><div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-5"><Podium name="Kabir" score="280" rank={2} color="#ff826f" /><Podium name="Rhea" score="310" rank={1} color="#ffd34e" /><Podium name="Maya" score="260" rank={3} color="#60c7b0" /></div><section className="mt-6 rounded-[1.7rem] border border-white/10 bg-[#0d1b2b] p-4 sm:p-6"><div className="space-y-2">{standings.map((p, i) => <LeaderboardRow key={p.name} player={p} rank={i + 1} large />)}</div></section><div className="mt-6 flex justify-center"><Button onClick={() => setView("player")} className="bg-[#ffd34e] font-bold text-[#18212c] hover:bg-[#ffe17a]">Back to game <Play /></Button></div></div>}
      <button onClick={() => setJoined(false)} className="fixed bottom-4 right-4 rounded-full border border-white/10 bg-[#0e1c2c] px-4 py-2 text-xs font-bold text-[#91a5bc] shadow-xl hover:text-white">Leave room</button>
    </main>
  );
}

function LeaderboardRow({ player, rank, large = false }: { player: typeof standings[number]; rank: number; large?: boolean }) {
  return <div className={`flex items-center gap-3 rounded-xl px-3 ${large ? "py-4" : "py-2.5"} ${rank === 1 ? "bg-[#ffd34e]/10" : "bg-white/[.04]"}`}><span className={`w-6 text-center font-black ${rank === 1 ? "text-[#ffd34e]" : "text-[#70859d]"}`}>{rank}</span><span className="grid size-9 place-items-center rounded-full bg-[#20334a] font-bold text-white">{rank === 1 ? <Crown className="size-4 text-[#ffd34e]" /> : player.avatar}</span><span className="flex-1 font-bold">{player.name}</span><span className="text-sm font-bold text-[#65c9ae]">{player.change}</span><span className="w-12 text-right font-display text-xl">{player.score}</span></div>;
}
function Podium({ name, score, rank, color }: { name: string; score: string; rank: number; color: string }) {
  return <div className="text-center"><div className="relative mx-auto mb-3 grid size-16 place-items-center rounded-full border-4 bg-[#17283b] font-display text-2xl" style={{ borderColor: color }}>{rank === 1 ? <Crown style={{ color }} /> : name[0]}<span className="absolute -bottom-2 grid size-6 place-items-center rounded-full text-xs font-black text-[#101927]" style={{ background: color }}>{rank}</span></div><p className="font-bold">{name}</p><p className="text-sm text-[#8ca1b8]">{score} pts</p><div className={`${rank === 1 ? "h-36" : rank === 2 ? "h-24" : "h-16"} mt-3 rounded-t-2xl pt-4 font-display text-3xl text-[#12202f]`} style={{ background: color }}>{rank === 1 ? <Medal className="mx-auto" /> : rank}</div></div>;
}
