-- ── Team Invites ─────────────────────────────────────────────────────────────
-- Holds pending email invitations for users who don't have an account yet.

create table if not exists public.team_invites (
  id         uuid        primary key default gen_random_uuid(),
  team_id    uuid        not null references public.teams(id) on delete cascade,
  email      text        not null,
  role       text        not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid        references auth.users(id),
  created_at timestamptz not null default now(),
  unique(team_id, email)
);

-- RLS: Only admins/owners can see or manage invites for their teams.
alter table public.team_invites enable row level security;

create policy "Admins can view invites"
  on public.team_invites for select
  using (
    team_id in (select public.get_user_admin_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

create policy "Admins can delete invites"
  on public.team_invites for delete
  using (
    team_id in (select public.get_user_admin_teams())
    or team_id in (select id from public.teams where owner_id = auth.uid())
  );

-- ── RPC: Invite User to Team ───────────────────────────────────────────────
-- Safely looks up an email in auth.users. 
-- If found, inserts to team_members. If not, inserts to team_invites.
create or replace function public.invite_user_to_team(
  p_team_id uuid,
  p_email text,
  p_role text default 'member'
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_member_id uuid;
  v_max_seats int;
  v_current_seats int;
  v_is_admin boolean;
  v_owner_id uuid;
begin
  -- 1. Check permissions (must be team admin or owner)
  select owner_id into v_owner_id from teams where id = p_team_id;
  
  select true into v_is_admin 
  from team_members 
  where team_id = p_team_id and user_id = auth.uid() and role = 'admin';
  
  if v_owner_id != auth.uid() and not coalesce(v_is_admin, false) then
    raise exception 'You must be an admin to invite members.';
  end if;

  -- 2. Check seat limits
  select max_seats into v_max_seats from teams where id = p_team_id;
  select count(*) into v_current_seats from team_members where team_id = p_team_id;
  
  if v_current_seats >= v_max_seats then
    raise exception 'Team is at maximum capacity (%). Upgrade plan for more seats.', v_max_seats;
  end if;

  -- 3. Check if they are already in the team
  select id into v_user_id from auth.users where email = p_email;
  
  if v_user_id is not null then
    if exists (select 1 from team_members where team_id = p_team_id and user_id = v_user_id) then
      raise exception 'User is already a member of this team.';
    end if;

    -- Add to team instantly
    insert into team_members (team_id, user_id, role, invited_by)
    values (p_team_id, v_user_id, p_role, auth.uid())
    returning id into v_member_id;
    
    return json_build_object('status', 'added', 'user_id', v_user_id, 'member_id', v_member_id);
  else
    -- Doesn't exist, store in invites
    if exists (select 1 from team_invites where team_id = p_team_id and email = p_email) then
      raise exception 'An invite is already pending for this email.';
    end if;

    insert into team_invites (team_id, email, role, invited_by)
    values (p_team_id, p_email, p_role, auth.uid());
    
    return json_build_object('status', 'invited', 'email', p_email);
  end if;
end;
$$;

-- ── RPC: Claim Team Invites ────────────────────────────────────────────────
-- Called when a user logs in. Moves any pending invites for their email into memberships.
create or replace function public.claim_team_invites()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_invite record;
begin
  select email into v_email from auth.users where id = auth.uid();
  
  if v_email is null then return; end if;

  for v_invite in select * from team_invites where email = v_email
  loop
    -- Insert into team members if not already there
    if not exists (select 1 from team_members where team_id = v_invite.team_id and user_id = auth.uid()) then
      insert into team_members (team_id, user_id, role, invited_by)
      values (v_invite.team_id, auth.uid(), v_invite.role, v_invite.invited_by);
    end if;
    
    -- Delete the invite
    delete from team_invites where id = v_invite.id;
  end loop;
end;
$$;
