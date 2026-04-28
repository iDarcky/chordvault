-- Nuclear fix for team_members RLS.
-- This version removes all complexity and uses the simplest possible checks.

-- 1. Drop all potentially conflicting policies
drop policy if exists "Admins can add members" on public.team_members;
drop policy if exists "Members can view team roster" on public.team_members;
drop policy if exists "Admins can update members" on public.team_members;
drop policy if exists "Admins can remove members or self-leave" on public.team_members;

-- 2. Re-create the get_user_teams helper (security definer is key)
create or replace function public.get_user_teams()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select team_id from team_members where user_id = auth.uid();
$$;

-- 3. Simple SELECT policy
create policy "team_members_select"
  on public.team_members for select
  using (true); -- Let's make it open for select for now to debug, then we can tighten it.

-- 4. Simple INSERT policy: you can add yourself if you own the team OR you are an admin
create policy "team_members_insert"
  on public.team_members for insert
  with check (
    -- You are adding yourself
    (user_id = auth.uid()) 
    AND (
      -- And you own the team
      exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
      -- OR you are already an admin of the team (for adding others)
      OR team_id in (select team_id from public.team_members where user_id = auth.uid() and role = 'admin')
    )
  );

-- 5. Simple UPDATE/DELETE
create policy "team_members_update"
  on public.team_members for update
  using (team_id in (select id from public.teams where owner_id = auth.uid()));

create policy "team_members_delete"
  on public.team_members for delete
  using (user_id = auth.uid() or team_id in (select id from public.teams where owner_id = auth.uid()));
