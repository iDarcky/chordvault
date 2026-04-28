import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../auth/supabase';
import { useAuth } from '../auth/useAuth';

export function useTeamSchedules(teamId) {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    if (!teamId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('team_schedules')
        .select(`
          *,
          user:user_id ( id, raw_user_meta_data, email )
        `)
        .eq('team_id', teamId);
      
      if (fetchErr) throw fetchErr;
      setSchedules(data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId, user]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Subscribe to changes
  useEffect(() => {
    if (!teamId) return;

    const channel = supabase.channel(`team_schedules_${teamId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_schedules', filter: `team_id=eq.${teamId}` },
        (payload) => {
          // Re-fetch everything on change to get user metadata joins correctly
          fetchSchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, fetchSchedules]);

  const updateSchedule = async (id, updates) => {
    try {
      const { error: updateErr } = await supabase
        .from('team_schedules')
        .update(updates)
        .eq('id', id);
      if (updateErr) throw updateErr;
      // Optimistic update
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const createSchedule = async (setlistId, userId, role = null, availability = 'pending') => {
    try {
      const { data, error: insertErr } = await supabase
        .from('team_schedules')
        .insert({
          team_id: teamId,
          setlist_id: setlistId,
          user_id: userId,
          role,
          availability
        })
        .select(`
          *,
          user:user_id ( id, raw_user_meta_data, email )
        `)
        .single();
      
      if (insertErr) throw insertErr;
      
      setSchedules(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating schedule:', err);
      throw err;
    }
  };

  const deleteSchedule = async (id) => {
    try {
      const { error: delErr } = await supabase
        .from('team_schedules')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting schedule:', err);
      throw err;
    }
  };

  return {
    schedules,
    loading,
    error,
    updateSchedule,
    createSchedule,
    deleteSchedule,
    refreshSchedules: fetchSchedules
  };
}
