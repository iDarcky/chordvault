# Setlists MD Roadmap

This document consolidates earlier specifications (`product-spec.md`) and design migrations into a single trackable feature roadmap. 

## 1. Design System Migration (Geist/Tailwind v4)
*(See `design-system.md` for full UI component implementation status)*
- [x] Integrate Base Geist Typography & Colors.
- [x] Build core UI components (`Button`, `Card`, `Badge`, `Tabs`, `Input`, `Toast`, etc.)
- [x] Complete refactoring of complex views (`ChartView`, `Editor`, `Settings`).
- [x] Modernize layout components (`BottomNav`, `PageHeader`, `SongCard`, `SetlistCard`)
- [ ] *Remaining Task*: Ensure custom dialogs/modals fully replace native browser prompts across all UX flows.

## 2. Core App Capabilities (v1/v1.5)
- [x] Song library with search and filters.
- [x] Chart renderer with section blocks and auto-responsive layout.
- [x] Transpose engine, modulo-based key selectors.
- [x] Split-screen, multi-tab Editor (Form/Visual/Raw) with live preview.
- [x] Setlist builder and player (auto-scroll, song strip, per-song offsets).
- [x] Persistent storage via IndexedDB.
- [x] Smart `.md` and `.zip` bundle export/import pipelines.
- [x] Bluetooth pedal support & Capo calculator mapping.
- [x] Form/Visual Editor toolbar tools (sections, tabs, modulations).

## 3. Professional Features (v2)
- [x] Tab block parsing & SVG interactive rendering map.
- [x] Chord diagram engine rendering.
- [ ] Instrument role profiles (vocalist, guitar, bass, keys, drums views).
- [ ] Smart import from ChordPro (`.cho`), SongSelect (`.usr`), OnSong, generic Text/PDF/Word parsing contexts.
- [ ] Enhanced playback modes: Explicit Rehearsal vs Live sub-modes.
- [ ] Display customizations: Nashville number system toggle, Duplicate section handling rules, Chords-only/Lyrics-only displays.
- [x] Print single song / setlist to PDF
- [ ] Export as ChordPro (`.cho`) for interoperability
- [ ] Setlist URL/QR Code share capabilities.
- [ ] Internationalization (i18n): Foundational hooks and tier-1 language file population (es, pt, ko, fr).

## 4. Advanced Features & Tooling (v2.5)
- [ ] Instrument-specific optimizations: Drummer view counts, Piano voicing charts, Bass root emphasis logic.
- [ ] Setlist quality enhancements: Key compatibility checkers, drag-and-drop reordering.
- [ ] Viewer extensions: Section rehearsals loops, quick-key switchers.
- [ ] PDF text extraction import (best-effort).
- [ ] Performance testing and WCAG AA accessibility audit.

## 5. Cloud Sync & Collaboration (v3)
- [x] Core Sync adapter interface abstractions.
- [x] Google Drive & OneDrive/Dropbox basic JSON-manifest plugins.
- [ ] WebDAV sync extensions.
- [ ] Settings sync mechanisms.
- [ ] Team collaboration shared-folder logic.
- [ ] Real-time session playback syncing (WebSockets relay framework).

## 7. PDF Export Enhancements
*(Builds on `src/pdf/exportSongPdf.js` — the dedicated print-window renderer.)*

Shipped:
- [x] Self-contained popup renderer (Cover header, structure ribbon, sections,
      tab blocks, modulate markers, per-page footer).
- [x] Live preview controls in the popup: columns (1/2), size (S/M/L/XL),
      lyric font (Sans/Serif/Mono), chords on/off, colors on/off.
- [x] Per-user preference persistence under `setlists-md:pdf-prefs`.
- [x] Repeating brand footer (`setlists.md` with `.md` in brand teal) on every
      printed page.
- [x] Unicode-safe export filenames (e.g. `Înțelept.md` survives slugify).

Planned (highest-value first):
- [ ] **Paper size toggle** — Letter vs A4 (matters for non-US users; today
      it's hard-coded to Letter).
- [ ] **Hide cover toggle** — for re-prints / songbooks where metadata is
      repeated; jumps straight to section 1.
- [ ] **Hide tab blocks / hide section notes / hide inline `{!band notes}`** —
      individually toggleable for vocalist sheets and clean projection sheets.
- [ ] **Margins toggle** — Normal / Narrow / Wide. Narrow buys ~25% more
      content room on dense charts.
- [ ] **Spacing toggle** — Compact vs Comfortable. Pair with size XL when
      sight-reading from a stand; pair with Compact when fitting a long song
      onto fewer pages.
- [ ] **Force "section per page"** — every section starts a fresh page. Niche
      but useful for in-ear monitor screens that show one section at a time.
- [ ] **Chord-diagram strip** — render the same svguitar shapes the in-app
      ChartView shows, at the top of page 1.
- [ ] **Reset to defaults button** — one-click revert if the user has tweaked
      everything into something unprintable.
- [ ] **Setlist PDF** — bundle every song in a setlist into one document with
      a setlist cover page, repeating song-level cover headers, and a
      cumulative table of contents.

## 8. Native Apps Expansion (v4)
- [ ] Capacitor wrappers for dedicated iOS/Android distributions.
- [ ] Underlying SQLite data conversions (instead of IndexedDB mapping).
- [ ] Native Bluetooth driver mapping (overriding Web Bluetooth hooks).
- [ ] Application-level Background Sync & Push Notifications.

