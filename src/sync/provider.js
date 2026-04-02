import { createGoogleDriveProvider } from './google-drive';
import { createDropboxProvider } from './dropbox';
import { createOneDriveProvider } from './onedrive';

/**
 * Provider interface — each provider must implement:
 *
 * {
 *   name: string,
 *   displayName: string,
 *   connect()            -> Promise<{ accessToken, refreshToken?, expiresAt }>
 *   disconnect()         -> Promise<void>
 *   isConnected()        -> boolean
 *   refreshToken(tokens) -> Promise<{ accessToken, expiresAt }>
 *   ensureFolder()       -> Promise<folderId|folderPath>
 *   listFiles()          -> Promise<FileEntry[]>    // { name, id, modifiedTime, size }
 *   uploadFile(name, content, mimeType?) -> Promise<FileEntry>
 *   downloadFile(fileId)  -> Promise<string>
 *   deleteFile(fileId)    -> Promise<void>
 * }
 */

const providers = {
  'google-drive': createGoogleDriveProvider,
  'dropbox': createDropboxProvider,
  'onedrive': createOneDriveProvider,
};

let cachedProviders = {};

export function getProvider(name) {
  if (!providers[name]) {
    throw new Error(`Unknown sync provider: ${name}`);
  }
  if (!cachedProviders[name]) {
    cachedProviders[name] = providers[name]();
  }
  return cachedProviders[name];
}

export function getAvailableProviders() {
  return [
    { name: 'google-drive', displayName: 'Google Drive', icon: '\uD83D\uDCBE' },
    { name: 'dropbox', displayName: 'Dropbox', icon: '\uD83D\uDCE6' },
    { name: 'onedrive', displayName: 'OneDrive', icon: '\u2601\uFE0F' },
  ];
}
