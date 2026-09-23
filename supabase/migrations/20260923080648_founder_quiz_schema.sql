create extension if not exists pgcrypto;

create table public.players (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  name text not null check (char_length(name) between 2 and 28),
  name_key text not null,
  score integer not null default 0 check (score >= 0),
  joined_at timestamptz not null default now(),
  constraint players_room_name_key unique (room_code, name_key)
);

create index players_room_score_idx on public.players (room_code, score desc, joined_at asc);

create table public.game_state (
  room_code text primary key,
  round_index integer not null default 0 check (round_index >= 0),
  clue_index integer not null default 0 check (clue_index between 0 and 4),
  answer_revealed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.guesses (
  id serial primary key,
  room_code text not null,
  player_id uuid not null references public.players(id) on delete cascade,
  round_index integer not null check (round_index >= 0),
  clue_index integer not null check (clue_index between 0 and 4),
  guess text not null check (char_length(guess) between 1 and 80),
  correct boolean not null,
  points integer not null default 0 check (points >= 0),
  submitted_at timestamptz not null default now(),
  constraint guesses_player_round unique (player_id, round_index)
);

create index guesses_room_round_submitted_idx on public.guesses (room_code, round_index, submitted_at);

alter table public.players enable row level security;
alter table public.game_state enable row level security;
alter table public.guesses enable row level security;

revoke all on table public.players, public.game_state, public.guesses from anon, authenticated;
revoke all on sequence public.guesses_id_seq from anon, authenticated;

insert into public.game_state (room_code) values ('WEH-742') on conflict do nothing;
