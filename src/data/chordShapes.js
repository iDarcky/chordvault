// Chord shape data for SVGuitar chord diagrams
// Format: { fingers: [[string(1-6), fret, label?], ...], barres: [{fromString, toString, fret}], position: startFret }
// Strings: 1 = high e, 6 = low E
// Fret 0 = open string, -1 = muted (x)

export const CHORD_SHAPES = {
  // ── Major ──────────────────────────────────────────────
  'A':  { fingers: [[1,0],[2,2],[3,2],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'B':  { fingers: [[1,2],[2,4],[3,4],[4,4],[5,2],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 2 }], position: 1 },
  'C':  { fingers: [[1,0],[2,1],[3,0],[4,2],[5,3],[6,-1]], barres: [], position: 1 },
  'D':  { fingers: [[1,2],[2,3],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'E':  { fingers: [[1,0],[2,0],[3,1],[4,2],[5,2],[6,0]], barres: [], position: 1 },
  'F':  { fingers: [[1,1],[2,1],[3,2],[4,3],[5,3],[6,1]], barres: [{ fromString: 6, toString: 1, fret: 1 }], position: 1 },
  'G':  { fingers: [[1,3],[2,3],[3,0],[4,0],[5,2],[6,3]], barres: [], position: 1 },

  'Ab': { fingers: [[1,4],[2,4],[3,5],[4,6],[5,6],[6,4]], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'Bb': { fingers: [[1,1],[2,3],[3,3],[4,3],[5,1],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 1 }], position: 1 },
  'Db': { fingers: [[1,1],[2,2],[3,1],[4,3],[5,4],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 1 }], position: 1 },
  'Eb': { fingers: [[1,3],[2,4],[3,5],[4,5],[5,3],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'Gb': { fingers: [[1,2],[2,2],[3,3],[4,4],[5,4],[6,2]], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },

  // ── Minor ──────────────────────────────────────────────
  'Am': { fingers: [[1,0],[2,1],[3,2],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Bm': { fingers: [[1,2],[2,3],[3,4],[4,4],[5,2],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 2 }], position: 2 },
  'Cm': { fingers: [[1,3],[2,4],[3,5],[4,5],[5,3],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'Dm': { fingers: [[1,1],[2,3],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Em': { fingers: [[1,0],[2,0],[3,0],[4,2],[5,2],[6,0]], barres: [], position: 1 },
  'Fm': { fingers: [[1,1],[2,1],[3,1],[4,3],[5,3],[6,1]], barres: [{ fromString: 6, toString: 1, fret: 1 }], position: 1 },
  'Gm': { fingers: [[1,3],[2,3],[3,3],[4,5],[5,5],[6,3]], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },
  'Abm':{ fingers: [[1,4],[2,4],[3,4],[4,6],[5,6],[6,4]], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'Bbm':{ fingers: [[1,1],[2,2],[3,3],[4,3],[5,1],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 1 }], position: 1 },
  'Dbm':{ fingers: [[1,4],[2,5],[3,6],[4,6],[5,4],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 4 }], position: 4 },
  'Ebm':{ fingers: [[1,3],[2,3],[3,3],[4,5],[5,6],[6,3]], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },
  'Gbm':{ fingers: [[1,2],[2,2],[3,2],[4,4],[5,4],[6,2]], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },

  // ── 7th ────────────────────────────────────────────────
  'A7': { fingers: [[1,0],[2,2],[3,0],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'B7': { fingers: [[1,0],[2,0],[3,2],[4,1],[5,2],[6,-1]], barres: [], position: 1 },
  'C7': { fingers: [[1,0],[2,1],[3,3],[4,2],[5,3],[6,-1]], barres: [], position: 1 },
  'D7': { fingers: [[1,2],[2,1],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'E7': { fingers: [[1,0],[2,0],[3,1],[4,0],[5,2],[6,0]], barres: [], position: 1 },
  'F7': { fingers: [[1,1],[2,1],[3,2],[4,1],[5,3],[6,1]], barres: [{ fromString: 6, toString: 1, fret: 1 }], position: 1 },
  'G7': { fingers: [[1,1],[2,0],[3,0],[4,0],[5,2],[6,3]], barres: [], position: 1 },

  // ── Minor 7th ──────────────────────────────────────────
  'Am7': { fingers: [[1,0],[2,1],[3,0],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Bm7': { fingers: [[1,2],[2,3],[3,2],[4,4],[5,2],[6,-1]], barres: [{ fromString: 5, toString: 1, fret: 2 }], position: 2 },
  'Dm7': { fingers: [[1,1],[2,1],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Em7': { fingers: [[1,0],[2,0],[3,0],[4,0],[5,2],[6,0]], barres: [], position: 1 },
  'Fm7': { fingers: [[1,1],[2,1],[3,1],[4,1],[5,3],[6,1]], barres: [{ fromString: 6, toString: 1, fret: 1 }], position: 1 },

  // ── Major 7th ──────────────────────────────────────────
  'Amaj7': { fingers: [[1,0],[2,2],[3,1],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Cmaj7': { fingers: [[1,0],[2,1],[3,0],[4,2],[5,3],[6,-1]], barres: [], position: 1 },
  'Dmaj7': { fingers: [[1,2],[2,2],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Emaj7': { fingers: [[1,0],[2,0],[3,1],[4,1],[5,2],[6,0]], barres: [], position: 1 },
  'Fmaj7': { fingers: [[1,0],[2,1],[3,2],[4,3],[5,3],[6,1]], barres: [], position: 1 },
  'Gmaj7': { fingers: [[1,2],[2,3],[3,0],[4,0],[5,2],[6,3]], barres: [], position: 1 },

  // ── Sus4 ───────────────────────────────────────────────
  'Asus4': { fingers: [[1,0],[2,3],[3,2],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Csus4': { fingers: [[1,1],[2,1],[3,0],[4,3],[5,3],[6,-1]], barres: [], position: 1 },
  'Dsus4': { fingers: [[1,3],[2,3],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Esus4': { fingers: [[1,0],[2,0],[3,2],[4,2],[5,2],[6,0]], barres: [], position: 1 },
  'Gsus4': { fingers: [[1,3],[2,3],[3,0],[4,0],[5,1],[6,3]], barres: [], position: 1 },

  // ── Sus2 ───────────────────────────────────────────────
  'Asus2': { fingers: [[1,0],[2,0],[3,2],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Dsus2': { fingers: [[1,0],[2,3],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Esus2': { fingers: [[1,0],[2,0],[3,1],[4,4],[5,2],[6,0]], barres: [], position: 1 },

  // ── Add9 ───────────────────────────────────────────────
  'Aadd9':  { fingers: [[1,0],[2,2],[3,4],[4,2],[5,0],[6,-1]], barres: [], position: 1 },
  'Cadd9':  { fingers: [[1,3],[2,3],[3,0],[4,2],[5,3],[6,-1]], barres: [], position: 1 },
  'Dadd9':  { fingers: [[1,0],[2,3],[3,2],[4,0],[5,-1],[6,-1]], barres: [], position: 1 },
  'Eadd9':  { fingers: [[1,0],[2,2],[3,1],[4,2],[5,2],[6,0]], barres: [], position: 1 },
  'Gadd9':  { fingers: [[1,3],[2,0],[3,0],[4,0],[5,2],[6,3]], barres: [], position: 1 },

  // ── Slash chords ───────────────────────────────────────
  'D/F#': { fingers: [[1,2],[2,3],[3,2],[4,0],[5,-1],[6,2]], barres: [], position: 1 },
  'G/B':  { fingers: [[1,3],[2,3],[3,0],[4,0],[5,0],[6,-1]], barres: [], position: 1 },
  'C/E':  { fingers: [[1,0],[2,1],[3,0],[4,2],[5,2],[6,-1]], barres: [], position: 1 },
  'A/C#': { fingers: [[1,0],[2,2],[3,2],[4,2],[5,0],[6,4]], barres: [], position: 1 },
  'E/G#': { fingers: [[1,0],[2,0],[3,1],[4,2],[5,2],[6,4]], barres: [], position: 1 },
  'F/A':  { fingers: [[1,1],[2,1],[3,2],[4,3],[5,0],[6,-1]], barres: [], position: 1 },
};

// Aliases (enharmonic equivalents)
CHORD_SHAPES['F#m'] = CHORD_SHAPES['Gbm'];
CHORD_SHAPES['C#m'] = CHORD_SHAPES['Dbm'];
CHORD_SHAPES['G#m'] = CHORD_SHAPES['Abm'];
CHORD_SHAPES['F#']  = CHORD_SHAPES['Gb'];
CHORD_SHAPES['C#']  = CHORD_SHAPES['Db'];
CHORD_SHAPES['G#']  = CHORD_SHAPES['Ab'];
CHORD_SHAPES['A#m'] = CHORD_SHAPES['Bbm'];
CHORD_SHAPES['D#m'] = CHORD_SHAPES['Ebm'];
