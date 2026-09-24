alter table public.players
  add column if not exists email text,
  add column if not exists email_key text;

alter table public.players
  drop constraint if exists players_room_name_key;

create unique index if not exists players_room_email_key
  on public.players (room_code, email_key);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_email_length'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_email_length
      check (email is null or char_length(email) between 5 and 254);
  end if;
end $$;
