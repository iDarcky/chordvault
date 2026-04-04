// Cloud storage folder name
export const FOLDER_NAME = 'SetlistsMD';

// Subfolders
export const SONGS_FOLDER = 'Songs';
export const SETLISTS_FOLDER = 'Setlists';

// Google Drive
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Dropbox
export const DROPBOX_CLIENT_ID = import.meta.env.VITE_DROPBOX_CLIENT_ID || '';
export const DROPBOX_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/dropbox` : '';

// OneDrive / Microsoft
export const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
export const MICROSOFT_AUTHORITY = 'https://login.microsoftonline.com/common';
export const MICROSOFT_SCOPES = ['Files.ReadWrite'];

// Sync debounce (ms) — how long to wait after a local save before pushing
export const SYNC_DEBOUNCE_MS = 2000;

// Check if a provider has its client ID configured
const CLIENT_ID_MAP = {
  'google-drive': GOOGLE_CLIENT_ID,
  'dropbox': DROPBOX_CLIENT_ID,
  'onedrive': MICROSOFT_CLIENT_ID,
};

export function isProviderConfigured(providerName) {
  return !!CLIENT_ID_MAP[providerName];
}
