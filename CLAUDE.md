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
    ├── editor/
    │   ├── FormTab.jsx       # Structured form editor: metadata fields + section blocks
    │   ├── VisualTab.jsx     # Toolbar + textarea: chord picker, section inserter, tab grid editor
    │   ├── RawTab.jsx        # Plain textarea with collapsible syntax reference
    │   ├── PreviewPanel.jsx  # Live preview of parsed song (used in split-screen)
    │   ├── ChordPicker.jsx   # Popup: root (A-G), accidental (#/b), suffix, slash chord
    │   └── TabGridEditor.jsx # Interactive tab grid: duration picker, auto-advance, technique buttons
    └── ui/
        ├── Button.jsx        # Standard Geist buttons implementation
        ├── Card.jsx          # Geist 16px radius cards
        ├── Tabs.jsx          # Underline style tabs
        └── ...               # Avatar, Badge, Input, SegmentedControl, etc.
```

## Architecture

- **No router** — App.jsx manages views via `view` state (`library`, `chart`, `editor`, `setlist-build`, `setlist-play`)
- **No server** — all data stored client-side in IndexedDB via idb-keyval
- **Songs** are stored as parsed objects (title, artist, key, tempo, sections, etc.)
- **The .md format** is the interchange format — YAML frontmatter + `## Section` headers + `[Chord]lyrics` inline chords + `> notes` for band cues + `{tab}...{/tab}` for guitar tabs
- **Section types** each have a color scheme defined in `music.js` (Intro, Verse, Chorus, Bridge, etc.)
- **Transpose** is applied at render time via `transposeChord()` — stored data is always in the original key
- **Tab blocks** are parsed into structured objects `{ type: 'tab', strings, time, raw }` — `raw` preserves original ASCII for round-trip fidelity
- **Modulate markers** are parsed into `{ type: 'modulate', semitones: N }` objects in `section.lines[]` — cumulative offsets computed per section in ChartView, applied mid-section in SectionBlock with visual key-change badges
- **Tab editing** — VisualTab detects cursor inside `{tab}...{/tab}` to open TabGridEditor pre-loaded; FormTab shows "Edit Tab" buttons per tab block; saves replace in-place
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
[Bm]Chords after modulate are shifted +2 semitones
```

## Modulate Format

Modulate markers shift all subsequent chords by N semitones. Parsed into `{ type: 'modulate', semitones: N }` in `section.lines[]`.

- Cumulative: multiple `{modulate}` markers stack across sections
- Applied at render time on top of user transpose and capo
- Visual "Key Change: +N" badge rendered at marker position
- Round-trip: serialized back to `{modulate: +N}` in `songToMd()`

## Tab Block Format

Tab blocks live inside sections. Parsed into `{ type: 'tab', strings: [{note, content}], time, raw }`.

- `strings` — array of `{ note: 'e'|'B'|'G'|'D'|'A'|'E', content: string }`
- `raw` — original lines preserved for round-trip serialization
- `time` — optional time signature from `{tab, time: 4/4}`
- Technique markers in content: `h` hammer-on, `p` pull-off, `s` slide, `b` bend, `x` mute, `~` vibrato

**Serialization**: `songToMd()` calls `serializeTabBlock(tab)` for tab objects in `section.lines[]`.
**FormTab**: Uses `serializeTabBlock` when converting `s.lines` to lyrics string (avoids `[object Object]`).

## Styling (Geist Design System & Tailwind v4)

We utilize standard Vercel Geist design tokens mapped via Tailwind CSS configuration in `styles/index.css`.
- Backgrounds: `--ds-background-100`, `--ds-background-200`
- Colors/Text: `--ds-gray-1000` (primary text), `--ds-gray-700` (secondary), `--ds-gray-400` (borders)
- Typography: Uses standard `text-heading-*` and `text-copy-*` utilities mappings mimicking Geist definitions.
- Special components limit their custom CSS, leaning entirely on standard `className` declarations from Tailwind.
- `--chord` (gold) is preserved specifically for unique chord coloration logic.

## Conventions

- All components use inline styles (no CSS modules or styled-components)
- No TypeScript — plain JSX
- Imports between components use relative paths (`../music`, `../parser`, etc.)
- Song row elements in Library use `<div role="button">` (not `<button>`) to allow nested interactive elements
- Tab objects in `section.lines[]` are detected via `typeof line === 'object' && line.type === 'tab'`
- Modulate objects in `section.lines[]` are detected via `typeof line === 'object' && line.type === 'modulate'`
- Always check line type before calling `.trim()` on section lines (can be string, tab object, or modulate object)

## Known Gotchas

- `section.lines[]` can contain **strings** (normal lines), **tab objects**, OR **modulate objects** — always type-check before calling string methods
- `chordTranspose` must be computed **before** any `useMemo` that references it (temporal dead zone)
- `parseInitialSections` in FormTab serializes both tab and modulate objects — do not use raw `.join('\n')`
- svguitar renders imperatively into a DOM ref — use `useRef` + `useEffect`, copy ref to local var in cleanup
- TabGridEditor uses `key` prop for remount when editing different tabs — do not add deps to the `initialTab` useEffect
- ChartView computes `sectionModOffsets` via `useMemo` — uses `acc` object instead of `let` variable to satisfy React compiler immutability rules
