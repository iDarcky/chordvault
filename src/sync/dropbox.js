import { DROPBOX_CLIENT_ID, DROPBOX_REDIRECT_URI, FOLDER_NAME } from './constants';

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function createDropboxProvider() {
  let accessToken = null;
  let refreshTokenValue = null;
  const folderPath = `/${FOLDER_NAME}`;

  const rpc = (endpoint, body = null) => {
    return fetch(`https://api.dropboxapi.com/2${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then(async (r) => {
      if (!r.ok) throw new Error(`Dropbox API error: ${r.status} ${await r.text()}`);
      const text = await r.text();
      return text ? JSON.parse(text) : {};
    });
  };

  return {
    name: 'dropbox',
    displayName: 'Dropbox',

    async connect() {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Store verifier for the callback
      sessionStorage.setItem('dbx_code_verifier', codeVerifier);

      const params = new URLSearchParams({
        client_id: DROPBOX_CLIENT_ID,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        redirect_uri: DROPBOX_REDIRECT_URI,
        token_access_type: 'offline',
      });

      // Open popup for OAuth
      const width = 500, height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      return new Promise((resolve, reject) => {
        const popup = window.open(
          `https://www.dropbox.com/oauth2/authorize?${params}`,
          'dropbox_auth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        const interval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(interval);
              reject(new Error('Auth popup closed'));
              return;
            }
            const url = popup.location.href;
            if (url.startsWith(DROPBOX_REDIRECT_URI)) {
              clearInterval(interval);
              popup.close();
              const code = new URL(url).searchParams.get('code');
              if (!code) { reject(new Error('No auth code received')); return; }
              this._exchangeCode(code, codeVerifier).then(resolve).catch(reject);
            }
          } catch {
            // Cross-origin — popup hasn't redirected yet
          }
        }, 500);
      });
    },

    async _exchangeCode(code, codeVerifier) {
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: DROPBOX_CLIENT_ID,
          redirect_uri: DROPBOX_REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      }).then(r => r.json());

      accessToken = response.access_token;
      refreshTokenValue = response.refresh_token;

      return {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + response.expires_in * 1000,
      };
    },

    async disconnect() {
      if (accessToken) {
        try {
          await rpc('/auth/token/revoke');
        } catch { /* ignore */ }
      }
      accessToken = null;
      refreshTokenValue = null;
    },

    isConnected() {
      return !!accessToken;
    },

    async refreshToken(tokens) {
      const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken || refreshTokenValue,
          client_id: DROPBOX_CLIENT_ID,
        }),
      }).then(r => r.json());

      accessToken = response.access_token;
      return {
        accessToken: response.access_token,
        expiresAt: Date.now() + response.expires_in * 1000,
      };
    },

    setTokens(tokens) {
      accessToken = tokens.accessToken;
      if (tokens.refreshToken) refreshTokenValue = tokens.refreshToken;
    },

    async ensureFolder() {
      try {
        await rpc('/files/get_metadata', { path: folderPath });
      } catch {
        await rpc('/files/create_folder_v2', { path: folderPath });
      }
      return folderPath;
    },

    async listFiles() {
      try {
        const result = await rpc('/files/list_folder', { path: folderPath });
        let entries = result.entries || [];
        let cursor = result.cursor;
        let hasMore = result.has_more;

        while (hasMore) {
          const more = await rpc('/files/list_folder/continue', { cursor });
          entries = entries.concat(more.entries || []);
          cursor = more.cursor;
          hasMore = more.has_more;
        }

        return entries
          .filter(e => e['.tag'] === 'file')
          .map(e => ({
            id: e.path_lower,
            name: e.name,
            modifiedTime: e.server_modified,
            size: e.size,
          }));
      } catch {
        // Folder might not exist yet
        return [];
      }
    },

    async uploadFile(name, content) {
      const path = `${folderPath}/${name}`;
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            path,
            mode: 'overwrite',
            autorename: false,
          }),
          'Content-Type': 'application/octet-stream',
        },
        body: content,
      }).then(r => r.json());

      return {
        id: response.path_lower,
        name: response.name,
        modifiedTime: response.server_modified,
        size: response.size,
      };
    },

    async downloadFile(fileId) {
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path: fileId }),
        },
      });
      if (!response.ok) throw new Error(`Dropbox download error: ${response.status}`);
      return response.text();
    },

    async deleteFile(fileId) {
      await rpc('/files/delete_v2', { path: fileId });
    },
  };
}
