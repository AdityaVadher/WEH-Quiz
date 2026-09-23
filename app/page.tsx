"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, Crown, Gamepad2, LockKeyhole, Medal, Play, Sparkles, Trophy, Users, Zap } from "lucide-react";

type LeaderboardPlayer = { id: string; name: string; score: number; rank: number };
type GameData = {
  roomCode: string; question: number; totalQuestions: number; clueIndex: number; clueNumber: number;
  clue: string; points: number; answerRevealed: boolean; answer: string | null;
  player: null | { id: string; name: string; score: number; guess: null | { text: string; clueNumber: number; correct: boolean | null; points: number | null } };
  leaderboard: LeaderboardPlayer[];
};
type View = "player" | "leaderboard";

export default function Home() {
  const [view, setView] = useState<View>("player");
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("WEH-742");
  const [guess, setGuess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/game", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the live game.");
      setGame(await response.json() as GameData);
      setError("");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not load the live game.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 1500);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);

  async function joinGame() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/players", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: playerName, roomCode }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not join this room.");
      await refresh();
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Could not join this room.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitGuess() {
    if (!guess.trim() || game?.player?.guess || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/guess", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ guess }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not lock your answer.");
      await refresh();
    } catch (guessError) {
      setError(guessError instanceof Error ? guessError.message : "Could not lock your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  async function leaveRoom() {
    await fetch("/api/players", { method: "DELETE" });
    setGuess("");
    setView("player");
    await refresh();
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "submit_quiz_guess", title: "Submit quiz guess", description: "Submit the signed-in player's one allowed guess for the live round.",
        inputSchema: { type: "object", properties: { guess: { type: "string" } }, required: ["guess"], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input: { guess?: string }) => {
          const value = input.guess?.trim();
          if (!value || !game?.player || game.player.guess) throw new Error("Join the room and enter one valid guess.");
          const response = await fetch("/api/guess", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ guess: value }) });
          if (!response.ok) throw new Error("The guess could not be submitted.");
          setGuess(value);
          await refresh();
          return { status: "locked", question: game.question, clue: game.clueNumber };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [game, refresh]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#07111f] text-[#ffd34e]"><div className="brand-lockup"><Gamepad2 /> Loading Founder Frenzy…</div></main>;

  if (!game?.player) return (
    <main className="min-h-screen bg-[#07111f] px-5 py-8 text-[#f7f0dd] sm:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1b2d] shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[370px] overflow-hidden bg-[#ff5c4d] p-8 sm:p-12"><div className="sunburst" /><div className="relative z-10 flex h-full flex-col justify-between"><div className="brand-lockup"><Gamepad2 /> Founder Frenzy</div><div><p className="eyebrow text-[#37140f]">Live founder quiz</p><h1 className="mt-3 max-w-lg font-display text-5xl leading-[.94] text-[#27110e] sm:text-7xl">Spot the founder before everyone else.</h1></div><div className="flex items-center gap-3 text-sm font-semibold text-[#37140f]"><Zap className="size-4" /> One guess. Five clues. No second chances.</div></div></div>
          <div className="flex flex-col justify-center p-8 sm:p-12"><Badge className="mb-6 w-fit border-white/10 bg-white/8 text-[#ffd95e]">Players join here</Badge><h2 className="font-display text-4xl">Enter the room</h2><p className="mt-2 text-[#9fb1c8]">Your name appears on the leaderboard only after you join.</p><div className="mt-8 space-y-5"><label className="block text-sm font-semibold">Display name<Input value={playerName} onChange={(event) => setPlayerName(event.target.value)} className="mt-2 h-12 border-white/10 bg-[#081421] text-base text-white" placeholder="Your name" maxLength={28} /></label><label className="block text-sm font-semibold">Room code<Input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} className="mt-2 h-12 border-white/10 bg-[#081421] font-mono text-lg tracking-[.18em] text-white" /></label>{error && <p role="alert" className="text-sm font-semibold text-[#ff8b80]">{error}</p>}<Button onClick={joinGame} disabled={submitting || playerName.trim().length < 2} className="h-13 w-full rounded-xl bg-[#ffd34e] text-base font-bold text-[#1b2230] hover:bg-[#ffe078]">{submitting ? "Joining…" : "Join game"} <ArrowRight /></Button></div></div>
        </section>
      </div>
    </main>
  );

  const playerRank = game.leaderboard.find((player) => player.id === game.player?.id)?.rank ?? game.leaderboard.length;
  const lockedGuess = game.player.guess;

  return <main className="min-h-screen bg-[#07111f] text-[#f7f0dd]">
    <header className="border-b border-white/10 bg-[#091522]/95 px-4 py-3 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><div className="brand-lockup"><Gamepad2 /> Founder Frenzy</div><nav className="flex rounded-xl bg-white/5 p-1" aria-label="Game views">{(["player", "leaderboard"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-3 py-2 text-sm font-bold capitalize transition sm:px-5 ${view === item ? "bg-[#ffd34e] text-[#1a2432]" : "text-[#94a9c2] hover:text-white"}`}>{item}</button>)}</nav><div className="hidden items-center gap-3 sm:flex"><span className="live-dot" /><span className="text-sm font-bold">LIVE</span><span className="text-sm text-[#8ca0b8]">{game.roomCode}</span></div></div></header>

    {view === "player" && <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] sm:px-8"><section className="retro-panel min-h-[650px] overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#52271e]/15 px-5 py-4 sm:px-8"><div className="flex items-center gap-3"><Badge className="bg-[#ff5c4d] text-white">QUESTION {game.question}</Badge><span className="font-bold text-[#603126]">Who am I?</span></div><div className="flex items-center gap-2 text-sm font-bold text-[#603126]"><Users className="size-4" />{game.leaderboard.length} playing</div></div><div className="p-5 sm:p-8"><div className="flex items-center justify-between gap-5"><div><p className="eyebrow text-[#8e3e2e]">Clue {game.clueNumber} of 5</p><h1 className="mt-1 font-display text-3xl text-[#3e2119] sm:text-5xl">Guess the founder</h1></div><div className="score-burst"><span>{game.points}</span><small>PTS</small></div></div><div className="mt-6 flex gap-2">{[0, 1, 2, 3, 4].map((index) => <div key={index} className={`h-2 flex-1 rounded-full ${index <= game.clueIndex ? "bg-[#ff5c4d]" : "bg-[#d9c8a6]"}`} />)}</div><blockquote className="clue-card mt-8"><Sparkles className="absolute left-5 top-5 size-6 text-[#ff5c4d]" /><p>“{game.clue}”</p></blockquote>
      {game.answerRevealed ? <div className="mt-8 rounded-2xl border border-[#e1b936] bg-[#fff2b8] p-6 text-[#3e2b08]"><p className="eyebrow text-[#8f6500]">And the founder is…</p><p className="mt-1 font-display text-4xl">{game.answer}</p>{lockedGuess && <p className="mt-3 font-semibold">Your answer: {lockedGuess.text} · {lockedGuess.correct ? `Correct +${lockedGuess.points}` : "Not this time"}</p>}</div> : !lockedGuess ? <div className="mt-8 rounded-2xl border-2 border-dashed border-[#d7bd8a] bg-white/45 p-5 sm:p-6"><div className="mb-3 flex items-center justify-between"><label htmlFor="guess" className="font-bold text-[#40231b]">Your one guess</label><span className="text-sm font-semibold text-[#9b5e4f]">Worth {game.points} points</span></div><div className="flex flex-col gap-3 sm:flex-row"><Input id="guess" value={guess} onChange={(event) => setGuess(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void submitGuess()} placeholder="Type the founder's name…" className="h-13 flex-1 border-[#bd9a63] bg-white text-base text-[#281710] placeholder:text-[#9b8775]" /><Button onClick={submitGuess} disabled={!guess.trim() || submitting} className="h-13 rounded-xl bg-[#1c6f66] px-7 font-bold text-white hover:bg-[#155c55]">Lock my answer <LockKeyhole /></Button></div><p className="mt-3 flex items-start gap-2 text-sm text-[#765244]"><Zap className="mt-0.5 size-4 shrink-0 text-[#ff5c4d]" />Once submitted, you cannot answer any later clue in this round.</p>{error && <p role="alert" className="mt-3 text-sm font-semibold text-[#b73e32]">{error}</p>}</div> : <div className="mt-8 rounded-2xl border border-[#58a894] bg-[#dff3e9] p-6 text-[#173c35]"><div className="flex items-start gap-4"><div className="rounded-full bg-[#1c7568] p-2 text-white"><Check /></div><div><p className="font-display text-2xl">Answer locked</p><p className="mt-1">You guessed <strong>{lockedGuess.text}</strong> on clue {lockedGuess.clueNumber}.</p><p className="mt-2 text-sm text-[#476c64]">The remaining clues are view-only for you.</p></div></div></div>}
    </div></section><aside className="space-y-5"><section className="dark-card"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#8198b2]">Your position</p><p className="mt-1 font-display text-4xl">#{playerRank}</p></div><div className="rounded-2xl bg-[#ffd34e] p-3 text-[#222a36]"><Trophy /></div></div><div className="mt-6 flex items-end justify-between"><div><p className="text-sm text-[#8ba0b7]">Total score</p><p className="font-display text-3xl">{game.player.score}</p></div><span className="text-sm font-bold text-[#71d3b4]">{game.player.name}</span></div></section><section className="dark-card"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Top players</h2><button onClick={() => setView("leaderboard")} className="text-sm font-bold text-[#ffd34e]">View all</button></div><div className="mt-4 space-y-2">{game.leaderboard.slice(0, 5).map((player) => <LeaderboardRow key={player.id} player={player} />)}</div></section><section className="rounded-2xl border border-white/10 bg-[#0e1c2c] p-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#ff5c4d]/15 p-2 text-[#ff786c]"><LockKeyhole /></div><div><p className="font-bold">One guess per round</p><p className="text-sm text-[#8298b1]">Earlier correct guesses win more points.</p></div></div></section></aside></div>}

    {view === "leaderboard" && <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8"><div className="text-center"><p className="eyebrow text-[#ffd34e]">After question {game.question}</p><h1 className="mt-2 font-display text-5xl sm:text-7xl">Leaderboard</h1><p className="mt-3 text-[#8ca1b8]">Only players who joined this room appear here.</p></div>{game.leaderboard.length ? <><div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-5">{game.leaderboard.slice(0, 3).map((player, index) => <Podium key={player.id} player={player} index={index} />)}</div><section className="mt-6 rounded-[1.7rem] border border-white/10 bg-[#0d1b2b] p-4 sm:p-6"><div className="space-y-2">{game.leaderboard.map((player) => <LeaderboardRow key={player.id} player={player} large />)}</div></section></> : <section className="mx-auto mt-10 max-w-lg rounded-[1.7rem] border border-dashed border-white/15 bg-[#0d1b2b] p-10 text-center"><Users className="mx-auto size-10 text-[#607892]" /><p className="mt-4 font-display text-3xl">No players yet</p><p className="mt-2 text-[#8ca1b8]">The leaderboard will populate as people join.</p></section>}<div className="mt-6 flex justify-center"><Button onClick={() => setView("player")} className="bg-[#ffd34e] font-bold text-[#18212c] hover:bg-[#ffe17a]">Back to game <Play /></Button></div></div>}
    <button onClick={() => void leaveRoom()} className="fixed bottom-4 right-4 rounded-full border border-white/10 bg-[#0e1c2c] px-4 py-2 text-xs font-bold text-[#91a5bc] shadow-xl hover:text-white">Leave room</button>
  </main>;
}

function LeaderboardRow({ player, large = false }: { player: LeaderboardPlayer; large?: boolean }) {
  return <div className={`flex items-center gap-3 rounded-xl px-3 ${large ? "py-4" : "py-2.5"} ${player.rank === 1 ? "bg-[#ffd34e]/10" : "bg-white/[.04]"}`}><span className={`w-6 text-center font-black ${player.rank === 1 ? "text-[#ffd34e]" : "text-[#70859d]"}`}>{player.rank}</span><span className="grid size-9 place-items-center rounded-full bg-[#20334a] font-bold text-white">{player.rank === 1 ? <Crown className="size-4 text-[#ffd34e]" /> : player.name.charAt(0).toUpperCase()}</span><span className="flex-1 font-bold">{player.name}</span><span className="w-14 text-right font-display text-xl">{player.score}</span></div>;
}

function Podium({ player, index }: { player: LeaderboardPlayer; index: number }) {
  const color = index === 0 ? "#ffd34e" : index === 1 ? "#ff826f" : "#60c7b0";
  const height = index === 0 ? "h-36" : index === 1 ? "h-24" : "h-16";
  return <div className="text-center"><div className="relative mx-auto mb-3 grid size-16 place-items-center rounded-full border-4 bg-[#17283b] font-display text-2xl" style={{ borderColor: color }}>{index === 0 ? <Crown style={{ color }} /> : player.name.charAt(0).toUpperCase()}<span className="absolute -bottom-2 grid size-6 place-items-center rounded-full text-xs font-black text-[#101927]" style={{ background: color }}>{player.rank}</span></div><p className="truncate font-bold">{player.name}</p><p className="text-sm text-[#8ca1b8]">{player.score} pts</p><div className={`${height} mt-3 rounded-t-2xl pt-4 font-display text-3xl text-[#12202f]`} style={{ background: color }}>{index === 0 ? <Medal className="mx-auto" /> : player.rank}</div></div>;
}
