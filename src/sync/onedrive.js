import { MICROSOFT_CLIENT_ID, MICROSOFT_AUTHORITY, MICROSOFT_SCOPES, FOLDER_NAME, SONGS_FOLDER, SETLISTS_FOLDER } from './constants';

let msalInstance = null;

async function loadMsal() {
  if (msalInstance) return msalInstance;

  if (!window.msal) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load MSAL'));
      document.head.appendChild(script);
    });
  }

  msalInstance = new window.msal.PublicClientApplication({
    auth: {
      clientId: MICROSOFT_CLIENT_ID,
      authority: MICROSOFT_AUTHORITY,
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',
    },
  });

  await msalInstance.initialize();
  return msalInstance;
}

export function createOneDriveProvider() {
  let accessToken = null;
  let account = null;

  const graph = (path, options = {}) => {
    const base = path.startsWith('https://') ? path : `https://graph.microsoft.com/v1.0${path}`;
    return fetch(base, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    }).then(async (r) => {
      if (!r.ok) throw new Error(`Graph API error: ${r.status} ${await r.text()}`);
      const ct = r.headers.get('content-type') || '';
      return ct.includes('json') ? r.json() : r.text();
    });
  };

  async function ensureDriveFolder(path) {
    try {
      await graph(`/me/drive/root:/${path}`);
    } catch {
      const parts = path.split('/');
      const name = parts.pop();
      const parent = parts.length > 0 ? `/me/drive/root:/${parts.join('/')}:/children` : '/me/drive/root/children';
      await graph(parent, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'fail',
        }),
      });
    }
  }

  return {
    name: 'onedrive',
    displayName: 'OneDrive',

    async connect() {
      if (!MICROSOFT_CLIENT_ID) throw new Error('OneDrive is not configured. Set VITE_MICROSOFT_CLIENT_ID.');
      const msal = await loadMsal();
      const response = await msal.loginPopup({
        scopes: MICROSOFT_SCOPES,
      });

      account = response.account;

      const tokenResponse = await msal.acquireTokenSilent({
        scopes: MICROSOFT_SCOPES,
        account,
      });

      accessToken = tokenResponse.accessToken;

      return {
        accessToken: tokenResponse.accessToken,
        expiresAt: tokenResponse.expiresOn.getTime(),
        accountId: account.homeAccountId,
      };
    },

    async disconnect() {
      if (msalInstance && account) {
        try {
          await msalInstance.logoutPopup({ account });
        } catch { /* ignore */ }
      }
      accessToken = null;
      account = null;
    },

    isConnected() {
      return !!accessToken;
    },

    async refreshToken(/* tokens */) {
      const msal = await loadMsal();
      const accounts = msal.getAllAccounts();
      const acct = accounts[0];
      if (!acct) throw new Error('No Microsoft account found. Please reconnect.');

      const response = await msal.acquireTokenSilent({
        scopes: MICROSOFT_SCOPES,
        account: acct,
      });

      accessToken = response.accessToken;
      account = acct;

      return {
        accessToken: response.accessToken,
        expiresAt: response.expiresOn.getTime(),
      };
    },

    setTokens(tokens) {
      accessToken = tokens.accessToken;
    },

    async ensureFolder() {
      await ensureDriveFolder(FOLDER_NAME);
      await ensureDriveFolder(`${FOLDER_NAME}/${SONGS_FOLDER}`);
      await ensureDriveFolder(`${FOLDER_NAME}/${SETLISTS_FOLDER}`);
      return FOLDER_NAME;
    },

    async listFiles(subfolder) {
      const path = `${FOLDER_NAME}/${subfolder}`;
      try {
        const result = await graph(`/me/drive/root:/${path}:/children?$select=id,name,lastModifiedDateTime,size`);
        return (result.value || []).map(f => ({
          id: f.id,
          name: f.name,
          modifiedTime: f.lastModifiedDateTime,
          size: f.size,
        }));
      } catch {
        return [];
      }
    },

    async uploadFile(subfolder, name, content) {
      const path = `${FOLDER_NAME}/${subfolder}/${name}`;
      const result = await graph(`/me/drive/root:/${path}:/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: content,
      });

      return {
        id: result.id,
        name: result.name,
        modifiedTime: result.lastModifiedDateTime,
        size: result.size,
      };
    },

    async downloadFile(fileId) {
      const item = await graph(`/me/drive/items/${fileId}`);
      const downloadUrl = item['@microsoft.graph.downloadUrl'];
      if (!downloadUrl) throw new Error('No download URL for file');
      const response = await fetch(downloadUrl);
      return response.text();
    },

    async deleteFile(fileId) {
      await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
  };
}
