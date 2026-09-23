import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { guesses, players } from "@/db/schema";
import { ensureGameState, getPlayer, PLAYER_COOKIE, ROOM_CODE } from "@/app/game-server";
import { isCorrectGuess, quizRounds } from "@/app/quiz-data";

export async function POST(request: Request) {
  const playerId = (await cookies()).get(PLAYER_COOKIE)?.value;
  const player = await getPlayer(playerId);
  if (!player) return Response.json({ error: "Join the room before guessing." }, { status: 401 });

  const state = await ensureGameState();
  if (state.answerRevealed) return Response.json({ error: "This round is already closed." }, { status: 409 });
  const payload = (await request.json()) as { guess?: string };
  const guess = payload.guess?.trim() ?? "";
  if (!guess || guess.length > 80) return Response.json({ error: "Enter a valid founder name." }, { status: 400 });

  const round = quizRounds[state.roundIndex] ?? quizRounds[0];
  const clue = round.clues[state.clueIndex] ?? round.clues[0];
  const correct = isCorrectGuess(round, guess);
  const points = correct ? clue.points : 0;
  const db = getDb();
  const inserted = await db.insert(guesses).values({
    roomCode: ROOM_CODE,
    playerId: player.id,
    roundIndex: state.roundIndex,
    clueIndex: state.clueIndex,
    guess,
    correct,
    points,
  }).onConflictDoNothing().returning({ id: guesses.id });

  if (!inserted.length) return Response.json({ error: "You have already guessed in this round." }, { status: 409 });
  if (points) await db.update(players).set({ score: sql`${players.score} + ${points}` }).where(eq(players.id, player.id));
  return Response.json({ locked: true, clueNumber: state.clueIndex + 1 });
}
