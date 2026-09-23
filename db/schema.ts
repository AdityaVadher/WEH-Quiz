import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  roomCode: text("room_code").notNull(),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull(),
  score: integer("score").notNull().default(0),
  joinedAt: text("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("players_room_name_key").on(table.roomCode, table.nameKey)]);

export const gameState = sqliteTable("game_state", {
  roomCode: text("room_code").primaryKey(),
  roundIndex: integer("round_index").notNull().default(0),
  clueIndex: integer("clue_index").notNull().default(0),
  answerRevealed: integer("answer_revealed", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const guesses = sqliteTable("guesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomCode: text("room_code").notNull(),
  playerId: text("player_id").notNull(),
  roundIndex: integer("round_index").notNull(),
  clueIndex: integer("clue_index").notNull(),
  guess: text("guess").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  points: integer("points").notNull().default(0),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("guesses_player_round").on(table.playerId, table.roundIndex)]);
