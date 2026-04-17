# ChordVault Documentation Master Summary

This document provides a comprehensive, high-detail consolidation of all documentation in the `docs/docs sumarise/` directory. It is intended to serve as a single source of truth for the project's vision, architecture, and development status.

---

## 1. Project Identity & Vision
**Source:** [README(1).md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/README(1).md) & [pitch.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/pitch.md)

ChordVault (formerly Setlists MD) is a **free, offline-first Progressive Web App (PWA)** designed specifically for worship leaders and musicians. It aims to liberate teams from the "PDF problem" and proprietary "walled gardens."

- **The Problem:** Static PDFs are hard to transpose; proprietary apps (OnSong, Planning Center) lock data behind subscriptions and internet connections.
- **The Solution:** A portable, dynamic chart renderer that uses **Markdown (`.md`)** as its native format.
- **Core Value Propositions:**
    - **True Data Ownership:** Your songs are plain text files in your own cloud storage (Google Drive, Dropbox, etc.).
    - **Dynamic Rendering:** Instant transposition, Nashville Number toggles, and Capo calculation.
    - **Zero Friction:** Accessible via QR code without account creation; handles mid-song modulations seamlessly.
    - **Musician-First:** Built for the person on stage, not just the administrator in the office.

---

## 2. Technical Architecture
**Source:** [architecture.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/architecture.md) & [product-spec.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/product-spec.md)

ChordVault's architecture is built for reliability in environments with poor connectivity (like church basements).

- **The Stack:**
    - **Frontend:** React + Vite (Static SPA). No backend server is required for core functionality.
    - **Styling:** Tailwind CSS v4 + HeroUI v3.
    - **Offline Engine:** `vite-plugin-pwa` for service worker management and PWA manifest.
    - **Storage:** `idb-keyval` wrapping IndexedDB for large, asynchronous local persistence.
- **Internal Modules:**
    - **Parser Engine (`parser.js`):** Converts raw Markdown into structured JSON and vice versa. It handles YAML frontmatter, section splitting via `##`, and inline chord tokens.
    - **Music Logic (`music.js`):** Contains logic for transposing chords, calculating Capo shapes, and converting to Nashville Numbers. It uses regex to dissect chords (e.g., `F#m7/C#`) and transpose components individually.
    - **Sync Engine (`sync/`):** Manages optional Cloud Sync by comparing local `updatedAt` timestamps against remote file dates (Last-Write-Wins strategy).
- **Data Collections (IndexedDB Keys):**
    - `chordvault:songs`: Array of JSON song objects.
    - `chordvault:setlists`: Array of JSON setlist objects.
    - `chordvault:settings`: User preferences (language, theme, pedal mapping, etc.).
    - `chordvault:history`: Track play history for repertoire rotation.

---

## 3. Product Specifications (Deep Dive)
**Source:** [product-spec.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/product-spec.md)

### Detailed Song Format (v2)
- **Syntax Rules:**
    - `---`: Frontmatter for metadata (Title, Artist, Key, BPM, Time Sig, CCLI, Tags, Spotify/YouTube links).
    - `## [Type]`: Section headers with unique color-coding (e.g., Intro=Indigo, Verse=Green, Chorus=Pink, Bridge=Cyan).
    - `> [Text]`: Section-level band cues (rendered above coordinates).
    - `[Chord]`: Inline chords placed directly before the word they are played on.
    - `{!Note}`: Performance pills (e.g., `{!bass out}`).
    - `{modulate: +N}`: Real-time key change markers that stack with base transpositions.
    - `{tab}...{/tab}`: ASCII tab blocks rendered as clean, formatted SVG blocks.

### Advanced Rendering & UX Features
- **Instrument Role Profiles:** Context-aware rendering filters:
    - **Worship Leader:** Full view (chords, lyrics, notes).
    - **Vocalist:** Hides chords, emphasizes lyrics/structure ribbon.
    - **Acoustic Guitar:** Focuses on Capo shapes.
    - **Electric Guitar:** Highlights tab blocks.
    - **Drums:** Minimalist view showing only dynamics, section headers, and bar counts.
- **Smart Import (v2):** Prioritized detection for ChordPro, SongSelect (`.usr`), OnSong, and plain text. The "chord-above-lyrics" detector automates the conversion from legacy formats to ChordVault Markdown.

---

## 4. Roadmaps & Milestones
**Source:** [roadmap.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/roadmap.md) & [product-spec.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/product-spec.md)

- **v1.5 (Essential Performance):** Settings persistence, Bluetooth pedal support, Capo calculator, .zip setlist export, and phone-optimized layouts.
- **v2 (Professional Workflow):** Instrument role profiles, high-contrast "Stage Mode" themes, and "Smart Import" for multiple formats.
- **v2.5 (Advanced Features):** Interactive tab grid editor, SVG chord diagrams (fingering charts), and drummer-specific dynamics views.
- **v1 (Foundations):** TypeScript migration, Tailwind integration, Safari PWA fixes (IndexedDB eviction detection), and React Error Boundaries.
- **v3 (Cloud & Collaboration):** E2EE Private Sync, team folders/workspaces, and real-time session sync (WebSockets).
- **v4 (Native):** Capacitor wrapper for iOS/Android, native SQLite migration for 100% persistence, and App Store distribution.

---

## 5. User & Troubleshooting Guide
**Source:** [how-to-guide.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/how-to-guide.md) & [faq.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/faq.md)

- **Workflow:** 
    1. **Library**: Manage repertoire.
    2. **Editor**: Create/Edit songs in Visual (toolbar), Form (structured), or Raw (markdown) modes.
    3. **Setlists**: Build and reorder sets.
    4. **Live Mode**: Perform with huge touch targets, pedal support, and auto-scroll.
- **Troubleshooting FAQ:**
    - **Safari Data Loss:** Prevented by using "Add to Home Screen" or enabling Cloud Sync (mitigates Safari's 7-day eviction rule).
    - **Bluetooth Pedals:** Map via **Settings > Pedal Mapping** by pressing the pedal to register key events (ArrowRight, PageDown, etc.).
    - **Sync Issues:** Verify shared folder permissions in Google Drive/Dropbox and check the `SyncStatus` pill.

---

## 6. Competitive Analysis & Strategy
**Source:** [competitive-analysis.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/competitive-analysis.md) & [vs-planning-center.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/vs-planning-center.md)

### Why Choose ChordVault over Planning Center (PCO)?
- **Data Ownership:** PCO is a "walled garden"; ChordVault songs are portable `.md` files in your own drive.
- **Dynamic Content:** PCO relies on static PDFs; ChordVault charts are dynamic text that can transpose or modulate instantly.
- **Offline Reliability:** PWA architecture allows 100% functionality without internet, unlike PCO's cloud-heavy dependency.
- **Guest Access:** Zero friction for guests — just scan a QR code. No PCO account or invites needed.
- **Marketing Angle:** "Planning Center is for the administrative office. ChordVault is for the performing stage."

---

## 7. Monetization & Business Strategy
**Source:** [monetization.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/monetization.md) & [monetization2.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/monetization2.md)

Inspired by the **Obsidian** "Sync" model.

- **Finance Analysis:** Extremely low hosting overhead (<$30/mo for 5,000 users) due to text-only "blob" storage and zero-knowledge architecture.
- **SaaS Tiers:**
    1. **Free Forever:** Full editor access + "Bring Your Own Cloud" adapters.
    2. **Private Sync (~$3-$5/mo):** Instant e2ee sync, 30-day version history, and Smart Import unlocks.
    3. **Team/Church Sync (~$8-$20/mo):** Shared workspaces, role management, and live "Leader Mode" broadcasting.
- **Technical Implementation:** Uses Web Crypto API (AES-GCM) on the client side so the server never sees unencrypted lyrics, drastically reducing legal/copyright liability.

---

## 8. Quality, Design & Audits
**Source:** [AUDIT.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/AUDIT.md), [audit_report_v.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/audit_report_v.md), & [inspiration.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/inspiration.md)

### Multi-POV Audit Highlights
- **PM Recommendation:** Prioritize "Nashville Numbers" and "Smart Import" to add immediate professional credibility.
- **Dev Recommendation:** Accelerate move to **TypeScript** and **Tailwind CSS** to manage codebase growth.
- **UI/UX Recommendation:** Increase touch targets in Live Mode to at least 60x60px for better on-stage ergonomics.

### Vercel Design Migration Audit
- **Status:** Core Atomic UI components (Button, Input, Card) are migrated, but page-level views like `ChartView` and `Editor` still use legacy CSS variables (`var(--bg)`, `var(--text-muted)`).
- **Cleanup Strategy:** Map old variables to new `--ds-*` Geist tokens (e.g., `var(--bg)` → `var(--ds-background-200)`).

---

## 9. Legal, Privacy & Deployment
**Source:** [deployment.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/deployment.md), [privacy-policy(1).md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/privacy-policy(1).md), & [terms.md](file:///d:/github/Chordvault/chordvault/docs/docs%20sumarise/terms.md)

- **Deployment:** Guided Vercel hosting setup, environment variable configuration (Client IDs for Google Drive OAuth), and Supabase schema scripts.
- **Privacy Policy:** Explicit "Short Version": We do not collect, store, or sell your data. No cookies or tracking.
- **Terms of Service:** Highlights user responsibility for **CCLI Licensing**. Clarifies the "As-Is" nature of the free service and explicitly warns about Safari's local storage risk.

---

## 13. App Ideas Registry (Backlog)

The following table contains 50 ideas for the project's evolution, ranging from UI/UX refinements to professional collaboration tools.

| Idea | Description | Component/Location | Status | Priority | Estimated Effort | Target Release | Value / Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Glassmorphism Header** | Implement a truly translucent header that blurs song content as it scrolls behind. | `PageHeader.jsx` | Backlog | Medium | Low | v2.0 | High (Aesthetics) |
| **AI Smart Import** | Use an LLM to automatically convert messy `.txt` song copies into clean ChordVault Markdown. | `parser.js` / `Import` | Backlog | High | Medium | v2.5 | Very High (Acquisition) |
| **Visual Metronome** | A subtle pulsing border or dot in the header to help the band stay on tempo. | `ChartView.jsx` | Backlog | Medium | Low | v2.0 | Medium (Utility) |
| **Section Loop Mode** | Allow a musician to tap a section (e.g., Bridge) to highlight and loop it during rehearsal. | `ChartView.jsx` | Backlog | Medium | Low | v1.5 | High (Rehearsal) |
| **Interactive Fretboard** | Visual representation of where to put fingers for the current chord at the top of the chart. | `ChordDiagram.jsx` | Backlog | High | Medium | v2.0 | High (Educational) |
| **PCO API Sync** | One-click import from Planning Center Services via their official API. | `SyncEngine` | Backlog | High | High | v3.0 | Very High (Migration) |
| **Team Chat/Comments** | Add a small discussion thread to each song for the team to discuss arrangement notes. | `SongSidebar` | Backlog | Low | Medium | v3.0 | Medium (Collab) |
| **Haptic Pedal Feedback** | Vibrate the device slightly when a Bluetooth pedal advances to the next song. | `SetlistPlayer` | Backlog | Low | Low | v2.0 | Low (UX) |
| **Automatic Capo Suggestion** | Suggest the best Capo position based on common "open shape" worship keys (G, D, C). | `music.js` | Backlog | Medium | Low | v2.0 | High (Leader) |
| **Draft Versioning** | Allow users to save private "draft" edits to a song before pushing to the team vault. | `SyncEngine` | Backlog | Medium | Medium | v3.0 | Medium (Collab) |
| **Dark Mode "Stage Focus"** | A theme that blacks out everything except the chords and lyrics to minimize eye strain. | `Settings` / `Themes` | Backlog | High | Low | v1.5 | High (Live) |
| **Spotify Mini-Player** | Embed a small Spotify player in the header to listen to the reference track while practicing. | `ChartView` | Backlog | Low | Medium | v2.5 | Medium (Practice) |
| **Bulk Tag Editor** | Select multiple songs in the library to add/remove tags in one go. | `Library` | Backlog | Medium | Medium | v2.0 | Medium (Org) |
| **Song Usage Heatmap** | A visual graph in the dashboard showing which songs are being overplayed or ignored. | `Dashboard` | Backlog | Low | Medium | v3.0 | High (PM) |
| **QR "Instant Join"** | Generate a QR code for a setlist so guests can join the session without a link. | `SetlistOverview` | Backlog | High | Low | v1.5 | Very High (Friction) |
| **Nashville Grid View** | Render a section purely as numbers in a grid (no lyrics) for professional MDs. | `ChartView` | Backlog | Medium | Medium | v2.5 | High (Professional) |
| **Transition Compatibility** | Highlight when two adjacent songs in a setlist are in keys that "clash" (e.g. G to Ab). | `SetlistBuilder` | Backlog | Low | Low | v2.5 | Medium (Planning) |
| **PDF Re-Import (OCR)** | Upload a PDF chart and extract the text and chords (best effort). | `ImportEngine` | Backlog | Medium | High | v3.5 | High (Transition) |
| **"Follow Leader" Mode** | Synchronize page turns across all devices in a shared session via WebSockets. | `SyncEngine` | Backlog | High | High | v3.0 | Game Changer |
| **Custom Instrument Notes** | Add notes that only appear when a specific Role (e.g. "Drummer") is selected. | `Parser` / `UI` | Backlog | Medium | Medium | v2.5 | High (Team) |
| **Repertoire Stats** | "You've played 40 songs from Bethel this year." Data insights for worship directors. | `StatsPage` | Backlog | Low | Medium | v3.5 | Low (Admin) |
| **Stripe Billing Portal** | Integrated subscription management for the Private Sync tier. | `Settings` | Backlog | High | Medium | v3.0 | Essential (Monetization) |
| **SQLite Migration** | Transition from IndexedDB to SQLite (via Capacitor) for rock-solid native data. | `Storage.js` | Backlog | High | High | v4.0 | Critical (Reliability) |
| **One-Handed Editor** | A mobile-first UI for the editor where all tools are at the bottom within thumb reach. | `Editor.jsx` | Backlog | Medium | Medium | v2.0 | High (UX) |
| **Multi-Language UI** | Full UI translation for Spanish and Portuguese worship teams. | `i18n` | Backlog | High | Medium | v2.0 | High (Growth) |
| **Alternative Fingerings** | Tap a chord diagram to cycle through different positions on the neck. | `ChordDiagram` | Backlog | Low | Low | v2.5 | Medium (Guitar) |
| **Setlist Total Duration** | Real-time calculation of setlist length based on song tempo and structure. | `SetlistBuilder` | Backlog | Medium | Low | v1.5 | High (Planning) |
| **Export to Word (.docx)** | Allow users to export charts for printing in a standard Word format. | `ExportEngine` | Backlog | Low | Medium | v2.5 | Low (Legacy) |
| **Smart Chord Auto-Complete** | Typing `[G` in the raw editor suggests `[Gmaj7]`, `[Gsus4]`, etc. | `RawTab` | Backlog | Medium | Low | v2.0 | Medium (UX) |
| **Public Domain Library** | A built-in library of 100+ public domain hymns to get users started. | `Demos` | Backlog | High | Low | v2.0 | High (Onboarding) |
| **Section Anchors** | Clicking a section in the structure ribbon scrolls the chart to that exact point. | `ChartView` | Backlog | High | Low | v1.5 | High (UX) |
| **Global Transpose Offset** | Offset all songs in a setlist by N semitones (useful for "half-step down" bands). | `SetlistPlayer` | Backlog | Low | Low | v2.5 | Low (Niche) |
| **Custom Section Colors** | Allow churches to define their own color palette for Intro, Verse, Chorus, etc. | `Settings` | Backlog | Low | Medium | v3.5 | Low (Aesthetics) |
| **"Song of the Week"** | A featured demo song on the dashboard for inspiration. | `Dashboard` | Backlog | Low | Low | v3.0 | Low (Engagement) |
| **Pedal Calibration Wizard** | An interactive guide to help users map weird keyboard-emulating pedals. | `Settings` | Backlog | Medium | Low | v2.0 | High (Reliability) |
| **Search by Lyric Snippet** | "I know the chorus says 'rain on me', but what's the title?" | `Library` | Backlog | Medium | Medium | v2.0 | High (UX) |
| **Keyboard Shortcuts** | Full Desktop keyboard navigation (e.g. `CMD+S` to save, `CMD+F` to search). | `Global` | Backlog | Medium | Low | v1.5 | High (DX) |
| **Capo Shapes Reference** | A visual list in ChartView showing the "Shapes" vs "Sounding" chords for clarity. | `ChartView` | Backlog | Medium | Low | v1.5 | High (Leader) |
| **Split-Screen Editor** | Desktop view where Editor is on the left and Live Preview is on the right. | `Editor.jsx` | Backlog | High | Medium | v1.5 | Essential (DX) |
| **Export as Image** | Convert a chart to a high-res PNG for sharing on social media or church slides. | `ExportEngine` | Backlog | Low | Medium | v3.5 | Low (UI) |
| **Duplicate Song Detector** | Alert the user when they try to import a song that already exists in their library. | `ImportEngine` | Backlog | Medium | Low | v2.0 | Medium (Org) |
| **Custom App Icons** | Allow users to choose different ChordVault app icons for their home screen. | `Settings` | Backlog | Low | Low | v4.0 | Low (Polished) |
| **Modulation Banners** | Large visual banners in the chart view indicating when the key is changing. | `SectionBlock` | Backlog | High | Low | v1.5 | High (Live) |
| **Tempo Tap Button** | Tap a button to set the tempo of a song manually in the editor. | `MetadataForm` | Backlog | Medium | Low | v2.0 | High (Leader) |
| **CCLI Auto-Fill** | Connect to CCLI (if API allowed) to pull metadata automatically by song number. | `ImportEngine` | Backlog | Low | High | v4.0 | High (Utility) |
| **Section Visibility Toggles** | Hide specific sections (e.g. Outro) temporarily for a specific service. | `SetlistBuilder` | Backlog | Low | Medium | v3.0 | Medium (Live) |
| **Piano Voicing Diagrams** | Show keyboard fingering charts instead of guitar fretboards. | `ChordDiagram` | Backlog | Low | Medium | v3.0 | Medium (Keys) |
| **Auto-Save History** | Local version history that saves every 30 seconds while editing. | `Editor.jsx` | Backlog | High | Medium | v2.0 | High (Reliability) |
| **Dynamic Sprawling Logic** | Optimize 2-column layout to put page breaks only between sections. | `ChartView` | Backlog | Medium | High | v2.5 | High (Live) |
| **"Stage Mode" Animation** | Smooth fade-to-black when entering Live Mode to look professional on stage. | `SetlistPlayer` | Backlog | Low | Low | v2.0 | Low (UX) |
