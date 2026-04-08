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

// Section type → colors, label, pre-computed bg/border
// b = base color, d = display/text color, l = compact label
// bg = low-opacity background, br = semi-transparent border
const SECTION_COLORS = {
  Intro:        { b: 'var(--ds-blue-700)',  d: 'var(--ds-blue-1000)',  l: 'I',  bg: 'var(--ds-blue-100)',  br: 'var(--ds-blue-400)', c: 'blue' },
  Refrain:      { b: 'var(--ds-purple-700)',d: 'var(--ds-purple-1000)',l: 'Rf', bg: 'var(--ds-purple-100)',br: 'var(--ds-purple-400)',c: 'purple' },
  Verse:        { b: 'var(--ds-green-700)', d: 'var(--ds-green-1000)', l: 'V',  bg: 'var(--ds-green-100)', br: 'var(--ds-green-400)', c: 'green' },
  'Pre Chorus': { b: 'var(--ds-amber-700)', d: 'var(--ds-amber-1000)', l: 'Pc', bg: 'var(--ds-amber-100)', br: 'var(--ds-amber-400)', c: 'amber' },
  Chorus:       { b: 'var(--ds-pink-700)',  d: 'var(--ds-pink-1000)',  l: 'C',  bg: 'var(--ds-pink-100)',  br: 'var(--ds-pink-400)', c: 'pink' },
  Bridge:       { b: 'var(--ds-teal-700)',  d: 'var(--ds-teal-1000)',  l: 'B',  bg: 'var(--ds-teal-100)',  br: 'var(--ds-teal-400)', c: 'teal' },
  Instrumental: { b: 'var(--ds-amber-700)', d: 'var(--ds-amber-1000)', l: 'It', bg: 'var(--ds-amber-100)', br: 'var(--ds-amber-400)', c: 'amber' },
  Ending:       { b: 'var(--ds-red-700)',   d: 'var(--ds-red-1000)',   l: 'E',  bg: 'var(--ds-red-100)',   br: 'var(--ds-red-400)',  c: 'red' },
  Tag:          { b: 'var(--ds-blue-700)',  d: 'var(--ds-blue-1000)',  l: 'T',  bg: 'var(--ds-blue-100)',  br: 'var(--ds-blue-400)', c: 'blue' },
  Interlude:    { b: 'var(--ds-purple-700)',d: 'var(--ds-purple-1000)',l: 'Il', bg: 'var(--ds-purple-100)',br: 'var(--ds-purple-400)',c: 'purple' },
  Vamp:         { b: 'var(--ds-amber-700)', d: 'var(--ds-amber-1000)', l: 'Vm', bg: 'var(--ds-amber-100)', br: 'var(--ds-amber-400)', c: 'amber' },
  Outro:        { b: 'var(--ds-red-700)',   d: 'var(--ds-red-1000)',   l: 'O',  bg: 'var(--ds-red-100)',   br: 'var(--ds-red-400)',  c: 'red' },
};

const DEFAULT_STYLE = { b: 'var(--ds-gray-700)', d: 'var(--ds-gray-1000)', l: '?', bg: 'var(--ds-gray-100)', br: 'var(--ds-gray-400)', c: 'gray' };

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

// Convert a chord to Nashville Number System
export function getNashvilleNumber(chord, key) {
  if (!chord || !key) return chord;
  if (chord.includes('/')) {
    const [main, bass] = chord.split('/');
    return getNashvilleNumber(main, key) + '/' + getNashvilleNumber(bass, key);
  }
  const { root, suffix } = parseRoot(chord);
  const keyRoot = parseRoot(key).root;
  const fi = CHROMATIC.indexOf(keyRoot);
  const ti = CHROMATIC.indexOf(root);
  if (fi === -1 || ti === -1) return chord;

  const semitones = (ti - fi + 12) % 12;
  const map = { 0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7' };
  return (map[semitones] || '?') + suffix;
}
