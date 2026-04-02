import { getProvider } from './provider';
import { getSyncState, updateSyncManifest, updateSetlistsSyncInfo, updateTokens, isTokenExpired } from './tokens';
import { SETLISTS_FILENAME, SYNC_DEBOUNCE_MS } from './constants';
import { parseSongMd, songToMd } from '../parser';

function quickHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

let debounceTimer = null;

export function createSyncEngine(onStatusChange) {
  let syncing = false;

  const setStatus = (state, extra = {}) => {
    onStatusChange?.({ state, ...extra });
  };

  async function ensureAuth(provider, syncState) {
    if (!provider.isConnected() && syncState.tokens) {
      provider.setTokens(syncState.tokens);
    }
    if (isTokenExpired(syncState.tokens)) {
      try {
        const newTokens = await provider.refreshToken(syncState.tokens);
        await updateTokens(newTokens);
        provider.setTokens(newTokens);
      } catch {
        setStatus('error');
        throw new Error('Token refresh failed. Please reconnect.');
      }
    }
  }

  async function pull(songs, setlists) {
    const syncState = await getSyncState();
    if (!syncState.activeProvider) return { songs, setlists, changed: false };

    const provider = getProvider(syncState.activeProvider);
    await ensureAuth(provider, syncState);
    await provider.ensureFolder();

    const remoteFiles = await provider.listFiles();
    const manifest = { ...syncState.syncManifest };
    let songsChanged = false;
    let setlistsChanged = false;
    let updatedSongs = [...songs];
    let updatedSetlists = [...setlists];

    // Process song files (.md)
    for (const file of remoteFiles) {
      if (!file.name.endsWith('.md')) continue;

      const songId = file.name.replace('.md', '');
      const manifestEntry = manifest[songId];

      // Check if remote is newer than what we last synced
      const remoteTime = new Date(file.modifiedTime).getTime();
      const lastSyncedTime = manifestEntry?.lastSyncedTime
        ? new Date(manifestEntry.lastSyncedTime).getTime()
        : 0;

      if (remoteTime > lastSyncedTime) {
        // Download and parse
        const content = await provider.downloadFile(file.id);
        const parsed = parseSongMd(content);

        const existingIdx = updatedSongs.findIndex(s => s.id === songId);
        if (existingIdx >= 0) {
          // Update existing song
          updatedSongs[existingIdx] = { ...parsed, id: songId };
        } else {
          // New song from remote
          updatedSongs.push({ ...parsed, id: songId });
        }

        manifest[songId] = {
          remoteId: file.id,
          remoteName: file.name,
          lastSyncedHash: quickHash(content),
          lastSyncedTime: file.modifiedTime,
        };
        songsChanged = true;
      }
    }

    // Process setlists file
    const setlistsFile = remoteFiles.find(f => f.name === SETLISTS_FILENAME);
    if (setlistsFile) {
      const remoteTime = new Date(setlistsFile.modifiedTime).getTime();
      const lastTime = syncState.setlistsLastSyncedHash
        ? new Date(syncState.lastSyncTime || 0).getTime()
        : 0;

      if (remoteTime > lastTime) {
        const content = await provider.downloadFile(setlistsFile.id);
        try {
          const remoteSetlists = JSON.parse(content);
          // Merge: remote wins for conflicts (by setlist id)
          const mergedMap = new Map();
          updatedSetlists.forEach(sl => mergedMap.set(sl.id, sl));
          remoteSetlists.forEach(sl => mergedMap.set(sl.id, sl));
          updatedSetlists = Array.from(mergedMap.values());
          setlistsChanged = true;

          await updateSetlistsSyncInfo(setlistsFile.id, quickHash(content));
        } catch {
          // Invalid JSON — skip
        }
      }
    }

    if (songsChanged) {
      await updateSyncManifest(manifest);
    }

    return {
      songs: updatedSongs,
      setlists: updatedSetlists,
      changed: songsChanged || setlistsChanged,
    };
  }

  async function push(songs, setlists) {
    const syncState = await getSyncState();
    if (!syncState.activeProvider) return;

    const provider = getProvider(syncState.activeProvider);
    await ensureAuth(provider, syncState);
    await provider.ensureFolder();

    const manifest = { ...syncState.syncManifest };

    // Push songs
    for (const song of songs) {
      const md = songToMd(song);
      const hash = quickHash(md);
      const entry = manifest[song.id];

      if (!entry || entry.lastSyncedHash !== hash) {
        const fileName = `${song.id}.md`;
        const result = await provider.uploadFile(fileName, md, 'text/markdown');
        manifest[song.id] = {
          remoteId: result.id,
          remoteName: result.name,
          lastSyncedHash: hash,
          lastSyncedTime: result.modifiedTime,
        };
      }
    }

    await updateSyncManifest(manifest);

    // Push setlists
    const setlistsJson = JSON.stringify(setlists, null, 2);
    const setlistsHash = quickHash(setlistsJson);
    if (setlistsHash !== syncState.setlistsLastSyncedHash) {
      const result = await provider.uploadFile(SETLISTS_FILENAME, setlistsJson, 'application/json');
      await updateSetlistsSyncInfo(result.id, setlistsHash);
    }
  }

  return {
    async fullSync(songs, setlists) {
      if (syncing) return { songs, setlists, changed: false };
      syncing = true;
      setStatus('syncing');

      try {
        // Pull first
        const pullResult = await pull(songs, setlists);

        // Then push
        await push(pullResult.songs, pullResult.setlists);

        const lastSync = new Date().toISOString();
        const syncState = await getSyncState();
        setStatus('synced', { lastSync, provider: syncState.activeProvider });

        return pullResult;
      } catch (err) {
        console.error('Sync error:', err);
        setStatus('error');
        return { songs, setlists, changed: false };
      } finally {
        syncing = false;
      }
    },

    debouncedPush(songs, setlists) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const syncState = await getSyncState();
        if (!syncState.activeProvider) return;

        setStatus('syncing');
        try {
          await push(songs, setlists);
          const lastSync = new Date().toISOString();
          setStatus('synced', { lastSync, provider: syncState.activeProvider });
        } catch (err) {
          console.error('Sync push error:', err);
          setStatus('error');
        }
      }, SYNC_DEBOUNCE_MS);
    },

    cancelDebounce() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    },
  };
}
