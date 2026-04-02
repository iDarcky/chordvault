import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES, FOLDER_NAME } from './constants';

let gsiLoaded = false;
let tokenClient = null;

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (gsiLoaded) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => { gsiLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export function createGoogleDriveProvider() {
  let accessToken = null;
  let folderId = null;

  const api = (path, options = {}) => {
    const base = path.startsWith('https://') ? path : `https://www.googleapis.com/drive/v3${path}`;
    return fetch(base, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    }).then(async (r) => {
      if (!r.ok) throw new Error(`Google Drive API error: ${r.status} ${await r.text()}`);
      const ct = r.headers.get('content-type') || '';
      return ct.includes('json') ? r.json() : r.text();
    });
  };

  return {
    name: 'google-drive',
    displayName: 'Google Drive',

    async connect() {
      if (!GOOGLE_CLIENT_ID) throw new Error('Google Drive is not configured. Set VITE_GOOGLE_CLIENT_ID.');
      await loadGsi();
      return new Promise((resolve, reject) => {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            accessToken = response.access_token;
            const expiresAt = Date.now() + response.expires_in * 1000;
            resolve({
              accessToken: response.access_token,
              expiresAt,
            });
          },
        });
        tokenClient.requestAccessToken();
      });
    },

    async disconnect() {
      if (accessToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' });
        } catch { /* ignore */ }
      }
      accessToken = null;
      folderId = null;
      tokenClient = null;
    },

    isConnected() {
      return !!accessToken;
    },

    async refreshToken(/* tokens */) {
      // Google GSI handles refresh via requestAccessToken with prompt: ''
      await loadGsi();
      return new Promise((resolve, reject) => {
        if (!tokenClient) {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: (response) => {
              if (response.error) { reject(new Error(response.error)); return; }
              accessToken = response.access_token;
              resolve({ accessToken: response.access_token, expiresAt: Date.now() + response.expires_in * 1000 });
            },
          });
        }
        tokenClient.requestAccessToken({ prompt: '' });
      });
    },

    setTokens(tokens) {
      accessToken = tokens.accessToken;
    },

    async ensureFolder() {
      // Check if folder exists
      const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const result = await api(`/files?q=${q}&fields=files(id,name)`);
      if (result.files.length > 0) {
        folderId = result.files[0].id;
        return folderId;
      }
      // Create folder
      const folder = await api('/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      folderId = folder.id;
      return folderId;
    },

    async listFiles() {
      if (!folderId) await this.ensureFolder();
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const result = await api(`/files?q=${q}&fields=files(id,name,modifiedTime,size)&pageSize=1000`);
      return result.files.map(f => ({
        id: f.id,
        name: f.name,
        modifiedTime: f.modifiedTime,
        size: parseInt(f.size || '0', 10),
      }));
    },

    async uploadFile(name, content, mimeType = 'text/plain') {
      if (!folderId) await this.ensureFolder();

      // Check if file already exists
      const q = encodeURIComponent(`name='${name}' and '${folderId}' in parents and trashed=false`);
      const existing = await api(`/files?q=${q}&fields=files(id)`);

      const metadata = { name, parents: [folderId] };
      const boundary = '---chordvault_boundary';
      const body = [
        `--${boundary}`,
        'Content-Type: application/json; charset=UTF-8',
        '',
        JSON.stringify(metadata),
        `--${boundary}`,
        `Content-Type: ${mimeType}`,
        '',
        content,
        `--${boundary}--`,
      ].join('\r\n');

      if (existing.files.length > 0) {
        // Update existing file
        const fileId = existing.files[0].id;
        const result = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name,modifiedTime,size`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': mimeType,
          },
          body: content,
        }).then(r => r.json());
        return { id: result.id, name: result.name, modifiedTime: result.modifiedTime, size: parseInt(result.size || '0', 10) };
      }

      // Create new file with multipart upload
      const result = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }).then(r => r.json());

      return { id: result.id, name: result.name, modifiedTime: result.modifiedTime, size: parseInt(result.size || '0', 10) };
    },

    async downloadFile(fileId) {
      return api(`/files/${fileId}?alt=media`);
    },

    async deleteFile(fileId) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
  };
}
