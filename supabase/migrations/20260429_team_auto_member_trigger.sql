-- Automate team member creation via Trigger.
-- This ensures that the team owner is always added as an admin member 
-- immediately upon team creation, bypassing any RLS race conditions.

-- 1. Create the function that will handle the auto-insertion
create or replace function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'admin')
  on conflict (team_id, user_id) do nothing;
  return new;
end;
$$;

-- 2. Create the trigger
drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
  after insert on public.teams
  for each row execute function public.handle_new_team();

-- 3. Relax the team_members insert policy slightly to be safe 
-- (The trigger runs as security definer, so it bypasses RLS anyway)
drop policy if exists "Admins can add members" on public.team_members;
create policy "Admins can add members"
  on public.team_members for insert
  with check (
    -- Allow admins to add members
    team_id in (select public.get_user_admin_teams())
    -- Allow users to add themselves to teams they own
    or (user_id = auth.uid() and team_id in (select id from public.teams where owner_id = auth.uid()))
  );
