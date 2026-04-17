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

// Section type → semantic CSS var keys + compact label.
// Colors are resolved by CSS custom properties defined in styles/index.css
// (--section-<slug>-{bg,fg,border}), so this map contains zero `--ds-*` refs.
const SECTION_STYLES = {
  Intro:        { slug: 'intro',       l: 'I' },
  Refrain:      { slug: 'refrain',     l: 'Rf' },
  Verse:        { slug: 'verse',       l: 'V' },
  'Pre Chorus': { slug: 'pre-chorus',  l: 'Pc' },
  Chorus:       { slug: 'chorus',      l: 'C' },
  Bridge:       { slug: 'bridge',      l: 'B' },
  Instrumental: { slug: 'instrumental',l: 'It' },
  Ending:       { slug: 'ending',      l: 'E' },
  Tag:          { slug: 'tag',         l: 'T' },
  Interlude:    { slug: 'interlude',   l: 'Il' },
  Vamp:         { slug: 'vamp',        l: 'Vm' },
  Outro:        { slug: 'outro',       l: 'O' },
};

const DEFAULT_STYLE = { slug: 'default', l: '?' };

function styleFor(entry) {
  const bgVar = `var(--section-${entry.slug}-bg)`;
  const fgVar = `var(--section-${entry.slug}-fg)`;
  const borderVar = `var(--section-${entry.slug}-border)`;
  return {
    bgVar,
    fgVar,
    borderVar,
    label: entry.l,
    // Legacy keys preserved as aliases into the same semantic tokens so
    // existing consumers (b, d, bg, br) render without touching every file:
    //   b/d → fgVar (strong foreground), bg → bgVar, br → borderVar
    b: fgVar,
    d: fgVar,
    bg: bgVar,
    br: borderVar,
    l: entry.l,
  };
}

// Get style tokens for a section type (e.g. "Verse 1" → Verse style)
export function sectionStyle(type) {
  const base = type.replace(/\s*\d+$/, '');
  const key = Object.keys(SECTION_STYLES).find(
    k => base.toLowerCase().startsWith(k.toLowerCase())
  );
  return styleFor(SECTION_STYLES[key] || DEFAULT_STYLE);
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
 
// Diatonic chords for a given key (I, ii, iii, IV, V, vi, vii°)
const DIATONIC_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const DIATONIC_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
 
export function getDiatonicChords(key) {
  if (!key) return ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'];
  return DIATONIC_INTERVALS.map((interval, i) =>
    transposeChord(key, interval) + DIATONIC_QUALITIES[i]
  );
}