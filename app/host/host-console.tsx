"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Eye, Gamepad2, LogOut, RotateCcw, Trophy, Users } from "lucide-react";

type HostGame = {
  roomCode: string;
  question: number;
  totalQuestions: number;
  clueIndex: number;
  clueNumber: number;
  clue: string;
  points: number;
  answer: string;
  answerRevealed: boolean;
  playerCount: number;
  answeredCount: number;
  leaderboard: Array<{ id: string; name: string; score: number; rank: number }>;
  guesses: Array<{ playerName: string; guess: string; clueNumber: number; correct: boolean; points: number }>;
};

export default function HostConsole({ signOutPath }: { signOutPath: string }) {
  const [game, setGame] = useState<HostGame | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/host/game", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the host game state.");
      setGame(await response.json() as HostGame);
      setError("");
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not load the host game state.");
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 1200);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [refresh]);

  async function hostAction(action: "next_clue" | "reveal_answer" | "next_question" | "restart_game") {
    if (action === "restart_game" && !window.confirm("Restart the entire game? Scores and guesses will be cleared.")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/host/game", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) throw new Error("The host action could not be completed.");
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The host action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "show_next_clue", title: "Show next clue", description: "Advance the protected host game to the next clue.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async () => { await hostAction("next_clue"); return { status: "advanced" }; },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  });

  if (!game) return <main className="grid min-h-screen place-items-center bg-[#07111f] text-[#ffd34e]"><div>{error || "Loading host console…"}</div></main>;
  const participation = game.playerCount ? Math.round((game.answeredCount / game.playerCount) * 100) : 0;

  return <main className="min-h-screen bg-[#07111f] text-[#f7f0dd]">
    <header className="border-b border-white/10 bg-[#091522]/95 px-4 py-3 sm:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><div className="brand-lockup"><Gamepad2 /> Founder Frenzy <Badge className="ml-2 bg-[#ff5c4d]">HOST</Badge></div><a href={signOutPath} className="flex items-center gap-2 text-sm font-bold text-[#ffd34e]"><LogOut className="size-4" /> Lock host console</a></div></header>
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-[#7f95ad]">Protected host control</p><h1 className="mt-1 font-display text-4xl sm:text-5xl">Question {game.question} of {game.totalQuestions}</h1></div><div className="flex gap-2"><Button variant="outline" onClick={() => void hostAction("restart_game")} disabled={busy} className="border-white/15 bg-white/5 text-white hover:bg-white/10"><RotateCcw /> Restart game</Button><Button className="bg-[#ffd34e] font-bold text-[#18212c] hover:bg-[#ffe17a]"><Trophy /> {game.playerCount} players</Button></div></div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-[#ff776b]/30 bg-[#ff776b]/10 p-3 text-sm font-semibold text-[#ff9b92]">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <section className="rounded-[1.7rem] border border-white/10 bg-[#0d1b2b] p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Badge className="bg-[#ff5c4d]">LIVE</Badge><span className="text-[#91a6bd]">Clue {game.clueNumber} of 5</span></div><Badge variant="outline" className="border-white/10 px-3 py-1 text-[#ffd34e]">{game.points} points</Badge></div><blockquote className="mt-7 rounded-2xl border border-white/10 bg-[#081421] p-7 font-display text-2xl leading-snug sm:p-10 sm:text-4xl">“{game.clue}”</blockquote><div className="mt-7 grid gap-4 sm:grid-cols-3"><Metric icon={<Users />} label="Joined players" value={`${game.playerCount}`} /><Metric icon={<Check />} label="Answered" value={`${game.answeredCount}`} /><Metric icon={<Eye />} label="Still eligible" value={`${Math.max(0, game.playerCount - game.answeredCount)}`} /></div><div className="mt-7 flex flex-wrap gap-3">{game.answerRevealed ? <Button onClick={() => void hostAction("next_question")} disabled={busy || game.question === game.totalQuestions} className="h-12 flex-1 bg-[#ffd34e] font-bold text-[#18212c] hover:bg-[#ffe17a]">Next question <ChevronRight /></Button> : <><Button onClick={() => void hostAction("next_clue")} disabled={busy || game.clueIndex === 4} className="h-12 flex-1 bg-[#ff5c4d] font-bold hover:bg-[#ff786d]">Show next clue <ChevronRight /></Button><Button variant="outline" onClick={() => void hostAction("reveal_answer")} disabled={busy} className="h-12 border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"><Eye /> Reveal answer</Button></>}</div>{game.answerRevealed && <div className="mt-5 rounded-2xl border border-[#ffd34e]/40 bg-[#ffd34e]/10 p-6"><p className="eyebrow text-[#dcb935]">And the answer is…</p><p className="mt-1 font-display text-4xl text-[#ffd34e]">{game.answer}</p></div>}</section>
        <aside className="space-y-5"><section className="dark-card"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#8298b1]">Room code</p><p className="mt-1 font-mono text-3xl font-black tracking-[.12em] text-[#ffd34e]">{game.roomCode}</p></div><div className="rounded-xl bg-white/6 p-3"><Users /></div></div><Progress value={participation} className="mt-5 bg-white/10 [&>div]:bg-[#ff5c4d]" /><p className="mt-2 text-sm text-[#8ca1b8]">{game.answeredCount} of {game.playerCount} joined players answered</p></section><section className="dark-card"><h2 className="font-display text-2xl">Live answers</h2><div className="mt-4 space-y-2">{game.guesses.length ? game.guesses.map((entry) => <div key={`${entry.playerName}-${entry.clueNumber}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-3"><span className="font-bold">{entry.playerName}</span><span className="max-w-[190px] truncate text-sm text-[#8ea3ba]">{entry.guess} · clue {entry.clueNumber}</span></div>) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-[#71869e]">No answers yet</p>}</div></section><section className="dark-card"><h2 className="font-display text-2xl">Leaderboard</h2><div className="mt-4 space-y-2">{game.leaderboard.length ? game.leaderboard.slice(0, 5).map((player) => <div key={player.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3"><span className="w-6 text-[#ffd34e]">#{player.rank}</span><span className="flex-1 font-bold">{player.name}</span><span className="font-display text-xl">{player.score}</span></div>) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-[#71869e]">Players appear after joining</p>}</div></section></aside>
      </div>
    </div>
  </main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/5 p-4"><div className="mb-3 text-[#ff776b]">{icon}</div><p className="font-display text-3xl">{value}</p><p className="text-sm text-[#8499b1]">{label}</p></div>;
}
