import { get, set, del } from 'idb-keyval';

const SONGS_KEY = 'chordvault:songs';
const SETLISTS_KEY = 'chordvault:setlists';
const SETTINGS_KEY = 'chordvault:settings';
const SYNC_KEY = 'chordvault:sync';

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
  defaultColumns: 'auto',
  defaultFontSize: 'M',
  pedalNext: 'ArrowRight',
  pedalPrev: 'ArrowLeft',
  onboardingComplete: false,
  showInlineNotes: true,
  inlineNoteStyle: 'dashes',
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

export async function clearAll() {
  await del(SONGS_KEY);
  await del(SETLISTS_KEY);
  await del(SETTINGS_KEY);
  await del(SYNC_KEY);
}
