# Vercel Theme Migration — Full Audit Report

A thorough page-by-page and component-by-component audit of the current state of the Geist/Vercel design migration.

## Quick Summary

The **foundation** (colors, fonts, material classes) is solid. The main issues are **inconsistency**: some components were updated to the new `--ds-*` design tokens while others still reference the old `var(--bg)`, `var(--text-muted)`, `var(--border)`, `var(--surface)` variables. This creates a "half-migrated" feel rather than a cohesive Vercel aesthetic.

---

## Page-by-Page Issues

### 1. Welcome Page (`Welcome.jsx`)
````carousel
![Welcome Page](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/.system_generated/click_feedback/click_feedback_1775430847539.png)
<!-- slide -->
> [!WARNING]
> **Still uses old CSS variables throughout:**
> - `var(--bg)` instead of `var(--ds-background-200)`  
> - `var(--text-bright)`, `var(--text-muted)`, `var(--text-dim)` instead of `--ds-gray-*`
> - `var(--accent)`, `var(--accent-soft)`, `var(--accent-border)` — these are fine (brand color)
> 
> **Button styling is inline, not using `<Button>` component** — the "Get Started" CTA uses raw inline styles with `borderRadius: 12`, bypassing the design system entirely.
````

### 2. Onboarding (`Onboarding.jsx`)
- Same old variable problem: `var(--bg)`, `var(--text-bright)`, `var(--text-muted)`, `var(--border)`, `var(--surface)`
- Inline-styled buttons with `borderRadius: 10` — not aligned with Geist's `6px` standard
- "Back" button uses `var(--surface)`/`var(--border)` instead of design tokens

### 3. Dashboard
![Dashboard](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/.system_generated/click_feedback/click_feedback_1775430888271.png)

> [!NOTE]
> Dashboard looks **decent** overall. Uses `material-page` background correctly. The card and section headers are clean.

**Issues:**
- The dashed empty-state border (`border-dashed`) feels more like a wireframe than a finished Vercel surface
- "View All" / "Full Library" links are very small and easy to miss

### 4. Library
![Library](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/.system_generated/click_feedback/click_feedback_1775430900431.png)

**Issues:**
- Layout looks good overall
- Song card is using the updated `Card` component ✅
- Search bar is properly centered ✅

### 5. Setlists
![Setlists](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/.system_generated/click_feedback/click_feedback_1775430910222.png)

**Issues:**
- Same dashed empty-state container as Dashboard — feels unfinished

### 6. Settings
![Settings](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/.system_generated/click_feedback/click_feedback_1775431029961.png)

> [!IMPORTANT]
> **SyncSettings.jsx still has `hover:bg-[var(--ds-gray-100)]` on its rows** — we fixed Settings.jsx but missed this sub-component. The hover issue is still present in the Cloud Sync section.

### 7. ChartView
![ChartView](/C:/Users/Daniel/.gemini/antigravity/brain/3874010d-dc98-4e89-a459-dfdd67c11866/chart_view_verification_1775431145266.png)

> [!WARNING]
> **ChartView is 100% inline-styled with old variables.** This is the biggest gap in the migration:
> - `var(--bg)` for background
> - `var(--header-bg)` with `backdrop-filter: blur(16px)` — header glassmorphism works but relies on legacy vars
> - `var(--border)`, `var(--surface)`, `var(--text)`, `var(--text-muted)` everywhere
> - All buttons use raw `btnStyle` objects with old tokens
> - The `toggleStyle` function uses `var(--accent)`, `var(--accent-soft)`, etc.
> 
> **Verdict:** Functionally fine because the old vars still resolve. But this is NOT migrated.

### 8. Editor (`Editor.jsx`)
- Same as ChartView — 100% inline-styled with old variables
- `var(--header-bg)`, `var(--bg)`, `var(--border)`, `var(--text-muted)`, etc.
- `iconBtnStyle` and `statPillStyle` constants use `var(--surface)`, `var(--border)`, `var(--text-dim)`
- Save/Delete buttons use inline border-radius `7` and old color vars

---

## Component-Level Issues

| Component | Status | Issues |
|-----------|--------|--------|
| `Button.jsx` | ✅ Migrated | Uses `--ds-*` tokens, 6px radius, 100ms transitions |
| `Input.jsx` | ✅ Migrated | Correct tokens and sizing |
| `Select.jsx` | ✅ Migrated | Correct tokens |
| `Card.jsx` | ✅ Migrated | 12px radius, border-only hover |
| `Switch.jsx` | ✅ Migrated | Proper Vercel sizing (24×44) |
| `Badge.jsx` | ✅ Migrated | Clean bordered default variant |
| `Checkbox.jsx` | ✅ Migrated | Uses `--ds-*` tokens |
| `Separator.jsx` | ⚠️ Not checked | Likely fine |
| `PageHeader.jsx` | ⚠️ Mixed | Uses `var(--ds-background-200)` ✅ but title uses `var(--text-bright)` ❌ |
| `BottomNav.jsx` | ⚠️ Mixed | Uses `var(--ds-background-200)` ✅ but icons use `var(--text-bright)`/`var(--text-muted)` ❌ |
| `SyncSettings.jsx` | ❌ Not fixed | Still has `hover:bg` on rows |
| `SongCard.jsx` | ✅ Migrated | Uses Card + `--ds-gray-*` tokens |
| `SetlistCard.jsx` | ✅ Migrated | Uses Card + `--ds-gray-*` tokens |
| `ChartView.jsx` | ❌ Not migrated | 100% old inline vars |
| `SectionBlock.jsx` | ❌ Not migrated | 100% old inline vars |
| `Editor.jsx` | ❌ Not migrated | 100% old inline vars |
| `Welcome.jsx` | ❌ Not migrated | Old inline vars |
| `Onboarding.jsx` | ❌ Not migrated | Old inline vars |
| `SetlistBuilder.jsx` | ❌ Not checked | Likely old vars |
| `SetlistOverview.jsx` | ❌ Not checked | Likely old vars |
| `SetlistPlayer.jsx` | ❌ Not checked | Likely old vars |

---

## Root Cause

The migration so far touched:
1. **`index.css`** — Added the `--ds-*` tokens and material classes ✅
2. **Atomic UI components** (`Button`, `Input`, `Card`, etc.) — Updated ✅ 
3. **Page wrappers** (`Dashboard`, `Library`, `Setlists`, `Settings`) — Changed outer `<div>` backgrounds ✅

But it **did NOT** touch:
- The inline styles in `ChartView`, `Editor`, `SectionBlock` (the engine)
- The inline styles in `Welcome`, `Onboarding` (the flows)
- The inline styles in `PageHeader`, `BottomNav` (the shell)
- The `SyncSettings` sub-component hover states

> [!IMPORTANT]
> **The old CSS vars (`--bg`, `--text`, `--border`, etc.) still exist in `index.css` and still resolve** — so nothing is visually broken. But the codebase is in a "dual-system" state where half the components use new tokens and half use old ones.

---

## What Actually Needs To Be Done

To complete the migration properly, every component with inline `var(--bg)`, `var(--text-muted)`, `var(--border)`, `var(--surface)` references needs to be updated to use the `--ds-*` equivalents. The mapping is:

| Old Variable | New Equivalent |
|-------------|----------------|
| `var(--bg)` | `var(--ds-background-200)` |
| `var(--surface)` | `var(--ds-background-100)` |
| `var(--border)` | `var(--ds-gray-400)` |
| `var(--text-bright)` | `var(--ds-gray-1000)` |
| `var(--text)` | `var(--ds-gray-900)` |
| `var(--text-muted)` | `var(--ds-gray-700)` |
| `var(--text-dim)` | `var(--ds-gray-500)` |

However, since all old vars resolve correctly, **nothing is functionally broken** — this is purely a consistency cleanup.
