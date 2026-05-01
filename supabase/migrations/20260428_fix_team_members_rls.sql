-- Fix infinite recursion in team_members RLS policies
-- By using security definer functions, we bypass RLS for the membership checks,
-- breaking the infinite recursion loop when policies query the same table.

-- 1. Helper functions to check membership without triggering RLS
create or replace function public.get_user_teams()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select team_id from team_members where user_id = auth.uid();
$$;

create or replace function public.get_user_admin_teams()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select team_id from team_members where user_id = auth.uid() and role = 'admin';
$$;

-- 2. Update teams select policy
drop policy if exists "Members can view their team" on public.teams;
create policy "Members can view their team"
  on public.teams for select
  using (
    id in (select public.get_user_teams())
  );

-- 3. Update team_members policies to use the helper functions
drop policy if exists "Members can view team roster" on public.team_members;
create policy "Members can view team roster"
  on public.team_members for select
  using (
    team_id in (select public.get_user_teams())
  );

drop policy if exists "Admins can add members" on public.team_members;
create policy "Admins can add members"
  on public.team_members for insert
  with check (
    team_id in (select public.get_user_admin_teams())
    -- Also allow the team owner to self-insert as admin during team creation
    or team_id in (
      select id from public.teams where owner_id = auth.uid()
    )
  );

drop policy if exists "Admins can update members" on public.team_members;
create policy "Admins can update members"
  on public.team_members for update
  using (
    team_id in (select public.get_user_admin_teams())
  );

drop policy if exists "Admins can remove members or self-leave" on public.team_members;
create policy "Admins can remove members or self-leave"
  on public.team_members for delete
  using (
    user_id = auth.uid()
    or team_id in (select public.get_user_admin_teams())
  );
