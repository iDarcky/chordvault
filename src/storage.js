import { get, set, del } from 'idb-keyval';

const SONGS_KEY = 'chordvault:songs';
const SETLISTS_KEY = 'chordvault:setlists';

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

export async function clearAll() {
  await del(SONGS_KEY);
  await del(SETLISTS_KEY);
}
