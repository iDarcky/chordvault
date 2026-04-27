-- ── Team Library Tables ──────────────────────────────────────────────────────
-- These tables act as the remote sync target for team members.
-- They store the songs and setlists for a specific team.

create table if not exists public.team_songs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null,
  content text not null, -- Markdown content
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.team_setlists (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  content jsonb not null, -- Full setlist JSON
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.team_songs enable row level security;
alter table public.team_setlists enable row level security;

-- Songs Policies
create policy "Team members can view songs"
  on public.team_songs for select
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can insert songs"
  on public.team_songs for insert
  with check (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can update songs"
  on public.team_songs for update
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can delete songs"
  on public.team_songs for delete
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

-- Setlists Policies
create policy "Team members can view setlists"
  on public.team_setlists for select
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can insert setlists"
  on public.team_setlists for insert
  with check (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can update setlists"
  on public.team_setlists for update
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Team members can delete setlists"
  on public.team_setlists for delete
  using (
    team_id in (select public.get_user_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );
