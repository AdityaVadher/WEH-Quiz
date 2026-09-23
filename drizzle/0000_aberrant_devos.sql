CREATE TABLE `game_state` (
	`room_code` text PRIMARY KEY NOT NULL,
	`round_index` integer DEFAULT 0 NOT NULL,
	`clue_index` integer DEFAULT 0 NOT NULL,
	`answer_revealed` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guesses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`room_code` text NOT NULL,
	`player_id` text NOT NULL,
	`round_index` integer NOT NULL,
	`clue_index` integer NOT NULL,
	`guess` text NOT NULL,
	`correct` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guesses_player_round` ON `guesses` (`player_id`,`round_index`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`room_code` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`joined_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_room_name_key` ON `players` (`room_code`,`name_key`);