# Design System Rules

This document serves as the official source of truth for the Setlists MD Design System functional mapping.

## 1. Functional Color Scale (1–10)
All color scales (Gray, Blue, Red, Amber, Green, Teal, Purple, Pink) follow this numeric logic. The values correspond to the `--ds-*-[100-1000]` scale.

| Logic | Scale | Functional Role | Global Alias |
| :--- | :--- | :--- | :--- |
| **Color 1** | `100` | Default Background | `--bg-1` |
| **Color 2** | `200` | Hover Background | `--bg-2` |
| **Color 3** | `300` | Active Background | `--bg-3` |
| **Color 4** | `--`  | *Reserved* | - |
| **Color 4** | `400` | Default Border | `--border-1` |
| **Color 5** | `500` | Hover Border | `--border-2` |
| **Color 6** | `600` | Active Border | `--border-3` |
| **Color 7** | `700` | High Contrast BG | `--bg-hc-1` |
| **Color 8** | `800` | HC Hover BG | `--bg-hc-2` |
| **Color 9** | `900` | Secondary Text | `--text-2` |
| **Color 10**| `1000`| Primary Text | `--text-1` |

## 2. Page Backgrounds
Page canvases must use the specific background tokens to ensure depth consistency.

| Token | Dark Mode | Light Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--ds-background-100` | `#0a0a0a` | `#FFFFFF` | Panels, Insets, Secondary containers |
| `--ds-background-200` | `#000000` | `#F9FAFB` | **Primary Page/Body Background** |

> [!IMPORTANT]
> **Primary Rule**: Use `--ds-background-200` for the page `body` or main scrollable container. Use `--ds-background-100` for cards or panels that sit *on top* of the page.

## 3. Implementation Guidelines
- Prefer global semantic aliases (`--bg-1`, `--border-1`, etc.) over direct scale variables (`--ds-gray-100`) for generic UI components.
- Direct scale variables can still be used for status-specific elements (e.g., `var(--ds-red-100)` for an error card BG).
- No hardcoded hex values in component files.

