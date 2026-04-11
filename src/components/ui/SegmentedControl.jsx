import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Geist-style segmented control for mutually exclusive options.
 * Replaces the toggle-group pattern used 8+ times across the app
 * (Layout: Auto/1col/2col, Size: S/M/L, Theme: Dark/Light, etc.)
 *
 * Usage:
 *   <SegmentedControl
 *     value={settings.theme}
 *     onChange={(v) => update('theme', v)}
 *     options={[
 *       { value: 'dark', label: 'Dark' },
 *       { value: 'light', label: 'Light' },
 *     ]}
 *   />
 */
function SegmentedControl({ options, value, onChange, size = 'sm', className }) {
  return (
    <div className={cn(
      "flex p-1 rounded-lg bg-default-200",
      className
    )}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            disabled={opt.disabled}
            className={cn(
              "rounded-md font-medium transition-all duration-100 cursor-pointer border-none",
              size === 'xs' && "px-2 py-1 text-label-10",
              size === 'sm' && "px-3 py-1 text-label-12",
              size === 'md' && "px-4 py-1.5 text-button-14",
              active
                ? "bg-content1 text-foreground shadow-sm"
                : "bg-transparent text-default-800 hover:text-foreground",
              opt.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
