import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import HostConsole from "./host-console";

export const dynamic = "force-dynamic";

const HOST_ACCOUNT_ID = "35c24833-6310-4340-92c1-a4bb56e704bf";

export default async function HostPage() {
  const user = await requireChatGPTUser("/host");

  if (user.userId !== HOST_ACCOUNT_ID) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07111f] px-6 text-[#f7f0dd]">
        <section className="max-w-lg rounded-[1.75rem] border border-white/10 bg-[#0d1b2b] p-8 text-center shadow-2xl">
          <p className="eyebrow text-[#ff776b]">Restricted area</p>
          <h1 className="mt-3 font-display text-4xl">Host access only</h1>
          <p className="mt-3 text-[#94a9c2]">This account is not authorized to control the game.</p>
          <a href={chatGPTSignOutPath("/")} className="mt-7 inline-flex rounded-xl bg-[#ffd34e] px-5 py-3 font-bold text-[#17202b]">Return to player game</a>
        </section>
      </main>
    );
  }

  return <HostConsole displayName={user.displayName} signOutPath={chatGPTSignOutPath("/")} />;
}
