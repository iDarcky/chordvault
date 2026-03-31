# ChordVault

A Progressive Web App for worship chord charts. Install on iPad/Android tablet, use full-screen, works offline.

## Stack

- **Vite 7** — build tool + dev server (`npm run dev`)
- **React 19** — UI framework (JSX, no TypeScript)
- **idb-keyval** — IndexedDB wrapper for local persistence
- **vite-plugin-pwa** — service worker + manifest for offline/installable
- **svguitar** — chord diagram rendering (MIT license)
- **jszip** — setlist export/import as .zip bundles
- **Hosted on Vercel** — auto-deploys from `master` branch

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component, view routing, data management
├── music.js              # Transpose engine (transposeChord, transposeKey, sectionStyle)
├── parser.js             # .md song format parser/serializer
│                         #   exports: parseSongMd, songToMd, parseLine, generateId,
│                         #            parseTabBlock, serializeTabBlock, parseTabPositions
├── storage.js            # IndexedDB layer (loadSongs, saveSongs, loadSetlists, saveSetlists, clearAll)
├── styles/index.css      # Global styles, CSS variables, fonts
├── data/
│   ├── demos.js          # 3 demo songs loaded on first run
│   └── chordShapes.js    # ~50 worship chord fingering shapes for svguitar
└── components/
    ├── SectionBlock.jsx      # Renders a single section block (chords above lyrics, tab blocks)
    ├── TabBlock.jsx          # SVG guitar tab renderer (fret numbers, string lines, bar lines, techniques)
    ├── ChordDiagram.jsx      # svguitar wrapper — renders chord fingering diagrams
    ├── StructureRibbon.jsx   # Section flow bar + MetaPill component
    ├── ChartView.jsx         # Full chord chart view (transpose, 1/2-col layout, size, chord diagrams toggle)
    ├── Editor.jsx            # 3-tab editor shell (Form/Visual/Raw) with split-screen preview
    ├── Library.jsx           # Song library with search + setlists tab
    ├── SetlistBuilder.jsx    # Build setlists: pick songs, reorder, per-song transpose & notes
    ├── SetlistPlayer.jsx     # Live mode: progress bar, song strip, prev/next navigation
    ├── SetlistOverview.jsx   # Read-only setlist overview with song list and duration
    └── editor/
        ├── FormTab.jsx       # Structured form editor: metadata fields + section blocks
        ├── VisualTab.jsx     # Toolbar + textarea: chord picker, section inserter, tab grid editor
        ├── RawTab.jsx        # Plain textarea with collapsible syntax reference
        ├── PreviewPanel.jsx  # Live preview of parsed song (used in split-screen)
        ├── ChordPicker.jsx   # Popup: root (A-G), accidental (#/b), suffix, slash chord
        └── TabGridEditor.jsx # Interactive tab grid: duration picker, auto-advance, technique buttons
```

## Architecture

- **No router** — App.jsx manages views via `view` state (`library`, `chart`, `editor`, `setlist-build`, `setlist-play`)
- **No server** — all data stored client-side in IndexedDB via idb-keyval
- **Songs** are stored as parsed objects (title, artist, key, tempo, sections, etc.)
- **The .md format** is the interchange format — YAML frontmatter + `## Section` headers + `[Chord]lyrics` inline chords + `> notes` for band cues + `{tab}...{/tab}` for guitar tabs
- **Section types** each have a color scheme defined in `music.js` (Intro, Verse, Chorus, Bridge, etc.)
- **Transpose** is applied at render time via `transposeChord()` — stored data is always in the original key
- **Tab blocks** are parsed into structured objects `{ type: 'tab', strings, time, raw }` — `raw` preserves original ASCII for round-trip fidelity
- **Editor** — `md` state lives in Editor.jsx shell; all tabs receive `md` + `onChange`; switching tabs preserves content
- **Split-screen preview** — `useSyncExternalStore` with `window.matchMedia('(min-width: 768px)')` — side-by-side on wide, toggle on narrow

## .md Format Quick Reference

```
---
title: Song Name
artist: Artist
key: C
tempo: 120
time: 4/4
capo: 2
structure: [Verse 1, Chorus, Bridge, Chorus]
ccli: "1234567"
tags: [worship, fast]
spotify: https://...
youtube: https://...
notes: Performance notes
---

## Verse 1
> Band cue text
[C]Lyrics with [G]inline chords
Plain lyrics line

## Chorus
{tab, time: 4/4}
e|--0--2--3--|
B|--1--3--5--|
G|--0--2--4--|
D|-----------|
A|--3--------|
E|-----------|
{/tab}
[Am]More [F]lyrics {!inline note}
{modulate: +2}
```

## Tab Block Format

Tab blocks live inside sections. Parsed into `{ type: 'tab', strings: [{note, content}], time, raw }`.

- `strings` — array of `{ note: 'e'|'B'|'G'|'D'|'A'|'E', content: string }`
- `raw` — original lines preserved for round-trip serialization
- `time` — optional time signature from `{tab, time: 4/4}`
- Technique markers in content: `h` hammer-on, `p` pull-off, `s` slide, `b` bend, `x` mute, `~` vibrato

**Serialization**: `songToMd()` calls `serializeTabBlock(tab)` for tab objects in `section.lines[]`.
**FormTab**: Uses `serializeTabBlock` when converting `s.lines` to lyrics string (avoids `[object Object]`).

## CSS Variables (defined in styles/index.css)

Use `var(--name)` instead of hardcoded colors:
- `--bg`, `--surface`, `--border` — backgrounds
- `--text`, `--text-bright`, `--text-muted`, `--text-dim` — text colors
- `--chord` — chord highlight color (gold) — also used for fret numbers in TabBlock
- `--accent`, `--accent-soft`, `--accent-text` — indigo accent
- `--danger`, `--danger-soft` — red for destructive actions
- `--fb` — body font (DM Sans)
- `--fm` — monospace font (Azeret Mono) — used for chords, tab labels, fret numbers

## Conventions

- All components use inline styles (no CSS modules or styled-components)
- No TypeScript — plain JSX
- Imports between components use relative paths (`../music`, `../parser`, etc.)
- Song row elements in Library use `<div role="button">` (not `<button>`) to allow nested interactive elements
- Tab objects in `section.lines[]` are detected via `typeof line === 'object' && line.type === 'tab'`
- Always check line type before calling `.trim()` on section lines (can be string or tab object)

## Known Gotchas

- `section.lines[]` can contain **strings** (normal lines) OR **tab objects** — always type-check before calling string methods
- `chordTranspose` must be computed **before** any `useMemo` that references it (temporal dead zone)
- `parseInitialSections` in FormTab uses `serializeTabBlock` to convert tab objects to ASCII — do not use raw `.join('\n')`
- svguitar renders imperatively into a DOM ref — use `useRef` + `useEffect`, copy ref to local var in cleanup
