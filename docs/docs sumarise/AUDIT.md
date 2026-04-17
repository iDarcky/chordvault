# Setlists MD Audit Report & Improvement Plan

**Date:** April 2026 (Projected)
**Status:** Pre-Alpha Review

---

## 1. Product Manager POV
*Focus: Roadmap, Retention, and Market Fit*

1.  **Competitive Advantage (vs. PCO):** Focus on **Data Ownership** and **Dynamic Formatting**. PCO is for admins; Setlists MD is for musicians. See **[docs/competitive-analysis.md](./docs/competitive-analysis.md)**.
2.  **Prioritize "Smart Import" (v2):** User acquisition is hindered by manual entry. High-quality ChordPro and ".txt with chords-above-lyrics" detection is the #1 growth lever.
3.  **Accelerate "Nashville Number System" (v1.5):** This is a professional-grade differentiator. Moving this from v1.5 to "Core" adds immediate credibility with serious worship teams.
4.  **Local Usage History:** Implement "Last Played" tracking now (locally). It helps users rotate their repertoire and provides immediate value without needing cloud sync.
5.  **Collaborative Setlist Editing:** The v3 "Shared Folder" model is brilliant, but "Setlist Sharing via URL/QR" (v1.5) is a faster way to achieve 80% of the value for teams.
6.  **Offline Safety (PWA Eviction):** The Safari 7-day eviction rule is a "product killer." While Google Drive sync mitigates data loss, the PWA must eventually move to a native shell (Capacitor) to guarantee local persistence.
7.  **"Guest Mode" Friction:** Ensure the "Guest Musician" experience (scan QR -> see setlist) requires zero account creation or setup.
8.  **Song Metadata Gaps:** Add "Original Artist" vs "Our Version" artist fields. Churches often re-arrange songs.
9.  **Feedback Loop:** Add a simple "Send Feedback" button in Settings that pre-fills device info and app version.
10. **Feature Discovery:** New users might miss "Modulation" or "Inline Notes." Add "Did you know?" tooltips or a sample "Pro Chart" demo song.
11. **The "Non-Church" Pivot:** While "Worship" is the niche, rename generic terms (e.g., "Service" -> "Event") internally to allow for a broader "GigVault" sibling product later.

---

## 2. Developer POV
*Focus: Code Quality, Security, and Scalability*

1.  **TypeScript Migration:** The codebase is currently plain JSX. As logic for `SyncEngine` and `Parser` grows, the lack of type safety will lead to brittle code and regression bugs.
2.  **Style Architecture:** Inline styles are used throughout. This makes theme management and responsive overrides difficult to maintain. Recommend moving to **Tailwind CSS** or **CSS Modules** for better separation of concerns.
3.  **Security (Token Storage):** OAuth tokens for Google Drive/Dropbox are stored in IndexedDB. While standard for PWAs, ensure you are using `Content-Security-Policy` (CSP) headers to prevent XSS from stealing these tokens.
4.  **Capacitor Versioning:** *User Question:* "If I go the capacitor route, do I need to update each version independently?"
    *   **Answer:** Yes and No. You have one web codebase. Capacitor wraps it. You can use **Capacitor Live Updates** (via Ionic Appflow or similar) to push web code changes to all native apps instantly without App Store review. However, native plugin changes (e.g., adding a new Bluetooth plugin) still require a native build and store submission.
5.  **Centralize the "Render Engine":** Currently, `SectionBlock` handles a lot of logic. Consider a pure "ChordRenderer" utility that handles Nashville vs. Standard vs. Transpose logic to keep components lean.
6.  **Sync Conflict Resolution:** The `SyncEngine` uses "Last-Write-Wins." Implement a "Conflict Detected" UI to allow users to choose between "Local" and "Cloud" versions to avoid data loss.
7.  **Unit Testing:** The `parser.js` logic for markdown and `music.js` for transposing are critical. Add **Vitest** to ensure these pure functions don't break during v2/v3 feature additions.
8.  **Component Bloat:** `App.jsx` is becoming a "God Component." Extract navigation logic into a `useRouter` hook and state into a `DataProvider` context.
9.  **Optimized Syncing:** Currently, `fullSync` checks everything. Moving to a "Manifest-first" approach where only files with different hashes/timestamps are touched will save bandwidth and battery.
10. **Error Boundaries:** PWAs can fail silently. Add React Error Boundaries to catch render errors in specific sections and allow the user to "Reload Song" without crashing the whole app.

---

## 3. UI/UX Designer POV
*Focus: Ergonomics, Accessibility, and Visual Polish*

1.  **Performance Mode Targets:** In "Live" mode, the "Next/Prev" touch targets should be huge (at least 60x60px) to accommodate shaky hands on a mic stand.
2.  **Accessibility Audit:** Current low-contrast gray text on dark backgrounds may fail WCAG AA standards. Increase contrast for "Artist" and "Meta" pills.
3.  **High-Contrast Stage Mode:** Provide a "High Contrast Dark" and a "Paper White" theme for different lighting conditions (outdoor sunrise vs. dark theater).
4.  **Editor "Sticky" Toolbar:** In the `VisualTab`, the chord/section toolbar should be sticky at the top of the viewport so users don't have to scroll up to insert a chord.
5.  **Empty Library State:** The current "No songs yet" text is plain. Use an "Empty State Illustration" with clear "Import" and "Demo" CTA buttons.
6.  **Structure Ribbon Interaction:** Make the ribbon pills "Jump Points." Tapping "Bridge" should scroll the view directly to the Bridge section.
7.  **Visual Hierarchy:** The Song Title in `ChartView` is great, but the "Key/BPM" info could be more prominent in a dedicated "Header Bar" that doesn't scroll away.
8.  **Haptic Feedback:** Add subtle haptics (on supported devices) when a user switches songs or taps a chord in the editor.
9.  **Loading States:** The "Loading Setlists MD..." screen is basic. Use a skeleton screen that mirrors the Library layout for a faster "perceived" load time.
10. **Responsive "Auto" Column Logic:** Ensure the 2-column layout uses `gap` and `padding` that accounts for iPad Pro's larger bezels.

---

## 4. Sales POV
*Focus: Monetization and Growth*

1.  **Competitive Advantage (vs. PCO):** Sell "Data Ownership" and "Zero-Friction Guest Access." See **[docs/competitive-analysis.md](./docs/competitive-analysis.md)**.
2.  **"Sync as a Service" (Tier 1):** Offer a managed cloud sync for $4.99/mo for churches that don't want to mess with Google Drive permissions. See **[docs/monetization.md](./docs/monetization.md)** for the full financial breakdown.
3.  **Pro PDF Exports (Tier 2):** High-quality, branded PDF generation (e.g., "PraiseCharts style") for a one-time fee or subscription.
4.  **Team Licensing:** A "Church Plan" ($15/mo) that allows 10+ users to sync to a shared vault with "Role Permissions" (Leader can edit, Band can only view).
5.  **Premium Themes:** Special "Stage-Ready" themes (e.g., extra-large chords, specific color palettes) as a one-time "Support the Developer" purchase.
6.  **Sponsorships:** A "Sponsored by [Church Name]" in the About section for large churches that want to fund development.
7.  **Affiliate Hardware Links:** Link to vetted iPad stands, Bluetooth pedals (AirTurn), and chargers on Amazon/Sweetwater.
8.  **"White-Label" for Denominations:** Selling a branded version of the app to large church networks.
9.  **Verified Song Library:** Partner with independent artists to offer "Verified Charts" for their songs (revenue share).
10. **Workshops/Consulting:** Selling "Digital Worship Team" setup guides or 1-on-1 Zoom sessions.
11. **The "Freemium" Cap:** Keep all core features free, but limit the "Library Size" to 50 songs for free users.

---

## 5. User POV
*Focus: Efficiency and "It Just Works"*

1.  **Setlist Drag-and-Drop:** Replacing "Up/Down" arrows with intuitive drag-and-drop is the most requested "quality of life" feature for setlist builders.
2.  **"Nashville" for the Modern Team:** For many users, Nashville numbers are easier than transposing keys. This should be a "one-tap" toggle.
3.  **Search by Tag:** Users often search for "Fast" or "Christmas." Tag-based filtering in the Library is a v1.5 priority.
4.  **Pedal "Auto-Detection":** A "Press your pedal now" wizard in settings to automatically map keys without typing `ArrowRight` manually.
5.  **Print to PDF:** "I need to print a copy for the guest bassist." A quick-export-to-PDF button is a critical emergency feature.
6.  **"Last Played" Insight:** Help me not play the same song 4 weeks in a row.
7.  **Sync Visibility:** "Did it save?" The `SyncStatus` pill should be very clear about when the *last* successful push happened.
8.  **Song Discovery:** Include a "Community Songs" or "Public Domain" import button to help new users get started instantly.
9.  **Battery Optimization:** PWAs can be CPU intensive. Ensure the SVG rendering of tabs and chord diagrams is optimized for low power.
10. **One-Handed Navigation:** On phone layouts, ensure most actions are reachable with a thumb.

---

## 6. Extra POVs

### Music Director (Team Coordination)
1.  **MD Notes:** A way to add "MD-only" notes that don't clutter the band's view.
2.  **Service Timing:** A "Total Setlist Duration" calculator that updates as you add/remove songs.
3.  **Key Clashes:** Highlight when two adjacent songs in a setlist are in keys that don't transition well (e.g., G to Ab).
4.  **Archive Feature:** Easy access to "Last Year's Easter Setlist" for planning.
5.  **Personnel Mapping:** Note which musician is leading which song in the setlist overview.

### Vocalist / Guest Musician (Low Friction)
1.  **Vocalist Mode (Lyrics Only):** Massive text, no chords, clear section markers. This is already in the code—polish it!
2.  **Zero-Setup Onboarding:** "Scan QR, see chart, go." No "What instrument do you play?" or "Sign up for sync" for the Sunday guest.
3.  **Capo Simplicity:** "Play in G, sounds like Bb." The Capo calculator is their best friend; make it prominent.
4.  **Structure Glanceability:** The colored ribbon is great for vocalists to see "how long until the bridge."
5.  **Auto-Scroll:** A "Teleprompter" mode that respects the tempo and total song duration.

---

## Final Recommendation
Setlists MD is in a strong "Pre-Alpha" state with a robust technical foundation (SyncEngine + .md format). To move to "Alpha/Beta," focus on **TypeScript**, **Tailwind**, and **Smart Import**.

