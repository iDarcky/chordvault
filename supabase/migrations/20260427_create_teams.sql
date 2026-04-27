-- Teams & team membership for the Teams ($12/mo) and Church ($24/mo) tiers.
--
-- teams:        one row per team, owned by the creating user
-- team_members: join table linking users to teams with a role (admin | member)
--
-- Naming: teams have a `name` + optional `location` so two teams called
-- "Worship Band" at different churches are distinguishable.

-- ── Teams ──────────────────────────────────────────────────────────────────

create table if not exists public.teams (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  location   text,                        -- optional: "Grace Church, Austin TX"
  owner_id   uuid        not null references auth.users(id) on delete cascade,
  plan       text        not null default 'team'
                         check (plan in ('team', 'church')),
  max_seats  int         not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Team members ───────────────────────────────────────────────────────────

create table if not exists public.team_members (
  id         uuid        primary key default gen_random_uuid(),
  team_id    uuid        not null references public.teams(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  role       text        not null default 'member'
                         check (role in ('admin', 'member')),
  invited_by uuid        references auth.users(id),
  joined_at  timestamptz not null default now(),
  unique(team_id, user_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────

create index if not exists idx_team_members_user
  on public.team_members(user_id);
create index if not exists idx_team_members_team
  on public.team_members(team_id);

-- ── Row Level Security ─────────────────────────────────────────────────────

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Teams: members can read their own team(s).
create policy "Members can view their team"
  on public.teams for select
  using (
    id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- Teams: the owner can insert (create) teams.
create policy "Owner can create teams"
  on public.teams for insert
  with check (owner_id = auth.uid());

-- Teams: the owner can update their team.
create policy "Owner can update team"
  on public.teams for update
  using (owner_id = auth.uid());

-- Teams: the owner can delete their team.
create policy "Owner can delete team"
  on public.teams for delete
  using (owner_id = auth.uid());

-- Team members: members can see other members of their team.
create policy "Members can view team roster"
  on public.team_members for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- Team members: admins can add new members.
create policy "Admins can add members"
  on public.team_members for insert
  with check (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'admin'
    )
    -- Also allow the team owner to self-insert as admin during team creation
    or team_id in (
      select id from public.teams where owner_id = auth.uid()
    )
  );

-- Team members: admins can update member roles.
create policy "Admins can update members"
  on public.team_members for update
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Team members: admins can remove members; users can remove themselves.
create policy "Admins can remove members or self-leave"
  on public.team_members for delete
  using (
    user_id = auth.uid()
    or team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
