import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { gameState, guesses, players } from "@/db/schema";

export const ROOM_CODE = "WEH-742";
export const PLAYER_COOKIE = "founder_frenzy_player";

export async function ensureGameState() {
  const db = getDb();
  const [existingState] = await db.select().from(gameState).where(eq(gameState.roomCode, ROOM_CODE)).limit(1);
  if (existingState) return existingState;

  const [createdState] = await db.insert(gameState)
    .values({ roomCode: ROOM_CODE })
    .onConflictDoNothing()
    .returning();
  if (createdState) return createdState;

  // Another request may have created the singleton row concurrently.
  const [concurrentState] = await db.select().from(gameState).where(eq(gameState.roomCode, ROOM_CODE)).limit(1);
  if (!concurrentState) throw new Error("Game state could not be initialized.");
  return concurrentState;
}

export async function getLeaderboard() {
  return getDb().select({ id: players.id, name: players.name, score: players.score })
    .from(players)
    .where(eq(players.roomCode, ROOM_CODE))
    .orderBy(desc(players.score), asc(players.joinedAt), asc(players.name));
}

export async function getHostLeaderboard() {
  return getDb().select({ id: players.id, name: players.name, email: players.email, score: players.score })
    .from(players)
    .where(eq(players.roomCode, ROOM_CODE))
    .orderBy(desc(players.score), asc(players.joinedAt), asc(players.name));
}

export async function getPlayer(playerId: string | undefined) {
  if (!playerId) return null;
  const [player] = await getDb().select().from(players).where(and(eq(players.id, playerId), eq(players.roomCode, ROOM_CODE))).limit(1);
  return player ?? null;
}

export async function getPlayerWithGuess(playerId: string | undefined, roundIndex: number) {
  if (!playerId) return { player: null, playerGuess: null };
  const [result] = await getDb().select({ player: players, playerGuess: guesses })
    .from(players)
    .leftJoin(guesses, and(eq(guesses.playerId, players.id), eq(guesses.roundIndex, roundIndex)))
    .where(and(eq(players.id, playerId), eq(players.roomCode, ROOM_CODE)))
    .limit(1);
  return result ?? { player: null, playerGuess: null };
}

export function normalizePlayerName(name: string): string {
  return name.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}

export function normalizePlayerEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en");
}
