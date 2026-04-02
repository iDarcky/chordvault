import { loadSyncState, saveSyncState } from '../storage';

const SYNC_DEFAULTS = {
  activeProvider: null,
  tokens: null,
  lastSyncTime: null,
  syncManifest: {},
  setlistManifest: {},
};

export async function getSyncState() {
  const state = await loadSyncState();
  return { ...SYNC_DEFAULTS, ...(state || {}) };
}

export async function setActiveProvider(providerName, tokens) {
  const state = await getSyncState();
  state.activeProvider = providerName;
  state.tokens = tokens;
  await saveSyncState(state);
  return state;
}

export async function clearProvider() {
  const state = await getSyncState();
  state.activeProvider = null;
  state.tokens = null;
  await saveSyncState(state);
  return state;
}

export async function updateTokens(tokens) {
  const state = await getSyncState();
  state.tokens = { ...state.tokens, ...tokens };
  await saveSyncState(state);
}

export async function updateSyncManifest(manifest) {
  const state = await getSyncState();
  state.syncManifest = manifest;
  state.lastSyncTime = new Date().toISOString();
  await saveSyncState(state);
  return state;
}

export async function updateSetlistManifest(manifest) {
  const state = await getSyncState();
  state.setlistManifest = manifest;
  state.lastSyncTime = new Date().toISOString();
  await saveSyncState(state);
  return state;
}

export function isTokenExpired(tokens) {
  if (!tokens?.expiresAt) return true;
  // Consider expired if less than 5 min remaining
  return Date.now() > tokens.expiresAt - 5 * 60 * 1000;
}
