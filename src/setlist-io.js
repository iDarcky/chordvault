import JSZip from 'jszip';
import { songToMd, parseSongMd, generateId } from './parser';

function slugify(title) {
  return title
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Export a setlist + its songs as a .zip file.
 * Returns a Blob ready for download.
 */
export async function exportSetlistZip(setlist, songs) {
  const zip = new JSZip();

  // Build items array and add song .md files
  const items = [];
  const addedFiles = new Set();

  for (const item of setlist.items) {
    if (item.type === 'break') {
      items.push({
        type: 'break',
        label: item.label || '',
        note: item.note || '',
        duration: item.duration || 0,
      });
      continue;
    }

    const song = songs.find(s => s.id === item.songId);
    if (!song) continue;

    const filename = slugify(song.title) + '.md';
    if (!addedFiles.has(filename)) {
      zip.file(filename, songToMd(song));
      addedFiles.add(filename);
    }

    items.push({
      file: filename,
      transpose: item.transpose || 0,
      note: item.note || '',
    });
  }

  // Add setlist manifest
  const manifest = {
    name: setlist.name,
    date: setlist.date,
    service: setlist.service || 'Morning',
    items,
  };
  zip.file('_setlist.json', JSON.stringify(manifest, null, 2));

  return zip.generateAsync({ type: 'blob' });
}

/**
 * Import a setlist .zip file.
 * Returns { setlist, newSongs } where newSongs are songs not already in the library.
 * The caller is responsible for adding newSongs to the library and the setlist to setlists.
 */
export async function importSetlistZip(file, existingSongs) {
  const zip = await JSZip.loadAsync(file);

  // Read manifest
  const manifestFile = zip.file('_setlist.json');
  if (!manifestFile) throw new Error('Invalid setlist zip: missing _setlist.json');
  const manifest = JSON.parse(await manifestFile.async('string'));

  // Parse all .md song files from the zip
  const zipSongs = {};
  for (const [path, entry] of Object.entries(zip.files)) {
    if (path.endsWith('.md') && !entry.dir) {
      const md = await entry.async('string');
      zipSongs[path] = parseSongMd(md);
    }
  }

  // Match zip songs against existing library by title+artist
  const newSongs = [];
  const fileToSongId = {};

  for (const [filename, parsed] of Object.entries(zipSongs)) {
    const existing = existingSongs.find(
      s => s.title.toLowerCase() === parsed.title.toLowerCase() &&
           s.artist.toLowerCase() === parsed.artist.toLowerCase()
    );
    if (existing) {
      fileToSongId[filename] = existing.id;
    } else {
      const id = generateId();
      fileToSongId[filename] = id;
      newSongs.push({ ...parsed, id, createdAt: Date.now() });
    }
  }

  // Build setlist items
  const items = manifest.items.map(item => {
    if (item.type === 'break') {
      return {
        type: 'break',
        label: item.label || '',
        note: item.note || '',
        duration: item.duration || 0,
      };
    }
    const songId = fileToSongId[item.file];
    if (!songId) return null;
    return {
      songId,
      transpose: item.transpose || 0,
      note: item.note || '',
    };
  }).filter(Boolean);

  const setlist = {
    id: generateId(),
    name: manifest.name || 'Imported Setlist',
    date: manifest.date || new Date().toISOString().slice(0, 10),
    service: manifest.service || 'Morning',
    items,
    createdAt: Date.now(),
  };

  return { setlist, newSongs };
}
