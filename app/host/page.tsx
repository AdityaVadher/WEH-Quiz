import { cookies } from "next/headers";
import { Gamepad2, KeyRound, LockKeyhole } from "lucide-react";
import HostConsole from "./host-console";
import { getHostPassword, HOST_SESSION_COOKIE, isValidHostSession } from "./host-auth";

export const dynamic = "force-dynamic";

export default async function HostPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const password = getHostPassword();
  const sessionCookie = (await cookies()).get(HOST_SESSION_COOKIE)?.value;
  const authorized = password ? await isValidHostSession(sessionCookie, password) : false;

  if (!authorized) {
    const error = (await searchParams).error;
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111f] px-6 text-[#f7f0dd]">
        <section className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#0d1b2b] p-8 shadow-2xl">
          <div className="brand-lockup"><Gamepad2 /> Guess the Founder</div>
          <div className="mt-8 grid size-12 place-items-center rounded-2xl bg-[#ff5c4d]/15 text-[#ff776b]"><LockKeyhole /></div>
          <p className="eyebrow mt-6 text-[#ff776b]">Restricted area</p>
          <h1 className="mt-2 font-display text-4xl">Enter host mode</h1>
          <p className="mt-3 text-[#94a9c2]">Use the private host password to control clues, answers and the live game.</p>
          <form action="/host/login" method="post" className="mt-7 space-y-4">
            <label htmlFor="host-password" className="block text-sm font-bold text-[#d8e1eb]">Host password</label>
            <div className="flex items-center rounded-xl border border-white/12 bg-[#081421] px-4 focus-within:border-[#ffd34e]/70">
              <KeyRound className="size-5 shrink-0 text-[#788da5]" />
              <input id="host-password" name="password" type="password" autoComplete="current-password" required autoFocus className="h-13 w-full bg-transparent px-3 text-base text-white outline-none placeholder:text-[#61758d]" placeholder="Enter secret password" />
            </div>
            {error === "invalid" && <p role="alert" className="text-sm font-semibold text-[#ff8b80]">That password is incorrect. Please try again.</p>}
            {error === "config" && <p role="alert" className="text-sm font-semibold text-[#ff8b80]">Host access is not configured yet.</p>}
            <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ffd34e] font-bold text-[#17202b] transition hover:bg-[#ffe17a]">Unlock host console <KeyRound className="size-4" /></button>
          </form>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="mt-5 block text-center text-sm font-bold text-[#8fa4bb] hover:text-white">Return to player game</a>
        </section>
      </main>
    );
  }

  return <HostConsole signOutPath="/host/logout" />;
}
