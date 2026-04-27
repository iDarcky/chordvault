import { loadSyncState, saveSyncState } from '../storage';

const SYNC_DEFAULTS = {
  activeProvider: null,
  tokens: null,
  lastSyncTime: null,
  syncManifest: {},
  setlistManifest: {},
};

export async function getSyncState(libraryId = 'personal') {
  const state = await loadSyncState(libraryId);
  return { ...SYNC_DEFAULTS, ...(state || {}) };
}

export async function setActiveProvider(providerName, tokens, libraryId = 'personal') {
  const state = await getSyncState(libraryId);
  state.activeProvider = providerName;
  state.tokens = tokens;
  await saveSyncState(state, libraryId);
  return state;
}

export async function clearProvider(libraryId = 'personal') {
  const state = await getSyncState(libraryId);
  state.activeProvider = null;
  state.tokens = null;
  await saveSyncState(state, libraryId);
  return state;
}

export async function updateTokens(tokens, libraryId = 'personal') {
  const state = await getSyncState(libraryId);
  state.tokens = { ...state.tokens, ...tokens };
  await saveSyncState(state, libraryId);
}

export async function updateSyncManifest(manifest, libraryId = 'personal') {
  const state = await getSyncState(libraryId);
  state.syncManifest = manifest;
  state.lastSyncTime = new Date().toISOString();
  await saveSyncState(state, libraryId);
  return state;
}

export async function updateSetlistManifest(manifest, libraryId = 'personal') {
  const state = await getSyncState(libraryId);
  state.setlistManifest = manifest;
  state.lastSyncTime = new Date().toISOString();
  await saveSyncState(state, libraryId);
  return state;
}

export function isTokenExpired(tokens) {
  if (!tokens?.expiresAt) return true;
  // Consider expired if less than 5 min remaining
  return Date.now() > tokens.expiresAt - 5 * 60 * 1000;
}
