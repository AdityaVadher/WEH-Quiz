import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { guesses, players } from "@/db/schema";
import { normalizePlayerName, PLAYER_COOKIE, ROOM_CODE } from "@/app/game-server";

export async function POST(request: Request) {
  const payload = (await request.json()) as { name?: string; roomCode?: string };
  const name = payload.name?.trim().replace(/\s+/g, " ") ?? "";
  const roomCode = payload.roomCode?.trim().toUpperCase() ?? "";
  if (roomCode !== ROOM_CODE) return Response.json({ error: "That room code is not active." }, { status: 400 });
  if (name.length < 2 || name.length > 28) return Response.json({ error: "Use a name between 2 and 28 characters." }, { status: 400 });

  const db = getDb();
  const nameKey = normalizePlayerName(name);
  const [existing] = await db.select().from(players)
    .where(and(eq(players.roomCode, ROOM_CODE), eq(players.nameKey, nameKey)))
    .limit(1);
  const playerId = existing?.id ?? crypto.randomUUID();
  if (existing) {
    await db.update(players).set({ name }).where(eq(players.id, playerId));
  } else {
    await db.insert(players).values({ id: playerId, roomCode: ROOM_CODE, name, nameKey });
  }

  const response = Response.json({ player: { id: playerId, name, score: existing?.score ?? 0 } }, { status: 201 });
  response.headers.append("Set-Cookie", `${PLAYER_COOKIE}=${encodeURIComponent(playerId)}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict`);
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
  response.headers.append("Set-Cookie", `${PLAYER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
  return response;
}
