// Cloud storage folder name
export const FOLDER_NAME = 'ChordVault';

// Setlists filename (prefixed to separate from song .md files)
export const SETLISTS_FILENAME = '_setlists.json';

// Google Drive
export const GOOGLE_CLIENT_ID = ''; // Set in Vercel env or replace after registering app
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Dropbox
export const DROPBOX_CLIENT_ID = ''; // Set after registering Dropbox app
export const DROPBOX_REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/dropbox` : '';

// OneDrive / Microsoft
export const MICROSOFT_CLIENT_ID = ''; // Set after registering Azure app
export const MICROSOFT_AUTHORITY = 'https://login.microsoftonline.com/common';
export const MICROSOFT_SCOPES = ['Files.ReadWrite'];

// Sync debounce (ms) — how long to wait after a local save before pushing
export const SYNC_DEBOUNCE_MS = 2000;
