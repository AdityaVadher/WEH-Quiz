"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Eye, EyeOff, Gamepad2, LogOut, RotateCcw, Trophy, Users } from "lucide-react";

const clues = [
  "I helped launch Tinder and led its early marketing before deciding I had another dating app in me.",
  "I founded my next company in 2014 with a yellow identity and one deliberate change to the usual rules.",
  "In heterosexual matches, women had to start the conversation. Millions of men discovered patience for the first time.",
  "The idea expanded from dating into friendship and professional networking, because awkward introductions scale.",
  "My app's name is the noise a bee makes after approving your profile.",
];
const scores = [50, 40, 30, 20, 10];

export default function HostConsole({ displayName, signOutPath }: { displayName: string; signOutPath: string }) {
  const [clueIndex, setClueIndex] = useState(1);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const answeredCount = 7 + clueIndex * 3;

  function nextClue() { setClueIndex((current) => Math.min(current + 1, 4)); }
  function resetRound() { setClueIndex(0); setRevealAnswer(false); }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "show_next_clue",
        title: "Show next clue",
        description: "Advance the protected host game board to the next clue.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: () => { nextClue(); return { clue: Math.min(clueIndex + 2, 5), possiblePoints: scores[Math.min(clueIndex + 1, 4)] }; },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, [clueIndex]);

  return (
    <main className="min-h-screen bg-[#07111f] text-[#f7f0dd]">
      <header className="border-b border-white/10 bg-[#091522]/95 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="brand-lockup"><Gamepad2 /> Founder Frenzy <Badge className="ml-2 bg-[#ff5c4d]">HOST</Badge></div>
          <div className="flex items-center gap-4"><span className="hidden text-sm text-[#8fa4bb] sm:block">Signed in as {displayName}</span><a href={signOutPath} className="flex items-center gap-2 text-sm font-bold text-[#ffd34e]"><LogOut className="size-4" /> Exit host</a></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow text-[#7f95ad]">Protected host control</p><h1 className="mt-1 font-display text-4xl sm:text-5xl">Founder Quiz · Round 08</h1></div>
          <div className="flex gap-2"><Button variant="outline" onClick={resetRound} className="border-white/15 bg-white/5 text-white hover:bg-white/10"><RotateCcw /> Reset round</Button><Button className="bg-[#ffd34e] font-bold text-[#18212c] hover:bg-[#ffe17a]"><Trophy /> Leaderboard</Button></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <section className="rounded-[1.7rem] border border-white/10 bg-[#0d1b2b] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><Badge className="bg-[#ff5c4d]">LIVE</Badge><span className="text-[#91a6bd]">Clue {clueIndex + 1} of 5</span></div><Badge variant="outline" className="border-white/10 px-3 py-1 text-[#ffd34e]">{scores[clueIndex]} points</Badge></div>
            <blockquote className="mt-7 rounded-2xl border border-white/10 bg-[#081421] p-7 font-display text-2xl leading-snug sm:p-10 sm:text-4xl">“{clues[clueIndex]}”</blockquote>
            <div className="mt-7 grid gap-4 sm:grid-cols-3"><Metric icon={<Users />} label="Players" value="24" /><Metric icon={<Check />} label="Answered" value={`${answeredCount}`} /><Metric icon={<Eye />} label="Still eligible" value={`${24 - answeredCount}`} /></div>
            <div className="mt-7 flex flex-wrap gap-3"><Button onClick={nextClue} disabled={clueIndex === 4 || revealAnswer} className="h-12 flex-1 bg-[#ff5c4d] font-bold hover:bg-[#ff786d]">Show next clue <ChevronRight /></Button><Button variant="outline" onClick={() => setRevealAnswer(true)} className="h-12 border-white/15 bg-white/5 px-6 text-white hover:bg-white/10"><Eye /> Reveal answer</Button></div>
            {revealAnswer && <div className="mt-5 rounded-2xl border border-[#ffd34e]/40 bg-[#ffd34e]/10 p-6"><p className="eyebrow text-[#dcb935]">And the answer is…</p><p className="mt-1 font-display text-4xl text-[#ffd34e]">Whitney Wolfe Herd</p></div>}
          </section>

          <aside className="space-y-5">
            <section className="dark-card"><div className="flex items-center justify-between"><div><p className="eyebrow text-[#8298b1]">Room code</p><p className="mt-1 font-mono text-3xl font-black tracking-[.12em] text-[#ffd34e]">WEH-742</p></div><div className="rounded-xl bg-white/6 p-3"><Users /></div></div><Progress value={72} className="mt-5 bg-white/10 [&>div]:bg-[#ff5c4d]" /><p className="mt-2 text-sm text-[#8ca1b8]">24 of 30 seats filled</p></section>
            <section className="dark-card"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Live answers</h2><button onClick={() => setRevealAnswer(!revealAnswer)} className="text-[#849ab2]" aria-label="Toggle answer visibility">{revealAnswer ? <Eye /> : <EyeOff />}</button></div><div className="mt-4 space-y-2">{["Rhea", "Kabir", "Arjun", "Naina"].map((name, i) => <div key={name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3"><span className="font-bold">{name}</span><span className="max-w-[170px] truncate text-sm text-[#8ea3ba]">{revealAnswer ? ["Whitney Wolfe Herd", "Bumble founder", "Whitney", "Reed Hastings"][i] : "Answer hidden"}</span></div>)}</div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/5 p-4"><div className="mb-3 text-[#ff776b]">{icon}</div><p className="font-display text-3xl">{value}</p><p className="text-sm text-[#8499b1]">{label}</p></div>;
}
