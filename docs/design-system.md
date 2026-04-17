# Setlists MD Design System (Geist)

## 1. Core UI Components

All reusable UI components are located in `src/components/ui/`. They have been built utilizing standard Geist Design System tokens (Vercel) via Tailwind V4.

| Component   | Status | Description |
| :---        | :---   | :---        |
| `Avatar`    | ✅ Ready | Circular user/profile image display. |
| `Badge`     | ✅ Ready | Tag/label component, supports variants (e.g. secondary, error). |
| `Button`    | ✅ Ready | Base button implementation with variants: `primary`, `secondary`, `ghost`, `error`, `brand`. |
| `Card`      | ✅ Ready | Core container with Geist 16px radius and standard 1px border. |
| `Checkbox`  | ✅ Ready | Standard accessible checkbox. |
| `IconButton`| ✅ Ready | Button specifically for icons, supports identical variants to `Button`. |
| `Input`     | ✅ Ready | Standard textual input field. |
| `SegmentedControl` | ✅ Ready | Custom toggle selector for switching items (e.g., Font Sizes, Columns). |
| `Select`    | ✅ Ready | Dropdown select menu. |
| `Separator` | ✅ Ready | Horizontal line divider. |
| `Spinner`   | ✅ Ready | Loading animation graphic. |
| `Switch`    | ✅ Ready | Toggle switch (on/off). |
| `Tabs`      | ✅ Ready | Underline-style navigation tabs used across the application. |
| `Toast/Toaster` | ✅ Ready | Toast notification system. |
| `Tooltip`   | ✅ Ready | Hover contextual information popup. |

---

## 2. Application Components & Views

The broader application screens and complex parts.

| Component / View   | Status | Notes |
| :---               | :---   | :---  |
| `BottomNav`        | ✅ Ready | Geist SVG icons + BG2 color theme. |
| `PageHeader`       | ✅ Ready | Minimalistic header with layout integrations. |
| `SongCard` & `SetlistCard` | ✅ Ready | Modernized with full 16px radius borders and new typography. |
| `Dashboard` & `Library` & `Setlists` | ✅ Ready | Re-laid out with generic UI items. |
| `Editor` (All Tabs)| ✅ Ready | Refactored using new UI components: `Tabs`, `Button`, `Badge`, `IconButton`. |
| `ChartView`        | ✅ Ready | Standardized with new generic controls for size and keys. |
| `Settings`         | ✅ Ready | Fully utilizes new forms of list structures and selection elements. |

---

## 3. What is Still Needed (Design Debt)

While the migration checklist is effectively largely completed, minor cleanups are required over time:

1. **Section Colors Contrast Audit**: `src/music.js` continues to use hardcoded hex colors for song sections (Verse, Chorus, Bridge, etc). These should be audited regarding semantic contrast values against standard Geist background tones.
2. **Leftover Custom Inline CSS**: Validate there’s no unnecessary `style={{ ... }}` layout declarations inside components that circumvent the Tailwind 4px/8px scalable grid. 
3. **Advanced Modal Component**: Currently the application falls back heavily on system modals. A unified `Dialog`/`Modal` window inside `src/components/ui` will help standardise popover UI, avoiding the standard native browser `window.confirm`.

