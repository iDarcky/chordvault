// Supabase Edge Function: delete-account
//
// Purpose: permanently delete the calling user's auth record. Cascade-deletes
// profile + team_members rows via the FK constraints declared in the
// 20260427_create_teams.sql migration (ON DELETE CASCADE).
//
// Deploy:
//   supabase functions deploy delete-account --no-verify-jwt=false
//
// Env required (set in Supabase Project Settings → Functions):
//   SUPABASE_URL              — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — service role key, never expose to client
//
// Called from the client via:
//   supabase.functions.invoke('delete-account')
//
// The request must carry the user's JWT (Supabase client does this
// automatically when verify_jwt is enabled), so we trust auth.uid() to
// identify which user to remove.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DeleteResult {
  ok: boolean;
  error?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ ok: false, error: 'Server misconfiguration: missing env.' }, 500);
  }

  // Identify the caller from the JWT bound to the request.
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!jwt) {
    return json({ ok: false, error: 'Missing Authorization header.' }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return json({ ok: false, error: 'Not signed in.' }, 401);
  }

  const userId = userData.user.id;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // If the user is a team owner, we delete the team explicitly so we don't
  // orphan it. (RLS would block this from the client; service role bypasses.)
  // The team_members rows for the deleted user cascade via FK.
  try {
    const { data: ownedTeams } = await admin
      .from('teams')
      .select('id')
      .eq('owner_id', userId);
    if (ownedTeams && ownedTeams.length > 0) {
      await admin.from('teams').delete().in('id', ownedTeams.map(t => t.id));
    }
  } catch {
    // best-effort; continue to user delete
  }

  // Profile row will cascade from auth.users on delete; explicit delete kept
  // as a defence-in-depth in case the FK is missing in some environment.
  try {
    await admin.from('profiles').delete().eq('id', userId);
  } catch {
    // best-effort
  }

  const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
  if (deleteErr) {
    return json({ ok: false, error: deleteErr.message }, 500);
  }

  return json({ ok: true }, 200);
});

function json(body: DeleteResult, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
