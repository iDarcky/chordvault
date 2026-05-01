-- Add unique constraints to prevent duplicate songs/setlists within a team.
-- Without these, two members uploading a new song with the same title
-- concurrently can create duplicate rows (race condition).

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_songs_team_title
  ON public.team_songs(team_id, title);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_setlists_team_name
  ON public.team_setlists(team_id, name);

-- Also add missing WITH CHECK clauses to UPDATE policies.
-- Without WITH CHECK, a member could UPDATE a row's team_id to move it
-- to a different team they belong to.

DROP POLICY IF EXISTS "Team members can update songs" ON public.team_songs;
CREATE POLICY "Team members can update songs"
  ON public.team_songs FOR UPDATE
  USING (
    team_id IN (SELECT public.get_user_teams())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    team_id IN (SELECT public.get_user_teams())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Team members can update setlists" ON public.team_setlists;
CREATE POLICY "Team members can update setlists"
  ON public.team_setlists FOR UPDATE
  USING (
    team_id IN (SELECT public.get_user_teams())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    team_id IN (SELECT public.get_user_teams())
    OR team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
  );

-- Enable Realtime for the team library tables
-- This allows the app to listen for remote changes via postgres_changes.
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_songs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_setlists;
