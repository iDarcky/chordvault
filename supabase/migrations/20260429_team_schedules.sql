-- ── Team Schedules ────────────────────────────────────────────────────────
-- Tracks which members are scheduled for which team setlist, and what their role is.

create table if not exists public.team_schedules (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  setlist_id uuid not null references public.team_setlists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  availability text not null default 'pending'
    check (availability in ('pending', 'available', 'unavailable', 'maybe')),
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(setlist_id, user_id)
);

-- Index for fast lookup by user and setlist
create index if not exists idx_team_schedules_team on public.team_schedules(team_id);
create index if not exists idx_team_schedules_user on public.team_schedules(user_id);
create index if not exists idx_team_schedules_setlist on public.team_schedules(setlist_id);

-- RLS
alter table public.team_schedules enable row level security;

drop policy if exists "Team members can view schedules" on public.team_schedules;
create policy "Team members can view schedules"
  on public.team_schedules for select
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

drop policy if exists "Team members can insert schedules" on public.team_schedules;
create policy "Team members can insert schedules"
  on public.team_schedules for insert
  with check (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

drop policy if exists "Team members can update schedules" on public.team_schedules;
create policy "Team members can update schedules"
  on public.team_schedules for update
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

drop policy if exists "Team members can delete schedules" on public.team_schedules;
create policy "Team members can delete schedules"
  on public.team_schedules for delete
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );
