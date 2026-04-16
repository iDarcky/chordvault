import { get, set, del } from 'idb-keyval';

const SONGS_KEY = 'chordvault:songs';
const SETLISTS_KEY = 'chordvault:setlists';
const SETTINGS_KEY = 'chordvault:settings';
const SYNC_KEY = 'chordvault:sync';
const TOMBSTONES_KEY = 'chordvault:tombstones';

const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function pruneTombstones(t) {
  const cutoff = Date.now() - TOMBSTONE_TTL_MS;
  return {
    songs: (t?.songs || []).filter(e => e.deletedAt > cutoff),
    setlists: (t?.setlists || []).filter(e => e.deletedAt > cutoff),
  };
}

export async function loadSongs() {
  try {
    return (await get(SONGS_KEY)) || [];
  } catch {
    return [];
  }
}

export async function saveSongs(songs) {
  await set(SONGS_KEY, songs);
}

export async function loadSetlists() {
  try {
    return (await get(SETLISTS_KEY)) || [];
  } catch {
    return [];
  }
}

export async function saveSetlists(setlists) {
  await set(SETLISTS_KEY, setlists);
}

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  userName: '',
  defaultColumns: 'auto',
  defaultFontSize: 'M',
  pedalNext: 'ArrowRight',
  pedalPrev: 'ArrowLeft',
  onboardingComplete: false,
  showInlineNotes: true,
  inlineNoteStyle: 'dashes',
  displayRole: 'leader',
  duplicateSections: 'full',
  chartLayout: 'columns',
};

export async function loadSettings() {
  try {
    const s = await get(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...s };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  await set(SETTINGS_KEY, settings);
}

export async function loadSyncState() {
  try {
    return (await get(SYNC_KEY)) || null;
  } catch {
    return null;
  }
}

export async function saveSyncState(state) {
  await set(SYNC_KEY, state);
}

export async function loadTombstones() {
  try {
    return pruneTombstones(await get(TOMBSTONES_KEY));
  } catch {
    return { songs: [], setlists: [] };
  }
}

export async function saveTombstones(tombstones) {
  await set(TOMBSTONES_KEY, pruneTombstones(tombstones));
}

export async function clearAll() {
  await del(SONGS_KEY);
  await del(SETLISTS_KEY);
  await del(SETTINGS_KEY);
  await del(SYNC_KEY);
  await del(TOMBSTONES_KEY);
}
