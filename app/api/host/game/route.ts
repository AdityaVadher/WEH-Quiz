import { cookies } from "next/headers";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { gameState, guesses, players } from "@/db/schema";
import { ensureGameState, getHostLeaderboard, ROOM_CODE } from "@/app/game-server";
import { quizRounds } from "@/app/quiz-data";
import { isHostRequestAuthorized } from "@/app/host/host-auth";

async function authorized() {
  const token = (await cookies()).get("founder_frenzy_host")?.value;
  return isHostRequestAuthorized(token);
}

export async function GET() {
  if (!(await authorized())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const state = await ensureGameState();
  const round = quizRounds[state.roundIndex] ?? quizRounds[0];
  const clue = round.clues[state.clueIndex] ?? round.clues[0];
  const db = getDb();
  const [leaderboard, liveGuesses] = await Promise.all([
    getHostLeaderboard(),
    db.select({ playerName: players.name, playerEmail: players.email, guess: guesses.guess, clueIndex: guesses.clueIndex, correct: guesses.correct, points: guesses.points })
      .from(guesses)
      .innerJoin(players, eq(players.id, guesses.playerId))
      .where(and(eq(guesses.roomCode, ROOM_CODE), eq(guesses.roundIndex, state.roundIndex)))
      .orderBy(asc(guesses.submittedAt)),
  ]);
  return Response.json({
    roomCode: ROOM_CODE,
    question: round.question,
    totalQuestions: quizRounds.length,
    clueIndex: state.clueIndex,
    clueNumber: state.clueIndex + 1,
    clue: clue.clue,
    points: clue.points,
    answer: round.answer,
    answerRevealed: state.answerRevealed,
    playerCount: leaderboard.length,
    answeredCount: liveGuesses.length,
    leaderboard: leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 })),
    guesses: liveGuesses.map((entry) => ({ ...entry, clueNumber: entry.clueIndex + 1 })),
  });
}

export async function POST(request: Request) {
  if (!(await authorized())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payload = (await request.json()) as { action?: string; question?: number };
  const state = await ensureGameState();
  const db = getDb();

  if (payload.action === "next_clue") {
    await db.update(gameState).set({ clueIndex: Math.min(state.clueIndex + 1, 4), updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "previous_clue") {
    await db.update(gameState).set({ clueIndex: Math.max(state.clueIndex - 1, 0), updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "reveal_answer") {
    await db.update(gameState).set({ answerRevealed: true, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "next_question") {
    await db.update(gameState).set({ roundIndex: Math.min(state.roundIndex + 1, quizRounds.length - 1), clueIndex: 0, answerRevealed: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "previous_question") {
    await db.update(gameState).set({ roundIndex: Math.max(state.roundIndex - 1, 0), clueIndex: 0, answerRevealed: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "set_question") {
    if (!Number.isInteger(payload.question) || !payload.question || payload.question < 1 || payload.question > quizRounds.length) {
      return Response.json({ error: `Question must be between 1 and ${quizRounds.length}.` }, { status: 400 });
    }
    await db.update(gameState).set({ roundIndex: payload.question - 1, clueIndex: 0, answerRevealed: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
  } else if (payload.action === "reset_question") {
    await db.transaction(async (tx) => {
      const roundGuesses = await tx.select({ playerId: guesses.playerId, points: guesses.points })
        .from(guesses)
        .where(and(eq(guesses.roomCode, ROOM_CODE), eq(guesses.roundIndex, state.roundIndex)));
      for (const guess of roundGuesses) {
        if (guess.points > 0) {
          await tx.update(players)
            .set({ score: sql`GREATEST(0, ${players.score} - ${guess.points})` })
            .where(and(eq(players.roomCode, ROOM_CODE), eq(players.id, guess.playerId)));
        }
      }
      await tx.delete(guesses).where(and(eq(guesses.roomCode, ROOM_CODE), eq(guesses.roundIndex, state.roundIndex)));
      await tx.update(gameState).set({ clueIndex: 0, answerRevealed: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
    });
  } else if (payload.action === "restart_game") {
    await db.transaction(async (tx) => {
      await tx.delete(guesses).where(eq(guesses.roomCode, ROOM_CODE));
      await tx.update(players).set({ score: 0 }).where(eq(players.roomCode, ROOM_CODE));
      await tx.update(gameState).set({ roundIndex: 0, clueIndex: 0, answerRevealed: false, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(gameState.roomCode, ROOM_CODE));
    });
  } else {
    return Response.json({ error: "Unknown host action." }, { status: 400 });
  }
  return Response.json({ ok: true });
}
