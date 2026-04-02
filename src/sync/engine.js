import { getProvider } from './provider';
import { getSyncState, updateSyncManifest, updateSetlistManifest, updateTokens, isTokenExpired } from './tokens';
import { SONGS_FOLDER, SETLISTS_FOLDER, SYNC_DEBOUNCE_MS } from './constants';
import { parseSongMd, songToMd, generateId } from '../parser';

function quickHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function sanitizeFilename(name) {
  return (name || 'Untitled')
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Untitled';
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

    const manifest = { ...syncState.syncManifest };
    const slManifest = { ...syncState.setlistManifest };
    let songsChanged = false;
    let setlistsChanged = false;
    let updatedSongs = [...songs];
    let updatedSetlists = [...setlists];

    // Pull songs from Songs subfolder
    const songFiles = await provider.listFiles(SONGS_FOLDER);
    for (const file of songFiles) {
      if (!file.name.endsWith('.md')) continue;

      // Find matching manifest entry by remoteName or remoteId
      let songId = null;
      for (const [id, entry] of Object.entries(manifest)) {
        if (entry.remoteId === file.id || entry.remoteName === file.name) {
          songId = id;
          break;
        }
      }

      const manifestEntry = songId ? manifest[songId] : null;
      const remoteTime = new Date(file.modifiedTime).getTime();
      const lastSyncedTime = manifestEntry?.lastSyncedTime
        ? new Date(manifestEntry.lastSyncedTime).getTime()
        : 0;

      if (remoteTime > lastSyncedTime) {
        const content = await provider.downloadFile(file.id);
        const parsed = parseSongMd(content);

        if (songId) {
          // Update existing song (or re-add if missing from local state)
          const existingIdx = updatedSongs.findIndex(s => s.id === songId);
          if (existingIdx >= 0) {
            updatedSongs[existingIdx] = { ...parsed, id: songId };
          } else {
            updatedSongs.push({ ...parsed, id: songId });
          }
        } else {
          // New song from remote
          songId = generateId();
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

    // Pull setlists from Setlists subfolder
    const setlistFiles = await provider.listFiles(SETLISTS_FOLDER);
    for (const file of setlistFiles) {
      if (!file.name.endsWith('.json')) continue;

      let setlistId = null;
      for (const [id, entry] of Object.entries(slManifest)) {
        if (entry.remoteId === file.id || entry.remoteName === file.name) {
          setlistId = id;
          break;
        }
      }

      const manifestEntry = setlistId ? slManifest[setlistId] : null;
      const remoteTime = new Date(file.modifiedTime).getTime();
      const lastSyncedTime = manifestEntry?.lastSyncedTime
        ? new Date(manifestEntry.lastSyncedTime).getTime()
        : 0;

      if (remoteTime > lastSyncedTime) {
        const content = await provider.downloadFile(file.id);
        try {
          const remoteSetlist = JSON.parse(content);
          if (setlistId) {
            // Update existing setlist (or re-add if missing from local state)
            const existingIdx = updatedSetlists.findIndex(sl => sl.id === setlistId);
            if (existingIdx >= 0) {
              updatedSetlists[existingIdx] = remoteSetlist;
            } else {
              updatedSetlists.push(remoteSetlist);
            }
          } else {
            setlistId = remoteSetlist.id || generateId();
            const existingIdx = updatedSetlists.findIndex(sl => sl.id === setlistId);
            if (existingIdx >= 0) {
              updatedSetlists[existingIdx] = remoteSetlist;
            } else {
              updatedSetlists.push(remoteSetlist);
            }
          }

          slManifest[setlistId] = {
            remoteId: file.id,
            remoteName: file.name,
            lastSyncedHash: quickHash(content),
            lastSyncedTime: file.modifiedTime,
          };
          setlistsChanged = true;
        } catch (err) {
          console.error(`Failed to parse setlist JSON "${file.name}":`, err);
        }
      }
    }

    if (songsChanged) await updateSyncManifest(manifest);
    if (setlistsChanged) await updateSetlistManifest(slManifest);

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
    const slManifest = { ...syncState.setlistManifest };

    // Push songs
    for (const song of songs) {
      try {
        const md = songToMd(song);
        const hash = quickHash(md);
        const entry = manifest[song.id];
        const fileName = `${sanitizeFilename(song.title)}.md`;

        // Detect rename: title changed, old file exists
        if (entry && entry.remoteName && entry.remoteName !== fileName) {
          try {
            await provider.deleteFile(entry.remoteId);
          } catch { /* old file may not exist */ }
        }

        if (!entry || entry.lastSyncedHash !== hash || entry.remoteName !== fileName) {
          const result = await provider.uploadFile(SONGS_FOLDER, fileName, md, 'text/markdown');
          manifest[song.id] = {
            remoteId: result.id,
            remoteName: result.name,
            lastSyncedHash: hash,
            lastSyncedTime: result.modifiedTime,
          };
        }
      } catch (err) {
        console.error(`Failed to sync song "${song.title}":`, err);
      }
    }

    await updateSyncManifest(manifest);

    // Push setlists (each as individual .json file)
    for (const sl of setlists) {
      try {
        const json = JSON.stringify(sl, null, 2);
        const hash = quickHash(json);
        const entry = slManifest[sl.id];
        const fileName = `${sanitizeFilename(sl.name || 'Untitled Setlist')}.json`;

        // Detect rename
        if (entry && entry.remoteName && entry.remoteName !== fileName) {
          try {
            await provider.deleteFile(entry.remoteId);
          } catch { /* old file may not exist */ }
        }

        if (!entry || entry.lastSyncedHash !== hash || entry.remoteName !== fileName) {
          const result = await provider.uploadFile(SETLISTS_FOLDER, fileName, json, 'application/json');
          slManifest[sl.id] = {
            remoteId: result.id,
            remoteName: result.name,
            lastSyncedHash: hash,
            lastSyncedTime: result.modifiedTime,
          };
        }
      } catch (err) {
        console.error(`Failed to sync setlist "${sl.name}":`, err);
      }
    }

    await updateSetlistManifest(slManifest);
  }

  return {
    async fullSync(songs, setlists) {
      if (syncing) return { songs, setlists, changed: false };
      syncing = true;
      setStatus('syncing');

      try {
        const pullResult = await pull(songs, setlists);
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
