import { supabase } from '../auth/supabase';
import { SONGS_FOLDER, SETLISTS_FOLDER } from './constants';

export function createSupabaseTeamProvider(teamId) {
  if (!teamId) throw new Error('Team ID is required for SupabaseTeamProvider');

  let _tokens = null;

  return {
    name: `supabase-team:${teamId}`,
    displayName: 'Team Library',

    async connect() {
      // Supabase is always connected via the global client auth session
      return { connected: true };
    },

    async disconnect() {
      // No-op for Supabase; auth state is handled globally
    },

    isConnected() {
      return true; // Assume true, let RLS fail if they aren't signed in
    },

    setTokens(tokens) {
      _tokens = tokens;
    },

    async refreshToken(tokens) {
      // Supabase JS client handles its own token refresh automatically.
      return tokens;
    },

    async ensureFolder() {
      // No-op. Postgres tables don't need folders.
      return 'root';
    },

    async listFiles(folder) {
      if (folder === SONGS_FOLDER) {
        const { data, error } = await supabase
          .from('team_songs')
          .select('id, title, updated_at')
          .eq('team_id', teamId);
          
        if (error) throw new Error(error.message);
        
        return (data || []).map(row => ({
          id: row.id,
          name: `${row.title}.md`,
          modifiedTime: new Date(row.updated_at).toISOString(),
          size: 0 // Not tracked, engine.js doesn't strictly need it for comparison
        }));
      }
      
      if (folder === SETLISTS_FOLDER) {
        const { data, error } = await supabase
          .from('team_setlists')
          .select('id, name, updated_at')
          .eq('team_id', teamId);
          
        if (error) throw new Error(error.message);
        
        return (data || []).map(row => ({
          id: row.id,
          name: `${row.name}.json`,
          modifiedTime: new Date(row.updated_at).toISOString(),
          size: 0
        }));
      }

      return [];
    },

    async downloadFile(fileId) {
      // Because we map id to UUID, we first need to determine if it's a song or setlist
      // The easiest way is to try both, or we can just try songs first.
      // Wait, engine.js calls downloadFile(file.id). We know it's a UUID.
      
      let { data, error } = await supabase
        .from('team_songs')
        .select('content')
        .eq('id', fileId)
        .eq('team_id', teamId)
        .maybeSingle();

      if (data?.content) return data.content;

      // Try setlists
      const { data: slData, error: slError } = await supabase
        .from('team_setlists')
        .select('content')
        .eq('id', fileId)
        .eq('team_id', teamId)
        .maybeSingle();

      if (slData?.content) {
        return typeof slData.content === 'string' ? slData.content : JSON.stringify(slData.content);
      }

      throw new Error(`File not found in Postgres: ${fileId}`);
    },

    async uploadFile(folder, name, content, mimeType) {
      // engine.js passes the raw content. For setlists it's JSON, for songs it's Markdown.
      // We upsert based on title/name to match how the sync engine avoids duplicates.
      
      if (folder === SONGS_FOLDER) {
        const title = name.replace('.md', '');
        
        // Find if exists by title to update it instead of creating duplicate
        const { data: existing } = await supabase
          .from('team_songs')
          .select('id')
          .eq('team_id', teamId)
          .eq('title', title)
          .maybeSingle();

        const payload = {
          team_id: teamId,
          title,
          content,
          updated_at: new Date().toISOString()
        };

        let data, error;
        if (existing) {
          const res = await supabase
            .from('team_songs')
            .update(payload)
            .eq('id', existing.id)
            .select('id, title, updated_at')
            .single();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase
            .from('team_songs')
            .insert(payload)
            .select('id, title, updated_at')
            .single();
          data = res.data;
          error = res.error;
        }

        if (error) throw error;
        
        return {
          id: data.id,
          name: `${data.title}.md`,
          modifiedTime: new Date(data.updated_at).toISOString()
        };
      }
      
      if (folder === SETLISTS_FOLDER) {
        const slName = name.replace('.json', '');
        
        const { data: existing } = await supabase
          .from('team_setlists')
          .select('id')
          .eq('team_id', teamId)
          .eq('name', slName)
          .maybeSingle();

        const payload = {
          team_id: teamId,
          name: slName,
          content: typeof content === 'string' ? JSON.parse(content) : content,
          updated_at: new Date().toISOString()
        };

        let data, error;
        if (existing) {
          const res = await supabase
            .from('team_setlists')
            .update(payload)
            .eq('id', existing.id)
            .select('id, name, updated_at')
            .single();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase
            .from('team_setlists')
            .insert(payload)
            .select('id, name, updated_at')
            .single();
          data = res.data;
          error = res.error;
        }

        if (error) throw error;
        
        return {
          id: data.id,
          name: `${data.name}.json`,
          modifiedTime: new Date(data.updated_at).toISOString()
        };
      }
      
      throw new Error(`Unknown folder: ${folder}`);
    },

    async deleteFile(fileId) {
      // Try deleting from both
      await supabase.from('team_songs').delete().eq('id', fileId).eq('team_id', teamId);
      await supabase.from('team_setlists').delete().eq('id', fileId).eq('team_id', teamId);
    }
  };
}
