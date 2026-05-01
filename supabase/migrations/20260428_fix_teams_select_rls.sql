-- Fix the teams SELECT policy so the owner can read the team immediately upon creation.
-- Previously, the SELECT policy required the user to be in team_members.
-- However, during team creation, the team is inserted first (with .select() to get the ID),
-- and the team_members row is inserted second. This caused an RLS violation because
-- the user wasn't in team_members yet when the returning clause fired.

drop policy if exists "Members can view their team" on public.teams;

create policy "Members can view their team"
  on public.teams for select
  using (
    owner_id = auth.uid()
    or id in (select public.get_user_teams())
  );
