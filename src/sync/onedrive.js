import { MICROSOFT_CLIENT_ID, MICROSOFT_AUTHORITY, MICROSOFT_SCOPES, FOLDER_NAME } from './constants';

let msalInstance = null;

async function loadMsal() {
  if (msalInstance) return msalInstance;

  // Dynamically import MSAL from CDN
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

  return {
    name: 'onedrive',
    displayName: 'OneDrive',

    async connect() {
      const msal = await loadMsal();
      const response = await msal.loginPopup({
        scopes: MICROSOFT_SCOPES,
      });

      account = response.account;

      // Get access token
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
      try {
        await graph(`/me/drive/root:/${FOLDER_NAME}`);
      } catch {
        await graph('/me/drive/root/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: FOLDER_NAME,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'fail',
          }),
        });
      }
      return FOLDER_NAME;
    },

    async listFiles() {
      try {
        const result = await graph(`/me/drive/root:/${FOLDER_NAME}:/children?$select=id,name,lastModifiedDateTime,size`);
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

    async uploadFile(name, content) {
      const result = await graph(`/me/drive/root:/${FOLDER_NAME}/${name}:/content`, {
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
      // Get download URL
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
