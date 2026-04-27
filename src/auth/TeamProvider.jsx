import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './useAuth';
import { TeamContext } from './TeamContext';

/**
 * Provides team state to the component tree. Only fetches from Supabase when
 * the user is signed in and has a team/church plan. For free/sync users, the
 * context value is a no-op stub so consumers can safely call any method.
 */
export function TeamProvider({ children }) {
  const { user, profile } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadedForUserRef = useRef(null);

  const plan = (profile?.plan || 'free').toLowerCase();
  const hasTeamPlan = plan === 'team' || plan === 'church';

  // Load the user's team when their identity or plan changes.
  useEffect(() => {
    if (!supabase || !user?.id || !hasTeamPlan) {
      setTeam(null);
      setMembers([]);
      loadedForUserRef.current = null;
      return;
    }
    if (loadedForUserRef.current === user.id) return;
    loadedForUserRef.current = user.id;

    (async () => {
      setLoading(true);
      try {
        // Find the user's team membership(s). For MVP, we take the first team.
        const { data: membership } = await supabase
          .from('team_members')
          .select('team_id, role')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (!membership) {
          setTeam(null);
          setMembers([]);
          return;
        }

        // Load the team details.
        const { data: teamRow } = await supabase
          .from('teams')
          .select('*')
          .eq('id', membership.team_id)
          .maybeSingle();

        if (teamRow) setTeam(teamRow);

        // Load all members.
        const { data: memberRows } = await supabase
          .from('team_members')
          .select('id, user_id, role, joined_at')
          .eq('team_id', membership.team_id);

        setMembers(memberRows || []);
      } catch (err) {
        console.error('[team] Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, hasTeamPlan]);

  // Reset on sign-out.
  useEffect(() => {
    if (!user?.id) loadedForUserRef.current = null;
  }, [user?.id]);

  const value = useMemo(() => {
    const guard = () => {
      if (!supabase) throw new Error('Supabase is not configured.');
      if (!user?.id) throw new Error('No user signed in.');
    };

    const isAdmin = team
      ? members.some(m => m.user_id === user?.id && m.role === 'admin')
      : false;

    return {
      team,
      members,
      loading,
      isAdmin,
      hasTeamPlan,

      /**
       * Create a new team. The caller becomes the owner + admin member.
       * @param {{ name: string, location?: string }} opts
       */
      createTeam: async ({ name, location }) => {
        guard();
        const maxSeats = plan === 'church' ? 30 : 10;
        const { data: newTeam, error: teamErr } = await supabase
          .from('teams')
          .insert({
            name,
            location: location || null,
            owner_id: user.id,
            plan,
            max_seats: maxSeats,
          })
          .select()
          .single();

        if (teamErr) throw teamErr;

        // Add the creator as admin.
        const { error: memberErr } = await supabase
          .from('team_members')
          .insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'admin',
          });

        if (memberErr) throw memberErr;

        setTeam(newTeam);
        setMembers([{ id: newTeam.id, user_id: user.id, role: 'admin', joined_at: new Date().toISOString() }]);
        return newTeam;
      },

      /**
       * Invite a user to the team by their auth user id.
       * In the future this could accept an email and resolve the user id.
       * @param {string} userId — the Supabase auth uid of the invitee
       */
      inviteMember: async (userId) => {
        guard();
        if (!team) throw new Error('No team exists.');
        if (members.length >= (team.max_seats || 10)) {
          throw new Error(`This team is at its ${team.max_seats}-seat limit. Upgrade your plan to add more members.`);
        }

        const { data, error } = await supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            user_id: userId,
            role: 'member',
            invited_by: user.id,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error('This user is already a member.');
          throw error;
        }

        setMembers(prev => [...prev, data]);
        return data;
      },

      /**
       * Remove a member from the team.
       * @param {string} memberId — the team_members.id to remove
       */
      removeMember: async (memberId) => {
        guard();
        if (!team) throw new Error('No team exists.');

        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId)
          .eq('team_id', team.id);

        if (error) throw error;
        setMembers(prev => prev.filter(m => m.id !== memberId));
      },

      /**
       * Leave the current team (as a non-owner member).
       */
      leaveTeam: async () => {
        guard();
        if (!team) throw new Error('No team exists.');
        if (team.owner_id === user.id) {
          throw new Error('The team owner cannot leave. Transfer ownership or delete the team instead.');
        }

        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('team_id', team.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setTeam(null);
        setMembers([]);
        loadedForUserRef.current = null;
      },

      /**
       * Update team details (name, location). Owner only.
       */
      updateTeam: async (updates) => {
        guard();
        if (!team) throw new Error('No team exists.');
        const { data, error } = await supabase
          .from('teams')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', team.id)
          .select()
          .single();
        if (error) throw error;
        setTeam(data);
        return data;
      },

      /**
       * Delete the team entirely. Owner only.
       */
      deleteTeam: async () => {
        guard();
        if (!team) throw new Error('No team exists.');
        const { error } = await supabase
          .from('teams')
          .delete()
          .eq('id', team.id);
        if (error) throw error;
        setTeam(null);
        setMembers([]);
        loadedForUserRef.current = null;
      },
    };
  }, [team, members, loading, user?.id, plan, hasTeamPlan]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
