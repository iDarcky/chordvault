# Setlists MD: Design Audit & Geist Migration Status

## 1. Executive Summary
The application is currently in the early stages of a Geist Design System migration. While core foundations like Typography, Colors, and Backgrounds are implemented in Tailwind v4, many older components still rely on inline styles, hardcoded legacy variables, and custom `rgba` color values.

---

## 2. Design Audit Table

| Category | Current State | Geist Standards Status | Legacy Remaining |
| :--- | :--- | :--- | :--- |
| **Typography** | Geist Sans & Mono installed. Utilities defined for headings, labels, copy, and buttons. | ✅ **Core System Ready** | Extensive inline `fontSize` and `fontWeight` in `ChartView`, `Editor`, and `Settings`. |
| **Colors** | Base Geist Backgrounds (100/200) and Gray Scale (100-1000) implemented in Tailwind. | ✅ **Core Tokens Ready** | Inline `rgba` values for borders/backgrounds; inconsistent use of `--ds-gray-*` vs legacy `--border`. |
| **Icons** | Geist SVG icons implemented for BottomNav. | ⚠️ **Partial** | Unicode characters still used in `Onboarding` and `Library`. |
| **Layout** | 16px border-radius and 1px borders used in `SongCard`/`SetlistCard`. | ✅ **Card System Ready** | `ChartView` and `Editor` use outdated flex/grid spacing and rounded corners (10px/12px). |
| **Components** | `BottomNav`, `PageHeader`, `SongCard`, `SetlistCard` are modernized. | ⚠️ **Partial** | `ChartView`, `Editor`, `Onboarding`, `Welcome` are still mostly legacy. |

---

## 3. Component Inventory

### ✅ Implemented (Geist-Compliant)
- **`BottomNav`**: 64px height, Geist SVG icons, BG2 background.
- **`PageHeader`**: Line-based header, Geist typography, BG2 background.
- **`SongCard`**: 16px radius, Geist typography, hover states.
- **`SetlistCard`**: 16px radius, Geist typography, primary/secondary Geist buttons.
- **`Dashboard`**: Grid layout for cards, modernized header.

### ⚠️ Needed (Geist Foundations)
- **`Button`**: A reusable, multi-variant Geist button component (Primary, Secondary, Ghost, Error).
- **`Badge`**: A standard badge/pill component for "Service" or "Tags".
- **`Card`**: A base container component with 16px radius and standard 1px border.
- **`Input`**: A standard Geist input field with focus rings and 8px border radius.
- **`Dialog / Modal`**: A Geist-style modal for FAB menus or Search.
- **`Tabs`**: A proper Geist-style tab component (underline style) for the Editor and Settings.

### ⚠️ Needed (App-Specific Redesigns)
- **`ChartView`**: Needs a clean, high-contrast redesign using Geist Gray scale and typography.
- **`Editor`**: Needs a full refactor to use Geist Input and Tab components.
- **`StructureRibbon`**: Redesign the song structure pills to match Geist design.
- **`Onboarding/Welcome`**: Refactor to use the new Geist `Button` and `Typography` utilities.

---

## 4. Legacy Identification

- **Inline Styles**: Most components under `src/components/` (especially `Settings.jsx`, `SyncSettings.jsx`, and `SetlistPlayer.jsx`) use `style={{ ... }}` with hardcoded pixel values.
- **Color Variables**: Widespread use of legacy `--card`, `--surface`, and `--text-dim` instead of mapped Geist tokens.
- **Section Colors**: `src/music.js` contains hardcoded HEX colors for song sections (Verse, Chorus, etc.) which should be reviewed for accessibility against Geist backgrounds.
- **Spacing**: Random padding values (e.g., 14px, 20px, 80px) should be standardized using the Geist 4px/8px grid.

---

## 5. Prioritized Roadmap

1.  **Refactor Foundations**: Create standalone `Button`, `Input`, and `Badge` components.
2.  **Redesign Core Chart**: Apply Geist typography and high-contrast colors to `ChartView`.
3.  **Refactor Settings**: Remove all custom `cB` styles and use the new Geist foundations.
4.  **Modernize Editor**: Refactor the complex Editor tabs and inputs to align with the Vercel design.
5.  **Clean up Styles**: Globally replace remaining `rgba` border colors with `--ds-gray-200` or `--ds-gray-400`.
