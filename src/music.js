// Chromatic scale and enharmonic maps
const CHROMATIC = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
const FLAT_MAP = { Bb:'A#', Db:'C#', Eb:'D#', Gb:'F#', Ab:'G#' };
const SHARP_TO_FLAT = { 'A#':'Bb', 'C#':'Db', 'D#':'Eb', 'F#':'Gb', 'G#':'Ab' };

// Parse a chord into root + suffix
function parseRoot(chord) {
  let root = chord[0];
  let rest = chord.slice(1);
  if (rest[0] === '#' || rest[0] === 'b') {
    root += rest[0];
    rest = rest.slice(1);
  }
  if (FLAT_MAP[root]) root = FLAT_MAP[root];
  return { root, suffix: rest };
}

// Transpose a single chord by N semitones
export function transposeChord(chord, semitones) {
  if (!chord || semitones === 0) return chord;
  // Handle slash chords (e.g. D/F#)
  if (chord.includes('/')) {
    const [main, bass] = chord.split('/');
    return transposeChord(main, semitones) + '/' + transposeChord(bass, semitones);
  }
  const { root, suffix } = parseRoot(chord);
  const idx = CHROMATIC.indexOf(root);
  if (idx === -1) return chord;
  let newRoot = CHROMATIC[(idx + semitones + 120) % 12];
  if (SHARP_TO_FLAT[newRoot]) newRoot = SHARP_TO_FLAT[newRoot];
  return newRoot + suffix;
}

// Transpose a key signature
export function transposeKey(key, semitones) {
  if (!key || semitones === 0) return key;
  const { root, suffix } = parseRoot(key);
  const idx = CHROMATIC.indexOf(root);
  if (idx === -1) return key;
  let newRoot = CHROMATIC[(idx + semitones + 120) % 12];
  if (SHARP_TO_FLAT[newRoot]) newRoot = SHARP_TO_FLAT[newRoot];
  return newRoot + suffix;
}

// All display keys for selectors
export const ALL_KEYS = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];

// Calculate semitones from one key to another
export function semitonesBetween(fromKey, toKey) {
  const fromRoot = FLAT_MAP[fromKey] || fromKey;
  const toRoot = FLAT_MAP[toKey] || toKey;
  const fi = CHROMATIC.indexOf(fromRoot);
  const ti = CHROMATIC.indexOf(toRoot);
  if (fi === -1 || ti === -1) return 0;
  return (ti - fi + 12) % 12;
}

// Section type → colors, label, background
const SECTION_COLORS = {
  Intro:        { b: '#6366f1', d: '#818cf8', l: 'I',  bg: '#12122a' },
  Refrain:      { b: '#8b5cf6', d: '#a78bfa', l: 'Rf', bg: '#16122a' },
  Verse:        { b: '#22c55e', d: '#4ade80', l: 'V',  bg: '#0f1a0f' },
  'Pre Chorus': { b: '#f59e0b', d: '#fbbf24', l: 'Pc', bg: '#1a1510' },
  Chorus:       { b: '#ec4899', d: '#f472b6', l: 'C',  bg: '#1a0f1a' },
  Bridge:       { b: '#06b6d4', d: '#22d3ee', l: 'B',  bg: '#0f1a1a' },
  Instrumental: { b: '#eab308', d: '#facc15', l: 'It', bg: '#1a1a10' },
  Ending:       { b: '#f43f5e', d: '#fb7185', l: 'E',  bg: '#1a1015' },
  Tag:          { b: '#3b82f6', d: '#60a5fa', l: 'T',  bg: '#10151a' },
  Interlude:    { b: '#a855f7', d: '#c084fc', l: 'Il', bg: '#15101a' },
  Vamp:         { b: '#d97706', d: '#fbbf24', l: 'Vm', bg: '#1a1510' },
  Outro:        { b: '#ef4444', d: '#f87171', l: 'O',  bg: '#1a1010' },
};

const DEFAULT_STYLE = { b: '#6b7280', d: '#9ca3af', l: '?', bg: '#141418' };

// Get colors for a section type (e.g. "Verse 1" → Verse colors)
export function sectionStyle(type) {
  const base = type.replace(/\s*\d+$/, '');
  const key = Object.keys(SECTION_COLORS).find(
    k => base.toLowerCase().startsWith(k.toLowerCase())
  );
  return SECTION_COLORS[key] || DEFAULT_STYLE;
}

// Compact label for live mode (e.g. "Chorus 1" → "C1", "Pre Chorus" → "Pc")
export function compactLabel(name) {
  const num = name.match(/(\d+)$/)?.[1] || '';
  const style = sectionStyle(name);
  return style.l + num;
}
