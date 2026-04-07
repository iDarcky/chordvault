# ChordVault Roadmap

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
- [ ] Print single song / setlist to PDF
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

## 6. Native Apps Expansion (v4)
- [ ] Capacitor wrappers for dedicated iOS/Android distributions.
- [ ] Underlying SQLite data conversions (instead of IndexedDB mapping).
- [ ] Native Bluetooth driver mapping (overriding Web Bluetooth hooks).
- [ ] Application-level Background Sync & Push Notifications.
