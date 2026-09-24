import { cookies } from "next/headers";
import { getLeaderboard, getPlayerWithGuess, PLAYER_COOKIE, ROOM_CODE, ensureGameState } from "@/app/game-server";
import { quizRounds } from "@/app/quiz-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await ensureGameState();
  const round = quizRounds[state.roundIndex] ?? quizRounds[0];
  const clue = round.clues[state.clueIndex] ?? round.clues[0];
  const playerId = (await cookies()).get(PLAYER_COOKIE)?.value;
  const [playerState, leaderboard] = await Promise.all([
    getPlayerWithGuess(playerId, state.roundIndex),
    getLeaderboard(),
  ]);
  const { player, playerGuess } = playerState;

  return Response.json({
    roomCode: ROOM_CODE,
    question: round.question,
    totalQuestions: quizRounds.length,
    clueIndex: state.clueIndex,
    clueNumber: state.clueIndex + 1,
    clue: clue.clue,
    points: clue.points,
    answerRevealed: state.answerRevealed,
    answer: state.answerRevealed ? round.answer : null,
    player: player ? {
      id: player.id,
      name: player.name,
      score: player.score,
      guess: playerGuess ? {
        text: playerGuess.guess,
        clueNumber: playerGuess.clueIndex + 1,
        correct: state.answerRevealed ? playerGuess.correct : null,
        points: state.answerRevealed ? playerGuess.points : null,
      } : null,
    } : null,
    leaderboard: leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 })),
  });
}
