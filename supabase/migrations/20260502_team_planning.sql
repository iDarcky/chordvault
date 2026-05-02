-- ── Team Planning ─────────────────────────────────────────────────────────
-- Per-team instrument tags for each member, and standalone date-based
-- availability (independent of any setlist) so members can declare which
-- Sundays they can serve before a setlist exists.

-- Instruments live on team_members so the same person can play different
-- instruments at different teams (e.g. drums at one church, guitar at another).
alter table public.team_members
  add column if not exists instruments text[] not null default '{}';

-- Standalone date-based availability.
create table if not exists public.team_availability (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  status text not null default 'available'
    check (status in ('available', 'unavailable', 'maybe')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(team_id, user_id, date)
);

create index if not exists idx_team_availability_team_date
  on public.team_availability(team_id, date);
create index if not exists idx_team_availability_user
  on public.team_availability(user_id);

alter table public.team_availability enable row level security;

-- Any member of the team can SEE the team's availability (so leaders can
-- see who's available on a given date).
drop policy if exists "Team members can view availability" on public.team_availability;
create policy "Team members can view availability"
  on public.team_availability for select
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

-- Only the user themselves can write their own availability.
drop policy if exists "Members manage own availability" on public.team_availability;
create policy "Members manage own availability"
  on public.team_availability for insert
  with check (user_id = auth.uid());

drop policy if exists "Members update own availability" on public.team_availability;
create policy "Members update own availability"
  on public.team_availability for update
  using (user_id = auth.uid());

drop policy if exists "Members delete own availability" on public.team_availability;
create policy "Members delete own availability"
  on public.team_availability for delete
  using (user_id = auth.uid());
