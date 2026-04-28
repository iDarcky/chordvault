-- Final fix for teams/members RLS visibility.
-- Ensures that team owners can always see their teams, which is critical
-- for self-enrolling as an admin during the creation process.

drop policy if exists "Members can view their team" on public.teams;

create policy "Members can view their team"
  on public.teams for select
  using (
    owner_id = auth.uid()
    or id in (select public.get_user_teams())
  );
