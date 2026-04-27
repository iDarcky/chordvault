-- Update the profiles.plan check constraint to include the new tier names.
-- The old constraint likely only allowed ('free', 'private', 'team') or similar.
-- The new 4-tier model is: free, sync, team, church.

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'sync', 'team', 'church'));
