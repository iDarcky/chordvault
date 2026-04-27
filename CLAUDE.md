# Setlists MD

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
├── App.jsx               # Root component, view routing, data management,
│                         #   preference cloud-sync, auth-URL cleanup
├── music.js              # Transpose engine (transposeChord, transposeKey, sectionStyle)
├── parser.js             # .md song format parser/serializer
│                         #   exports: parseSongMd, songToMd, parseLine, generateId,
│                         #            parseTabBlock, serializeTabBlock, parseTabPositions
├── storage.js            # IndexedDB layer (loadSongs, saveSongs, loadSetlists, saveSetlists, clearAll)
├── styles/index.css      # Global styles, CSS variables, fonts
├── auth/
│   ├── supabase.js       # Supabase client (null when env vars missing)
│   ├── AuthContext.js    # React context for the auth value bag
│   ├── useAuth.js        # Hook: { user, profile, signIn*, signUp*, resetPassword,
│   │                     #         updatePassword, resendVerification, updateProfile, signOut }
│   └── AuthProvider.jsx  # Session bootstrap, profile fetch w/ preferences fallback
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
    ├── PerformanceView.jsx   # Fullscreen live view (sidebar hidden on desktop/tablet)
    ├── Account.jsx           # Account page — edits display name (local + profile), sign-in/out
    ├── Welcome.jsx           # Onboarding welcome with optional "Already have an account?" link
    ├── auth/
    │   ├── AuthScreen.jsx    # Sign-in/up form (magic link + password), loading states,
    │   │                     #   password reveal, last-email prefill, friendly errors
    │   ├── AuthCallback.jsx  # Handles OAuth /auth/callback (PKCE exchange)
    │   └── RecoveryScreen.jsx# Set-new-password screen for type=recovery links
    ├── account/
    │   └── AccountPanel.jsx  # Shared account bits: StageGreeting, PlanLabel, SignInButton,
    │                         #   CreateAccountButton, StatCards
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

supabase/
└── migrations/           # SQL applied manually (or via supabase db push).
                          # See "Supabase Schema" below.
```

## Architecture

- **No router** — App.jsx manages views via `view` state (`library`, `chart`, `editor`, `setlist-build`, `setlist-play`, `setlist-performance`, `signin`, `recovery`, `auth-callback`, …)
- **No server for song data** — songs/setlists stored client-side in IndexedDB via idb-keyval. Supabase only handles auth + account-level preferences.
- **Songs** are stored as parsed objects (title, artist, key, tempo, sections, etc.)
- **The .md format** is the interchange format — YAML frontmatter + `## Section` headers + `[Chord]lyrics` inline chords + `> notes` for band cues + `{tab}...{/tab}` for guitar tabs
- **Section types** each have a color scheme defined in `music.js` (Intro, Verse, Chorus, Bridge, etc.)
- **Transpose** is applied at render time via `transposeChord()` — stored data is always in the original key
- **Tab blocks** are parsed into structured objects `{ type: 'tab', strings, time, raw }` — `raw` preserves original ASCII for round-trip fidelity
- **Modulate markers** are parsed into `{ type: 'modulate', semitones: N }` objects in `section.lines[]` — cumulative offsets computed per section in ChartView, applied mid-section in SectionBlock with visual key-change badges
- **Tab editing** — VisualTab detects cursor inside `{tab}...{/tab}` to open TabGridEditor pre-loaded; FormTab shows "Edit Tab" buttons per tab block; saves replace in-place
- **Editor** — `md` state lives in Editor.jsx shell; all tabs receive `md` + `onChange`; switching tabs preserves content
- **Split-screen preview** — `useSyncExternalStore` with `window.matchMedia('(min-width: 768px)')` — side-by-side on wide, toggle on narrow

### Auth + Account-Level Preferences

- **Supabase optional** — `auth/supabase.js` exports `null` when env vars are missing; every call site degrades gracefully to a guest experience.
- **Redirect strategy** — OAuth uses `${origin}/auth/callback` (handled by `AuthCallback.jsx`). Magic-links, password resets, and signup confirmations redirect to `${origin}/`; `detectSessionInUrl` consumes the hash and an App.jsx effect strips lingering `access_token` / `type=recovery` / `?code=` so the URL bar stays clean.
- **Password recovery** — `type=recovery` in the URL hash routes to `RecoveryScreen.jsx`. Navigating Back before completion calls `signOut` so the interim recovery session doesn't linger.
- **Preferences cloud-sync** — defined in `App.jsx` via `PORTABLE_PREF_KEYS`. On sign-in, App hydrates once from `profile.preferences` (cloud wins). After hydration, local changes are pushed to `updateProfile({ preferences })` debounced 800 ms. Device-local fields (`onboardingComplete`, `helpPageSeen`, `notifications`) never sync.
- **Display name** — `profile?.display_name || settings?.userName || 'Guest'`. Editing in `Account.jsx` writes to both the local settings and `updateProfile({ display_name })` when signed in. When signed in, the account name replaces the "Setlists MD" label in the drawer footer and Settings about header.
- **Fullscreen performance** — `setlist-performance` and `setlist-play` always pass `isFullscreen={true}` to `DesktopLayout` so the sidebar collapses on desktop/tablet; the existing mobile layout already hides chrome for these views.

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

### "modes" Theme Variant

A page-level visual variant, opted-in via `data-theme-variant="modes"` on the page root (currently applied to `Dashboard.jsx`). It mirrors the mobile drawer aesthetic: dark radial gradient (teal top-left + plum bottom-right on near-black base) with translucent card surfaces.

Tokens exposed inside a `[data-theme-variant="modes"]` subtree:
- `--modes-surface` / `--modes-surface-strong` — translucent white fills for cards
- `--modes-border` — 9% white hairline
- `--modes-text` / `--modes-text-muted` / `--modes-text-dim`

Helper classes (only active inside the variant):
- `.modes-card` — `rounded-xl`, 4% white fill, hairline border
- `.modes-card-strong` — `rounded-2xl`, stronger fill, for hero surfaces
- `.modes-label` — uppercase + wide tracking + dim text

## Mobile Layout Specification

The mobile experience (< 640px) is a bespoke shell distinct from the desktop sidebar layout.

### Shell Structure
- `DesktopLayout`'s `<main>` is `flex flex-col` + `overflow-y-auto`, so child pages can use `flex-1 min-h-0` to fit the viewport (Dashboard does this to avoid outer scroll).
- An iOS-style push transform is applied when the drawer is open (`translateX(72%) scale(0.92)`, 24px radius, drop shadow). `will-change: transform` is only set during the open state so it doesn't interfere with sticky children while idle.
- `MobileTopBar` is rendered as a child of `<main>` on the three main tabs only (`home`, `library`, `setlists`) — not on chart/editor/player/settings. It uses explicit inline `position: sticky; top: 0` with safe-area padding so it stays pinned across iOS Safari quirks.
- `BottomNav` is `position: fixed`, borderless, laid out as a 3-column grid of soft tiles (Dashboard / Setlists / Songs). Secondary destinations (Settings, Help, Design, Notifications) live inside the drawer.
- `MobileDrawer` is rendered at the App root (not inside `<main>`) so its fixed positioning is not affected by the main element's transform.

### MobileTopBar
- Transparent chrome (no bottom border, no shadow) with `backdrop-blur-md` so page content shows through.
- One horizontal card at `h-14 rounded-xl` containing the hamburger (embedded left, `w-12`, no divider) and a plain text input.
- No search-icon affordance — the placeholder communicates intent.
- A brand-color `+` button (`w-14 h-14 rounded-xl`) sits to the right and is context-aware: Library → new song, Setlists → new setlist, Dashboard → dropdown picker.
- A unified search queries both songs and setlists; results render as an absolute dropdown below the bar.

### BottomNav
- Clean, borderless, floating 3-tile grid — no heavy chrome. Transparent background, with each tab rendered as a soft `rounded-xl` tile (`h-14`) inside a `grid grid-cols-3 gap-2` container.
- Active tile: `--color-brand` text on a `--ds-gray-100` fill. Inactive: muted gray text, fill appears only on tap.
- Safe-area padding lives on the nav root, not the tiles, so the tiles stay visually compact above the home indicator.

### MobileDrawer
- Slides in from the left (300ms `cubic-bezier(0.32, 0.72, 0, 1)`) with swipe-to-close (threshold 35% of panel width).
- Background uses a brand-forward radial gradient (teal spotlight top-left, plum accent bottom-right on `#0b0910`) — intentionally distinct from reference apps.
- Sections: close button, serif greeting, (signed-in-only) "Your Account", "Your Plan", shimmering Upgrade-to-Pro pill with sparkles on both sides, optional "Create account" CTA for guests (`!isSignedIn`), stat cards (songs/setlists), nav rows (Settings, Notifications, Help, Design).
- Rows and stat cards use `rounded-xl` for a squared, card-forward look.

### Mobile-only Affordances
- `Library` and `Setlists` hide their inline search inputs on mobile (`hidden sm:block`) because the global top bar handles search.
- Their FABs are tablet-only (`hidden sm:block lg:hidden`) — mobile uses the top bar's `+` button.
- `Dashboard` drops all mobile-specific headers/FABs, runs under the "modes" theme variant, and uses `flex-1 min-h-0 overflow-hidden flex-col` so it fills the viewport without outer scroll. The "Recently Edited" card becomes the only internally scrollable region on the page.

### Theme Setting
Settings → Appearance → Theme offers three options stored on `settings.theme`:
- `default` — follows the OS via `matchMedia('(prefers-color-scheme: light)')` and live-updates on system changes.
- `light` — forces the light palette (`data-theme="light"` on `<html>`).
- `dark` — forces the dark palette (default).

The theme is applied by an effect in `App.jsx` that sets/clears `document.documentElement.dataset.theme` and subscribes to the media query only when `default` is selected.

## Conventions

- All components use inline styles (no CSS modules or styled-components)
- No TypeScript — plain JSX
- Imports between components use relative paths (`../music`, `../parser`, etc.)
- Song row elements in Library use `<div role="button">` (not `<button>`) to allow nested interactive elements
- Tab objects in `section.lines[]` are detected via `typeof line === 'object' && line.type === 'tab'`
- Modulate objects in `section.lines[]` are detected via `typeof line === 'object' && line.type === 'modulate'`
- Always check line type before calling `.trim()` on section lines (can be string, tab object, or modulate object)
- Auth buttons use the shared `Button` component (variant=brand lg for primary CTAs, secondary md for alternates) — don't hand-roll auth buttons with raw `<button>` + inline styles
- Auth forms surface per-action loading state via a `busyTarget` string + `Button.loading` — this lets one button spin while the others stay disabled but idle
- Auth error copy goes through a `friendlyAuthError(err)` helper that checks `navigator.onLine` first, then matches common Supabase messages. Add new cases there rather than inline in handlers
- Last-used email is persisted under `localStorage['setlists-md:last-email']`; only write on a successful call

## Supabase Schema

The signed-in experience depends on a `profiles` table with columns:
`id`, `email`, `display_name`, `plan`, `preferences` (JSONB), `updated_at`.

Migrations live in `supabase/migrations/`. Apply them with the Supabase
CLI (`supabase db push`) or copy/paste the SQL into the project's SQL editor.

- `20260424_add_profile_preferences.sql` — adds the `preferences` JSONB
  column that account-level preference sync writes to. The client
  gracefully falls back to the base profile select if this column is
  missing, so sign-in still works before the migration is applied, but
  cross-device pref sync is a no-op until it is.

RLS must allow each user to `select`/`update` their own profile row
(typical policy: `auth.uid() = id`).

## Known Gotchas

- `section.lines[]` can contain **strings** (normal lines), **tab objects**, OR **modulate objects** — always type-check before calling string methods
- `chordTranspose` must be computed **before** any `useMemo` that references it (temporal dead zone)
- `parseInitialSections` in FormTab serializes both tab and modulate objects — do not use raw `.join('\n')`
- svguitar renders imperatively into a DOM ref — use `useRef` + `useEffect`, copy ref to local var in cleanup
- TabGridEditor uses `key` prop for remount when editing different tabs — do not add deps to the `initialTab` useEffect
- ChartView computes `sectionModOffsets` via `useMemo` — uses `acc` object instead of `let` variable to satisfy React compiler immutability rules
- Preference hydration runs **once per user id** via `prefsHydratedForUserRef` — don't re-run it on every profile change or you'll clobber a later local edit with the cloud value. The ref is cleared on sign-out.
- Only keys in `PORTABLE_PREF_KEYS` (App.jsx) are allowed in `profile.preferences`. Adding a new portable preference? Add its key to that array or it won't follow the user across devices.
- The `profiles.preferences` column is optional at runtime — `AuthProvider` falls back to a base `select('id, email, display_name, plan')` if the column doesn't exist, so sign-in works even before the migration is applied. The push side swallows the error.
- Auth callback URL handling is split: OAuth stays on `/auth/callback` (dedicated `AuthCallback.jsx`). Magic links and recovery links land on `/` and rely on App.jsx's cleanup effect — don't add a new redirect target without wiring a matching cleanup branch.
- `RecoveryScreen.handleBack` calls `signOut()` *before* invoking the parent `onBack`. If you ever route away from it through another path, make sure that path also ends the recovery session.
- PDF export uses `window.open('about:blank', '_blank', ...)` followed by `document.write(...)` (see `src/pdf/exportSongPdf.js` and `src/pdf/exportSetlistPdf.js`). This is unreliable inside iOS PWAs launched from the Home Screen (manifest declares `display: 'standalone'`) — the popup handle often comes back `null` or bounces out to Safari, breaking the `window.opener.localStorage` pref-sync hook. There is no popup-permission setting in an installed PWA, so the user can't recover. The roadmap (`docs/roadmap.md` §7) tracks an inline-iframe fallback path; until that ships, expect the feature to feel broken on iPad standalone mode.
- `SetlistOverview` is rendered in **two places**: (1) the dedicated `setlist-view` route in `App.jsx`, and (2) the desktop preview pane inside `Setlists.jsx`. Both wire its export callbacks (`onExportZip`, `onExportPdfOverview`, `onExportPdfFull`) — when you add or rename one, update *both* call sites or the desktop preview will silently no-op.

