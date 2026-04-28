-- Direct fix for team_members INSERT policy.
-- This version uses a more direct check to avoid potential subquery/RLS issues.

-- 1. Ensure the SELECT policy on teams is correct (redundant but safe)
drop policy if exists "Members can view their team" on public.teams;
create policy "Members can view their team"
  on public.teams for select
  using (
    owner_id = auth.uid()
    or id in (select public.get_user_teams())
  );

-- 2. Create a security definer function to check team ownership safely
create or replace function public.is_team_owner(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teams where id = p_team_id and owner_id = auth.uid()
  );
$$;

-- 3. Update the team_members insert policy to use this function
drop policy if exists "Admins can add members" on public.team_members;
create policy "Admins can add members"
  on public.team_members for insert
  with check (
    -- Allow admins to add members
    team_id in (select public.get_user_admin_teams())
    -- OR allow the team owner to self-insert (critical for team creation)
    or public.is_team_owner(team_id)
  );
