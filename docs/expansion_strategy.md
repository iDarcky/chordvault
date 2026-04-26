# Expansion & Launch Strategy

This document outlines the Minimum Viable Product (MVP) prioritization and the regional launch strategy for Setlists MD.

## Phase 1: Overcoming Launch Fear & Feature Filtering

To prevent feature creep and launch quickly, the backlog is strictly prioritized:

**The "Must-Fix Before Launch" List (Blockers):**
*   **Fix Print/PDF:** Essential for older musicians and traditional church environments.
*   **i18n (Internationalization):** Setting up the basic translation framework (Romanian and English) to establish a unique selling proposition against US-centric competitors.

**The "V1.5 Fast Follow" List (Post-Launch priorities):**
*   **Collaboration / Teams:** Utilizing the Supabase backend to allow setlist sharing.
*   **Public Domain Songs (Local):** A downloadable template library of 10-20 common regional worship songs (e.g., Romanian traditional hymns) to provide an instant "aha!" moment.

**The "V2 Paid/Pro Features" List (Deferred indefinitely for now):**
*   Songs Metrics / Fatigue Alerts
*   Song Page Fully Customizable (Pro version)
*   TypeScript Migration

## Phase 2: Regional Launch Strategy (Eastern Europe)

Launching regionally in Eastern Europe (Romania, Bulgaria, Serbia, Hungary, Ukraine) provides a "home field advantage" against major platforms like Planning Center, which lack strong regional language support and localized pricing.

**Actionable Acquisition Tactics:**

1.  **The "Top-Down" Regional Approach (Associations & Conferences)**
    *   Target local worship conferences and Christian music schools.
    *   Offer the app for free to conference organizers to run their event setlists.

2.  **The "Trojan Horse" Strategy (Content Marketing)**
    *   Identify active Facebook Groups (e.g., "Resurse Inchinare", "Worship Leaders Romania").
    *   Post highly requested, perfectly formatted PDFs of new worship songs translated into the local language.
    *   *Pitch:* "I translated the chords for [Song Name]. I built it using a free tool I made for worship leaders called Setlists MD. Here is the PDF, and here is the link if you want to transpose it yourself."

3.  **Direct Outreach (Instagram DMs)**
    *   Search local hashtags (`#inchinare`, `#worshipromania`).
    *   *Message Example:* "Salut! I'm a local developer building an alternative to Planning Center that is actually translated for us and won't cost $100/month. I'm looking for 5 worship leaders to break it and tell me what sucks. Can I send you a link?"

## Phase 3: Trial & Monetization Flow

*   **Initial Launch:** Fully free, manually onboarded users to gather maximum feedback.
*   **3-Month Free Trial:** Managed manually via Supabase (a `trial_ends_at` column in the `users` table).
*   **Onboarding:** The developer manually sets the trial active after a conversation with the worship leader. Once the trial expires, the user is prompted to contact the developer to set up payment, deferring the need for complex Stripe integration until product-market fit is proven.