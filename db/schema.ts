import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomCode: text("room_code").notNull(),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull(),
  score: integer("score").notNull().default(0),
  joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("players_room_name_key").on(table.roomCode, table.nameKey),
  index("players_room_score_idx").on(table.roomCode, table.score.desc(), table.joinedAt.asc()),
]);

export const gameState = pgTable("game_state", {
  roomCode: text("room_code").primaryKey(),
  roundIndex: integer("round_index").notNull().default(0),
  clueIndex: integer("clue_index").notNull().default(0),
  answerRevealed: boolean("answer_revealed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const guesses = pgTable("guesses", {
  id: serial("id").primaryKey(),
  roomCode: text("room_code").notNull(),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  roundIndex: integer("round_index").notNull(),
  clueIndex: integer("clue_index").notNull(),
  guess: text("guess").notNull(),
  correct: boolean("correct").notNull(),
  points: integer("points").notNull().default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("guesses_player_round").on(table.playerId, table.roundIndex),
  index("guesses_room_round_submitted_idx").on(table.roomCode, table.roundIndex, table.submittedAt),
]);
