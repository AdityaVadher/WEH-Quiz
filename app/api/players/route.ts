import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { guesses, players } from "@/db/schema";
import { normalizePlayerEmail, normalizePlayerName, PLAYER_COOKIE, ROOM_CODE } from "@/app/game-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const payload = (await request.json()) as { name?: string; email?: string; roomCode?: string };
  const name = payload.name?.trim().replace(/\s+/g, " ") ?? "";
  const email = payload.email?.trim() ?? "";
  const roomCode = payload.roomCode?.trim().toUpperCase() ?? "";
  if (roomCode !== ROOM_CODE) return Response.json({ error: "That room code is not active." }, { status: 400 });
  if (name.length < 2 || name.length > 28) return Response.json({ error: "Use a name between 2 and 28 characters." }, { status: 400 });
  if (email.length < 5 || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const db = getDb();
  const nameKey = normalizePlayerName(name);
  const emailKey = normalizePlayerEmail(email);
  const [player] = await db.insert(players)
    .values({ roomCode: ROOM_CODE, name, nameKey, email, emailKey })
    .onConflictDoUpdate({ target: [players.roomCode, players.emailKey], set: { name, nameKey, email } })
    .returning({ id: players.id, score: players.score });
  if (!player) return Response.json({ error: "Could not join the room." }, { status: 500 });

  const response = Response.json({ player: { id: player.id, name, score: player.score } }, { status: 201 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${PLAYER_COOKIE}=${encodeURIComponent(player.id)}; Path=/; Max-Age=43200; HttpOnly${secure}; SameSite=Strict`);
  return response;
}

export async function DELETE() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get(PLAYER_COOKIE)?.value;
  if (playerId) {
    const db = getDb();
    await db.delete(guesses).where(eq(guesses.playerId, playerId));
    await db.delete(players).where(eq(players.id, playerId));
  }
  const response = Response.json({ removed: Boolean(playerId) });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `${PLAYER_COOKIE}=; Path=/; Max-Age=0; HttpOnly${secure}; SameSite=Strict`);
  return response;
}
