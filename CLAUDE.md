# ChordVault

A Progressive Web App for worship chord charts. Install on iPad/Android tablet, use full-screen, works offline.

## Stack

- **Vite 7** — build tool + dev server (`npm run dev`)
- **React 19** — UI framework (JSX, no TypeScript)
- **idb-keyval** — IndexedDB wrapper for local persistence
- **vite-plugin-pwa** — service worker + manifest for offline/installable
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
├── parser.js             # .md song format parser/serializer (parseSongMd, songToMd, parseLine, generateId)
├── storage.js            # IndexedDB layer (loadSongs, saveSongs, loadSetlists, saveSetlists, clearAll)
├── styles/index.css      # Global styles, CSS variables, fonts
├── data/demos.js         # 3 demo songs loaded on first run
└── components/
    ├── SectionBlock.jsx      # Renders a single section block (chords above lyrics)
    ├── StructureRibbon.jsx   # Section flow bar + MetaPill component
    ├── ChartView.jsx         # Full chord chart view (transpose, 1/2-col layout, size)
    ├── Editor.jsx            # Markdown editor with live preview tab
    ├── Library.jsx           # Song library with search + setlists tab
    ├── SetlistBuilder.jsx    # Build setlists: pick songs, reorder, per-song transpose & notes
    └── SetlistPlayer.jsx     # Live mode: progress bar, song strip, prev/next navigation
```

## Architecture

- **No router** — App.jsx manages views via `view` state (`library`, `chart`, `editor`, `setlist-build`, `setlist-play`)
- **No server** — all data stored client-side in IndexedDB via idb-keyval
- **Songs** are stored as parsed objects (title, artist, key, tempo, sections, etc.)
- **The .md format** is the interchange format — YAML frontmatter + `## Section` headers + `[Chord]lyrics` inline chords + `> notes` for band cues
- **Section types** each have a color scheme defined in `music.js` (Intro, Verse, Chorus, Bridge, etc.)
- **Transpose** is applied at render time via `transposeChord()` — stored data is always in the original key

## CSS Variables (defined in styles/index.css)

Use `var(--name)` instead of hardcoded colors:
- `--bg`, `--surface`, `--border` — backgrounds
- `--text`, `--text-bright`, `--text-muted`, `--text-dim` — text colors
- `--chord` — chord highlight color (gold)
- `--accent`, `--accent-soft`, `--accent-text` — indigo accent
- `--danger`, `--danger-soft` — red for destructive actions
- `--fb` — body font (DM Sans)
- `--fm` — monospace font (Azeret Mono)

## Conventions

- All components use inline styles (no CSS modules or styled-components)
- No TypeScript — plain JSX
- Imports between components use relative paths (`../music`, `../parser`, etc.)
- Song row elements in Library use `<div role="button">` (not `<button>`) to allow nested interactive elements
