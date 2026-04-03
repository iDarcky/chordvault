# ChordVault Strategic Roadmap (v1.5 to v3.0)

This roadmap synthesizes goals from the Product Spec, Audit, and Technical Debt reviews. Items are prioritized by user impact and grouped into **1-week execution phases**.

---

## Phase 1: Foundation & Reliability (Week 1)
*Focus: Technical stability and developer velocity.*

1.  **TypeScript Migration (Part 1):** Convert core utilities (`music.js`, `parser.js`, `storage.js`) to `.ts`.
2.  **Tailwind CSS Integration:** Replace inline styles in `App.jsx` and `Library.jsx` with Tailwind utility classes.
3.  **Safari PWA Fixes:** Implement a "Last Synced" check on app boot to detect potential IndexedDB eviction and prompt for Cloud Restore.
4.  **Error Boundaries:** Add React Error Boundaries around the Chart Renderer to prevent full-app crashes.
5.  **Vitest Setup:** Add unit tests for `transposeChord` and `parseSongMd` to ensure no regressions during migration.

## Phase 2: User Workflow & "Smart" Import (Week 2)
*Focus: Removing friction for new users.*

1.  **Smart Import (ChordPro):** Support `.cho` / `.chordpro` file imports with 1:1 mapping.
2.  **Smart Import (Text Detection):** Implement "Chords-above-lyrics" detection for copy-pasted text.
3.  **Setlist Drag-and-Drop:** Replace up/down arrows with a smooth drag-and-drop experience in `SetlistBuilder`.
4.  **Import Preview:** Show a rendered chart preview *before* saving an imported song.
5.  **Nashville Number System (Core):** Implement the "one-tap" toggle in `ChartView` header.

## Phase 3: Professional Performance Tools (Week 3)
*Focus: Enhancing the "Live" experience.*

1.  **High-Contrast Stage Themes:** Add "Pure Dark" (OLED) and "Paper White" theme options.
2.  **Setlist Sharing (QR/URL):** Generate encoded URLs for setlists that guest musicians can scan/open to import instantly.
3.  **Huge Touch Targets:** Optimize "Live Mode" buttons for tablet-on-stand ergonomics (min 60x60px).
4.  **Metadata Fields:** Add "CCLI License #" to Settings and "Original Artist" to Song metadata.
5.  **"Last Played" Insight:** Display a subtle "Last played: 3 weeks ago" in the Library view.

## Phase 4: Collaboration & Role Profiles (Week 4)
*Focus: Team-wide utility.*

1.  **Settings Sync:** Treat `settings.json` as a syncable file in Google Drive/Dropbox (one-tap "Follow Leader" mode).
2.  **Vocalist Mode (v1):** Finalize the "Lyrics Only" toggle with increased font-size and centered text.
3.  **Instrument-Specific Views:** Initial implementation of "Bass" (emphasize slash notes) and "Acoustic" (prominent capo).
4.  **Cloud Sync Reliability:** Implement "Conflict Resolution" UI (Keep Local vs. Keep Remote).
5.  **Search by Tag:** Add tag-based filtering and a "Fast/Slow" tag toggle in the Library.
6.  **Pedal "Auto-Learn" Wizard:** A UI step in Settings to map Bluetooth pedal keys without manual text input.

## Phase 5: Capacitor & Native Preparation (Week 5)
*Focus: Moving beyond the browser.*

1.  **Capacitor Initial Setup:** Wrap the React app in a Capacitor shell for iOS/Android.
2.  **Native File Access:** Migrate local storage from IndexedDB to Native SQLite (via Capacitor) for 100% data persistence.
3.  **Native Haptics:** Add haptic feedback for setlist navigation.
4.  **Splash Screen & App Icons:** Professional branding assets for mobile devices.
5.  **Print to PDF:** Implement client-side PDF generation for single songs and full setlists.

## Phase 6: Monetization & Private Cloud (Week 6+)
*Focus: Sustainability and v3.0 launch.*

1.  **ChordVault Private Sync (E2EE):** Build a zero-knowledge encrypted sync provider using Supabase/S3.
2.  **Stripe Integration:** Add subscription management for the Private Sync tier.
3.  **Premium Themes UI:** Add a "Supporter" section for one-time theme unlocks.
4.  **Verified Song Library:** Partner-ready architecture for "Official" chart imports (revenue share).
5.  **Deep-Linked YouTube/Spotify:** Integrated "Play Reference" button in the Chart header.
6.  **Advanced Auto-Scroll:** Teleprompter mode that syncs with song duration/tempo.
7.  **Global i18n:** Spanish (es) and Portuguese (pt) UI translations.

---

## Priority Key
- 🔴 **Critical:** Phase 1 & 2 (Stability & Adoption)
- 🟡 **Important:** Phase 3 & 4 (Professional Use)
- 🔵 **Enhancement:** Phase 5 & 6 (Scaling & Monetization)
