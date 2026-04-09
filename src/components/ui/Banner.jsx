import React, { useState } from 'react'; // 1. We imported 'useState' (The Memory Tool)
import { cn } from '../../lib/utils';

/**
 * Banner V3: The "Interactive" Blueprint
 * Now it can remember if it should be hidden!
 */
export function Banner({ message, type = 'info', ctaLabel, ctaHref, className }) {
  // 2. Here is our "Memory" (State)
  // 'isVisible' is the current memory (true/false)
  // 'setIsVisible' is the button that changes that memory
  const [isVisible, setIsVisible] = useState(true);

  const styles = {
    info: {
      bg: 'var(--ds-blue-100)',
      border: 'var(--ds-blue-400)',
      text: 'var(--ds-blue-1000)',
      accent: 'var(--ds-blue-700)',
      label: 'Update'
    },
    success: {
      bg: 'var(--ds-green-100)',
      border: 'var(--ds-green-400)',
      text: 'var(--ds-green-1000)',
      accent: 'var(--ds-green-700)',
      label: '' // You removed this one during your experiment!
    },
    warning: {
      bg: 'var(--ds-amber-100)',
      border: 'var(--ds-amber-400)',
      text: 'var(--ds-amber-1000)',
      accent: 'var(--ds-amber-700)',
      label: 'Notice'
    },
    error: {
      bg: 'var(--ds-red-100)',
      border: 'var(--ds-red-400)',
      text: 'var(--ds-red-1000)',
      accent: 'var(--ds-red-700)',
      label: 'Danger'
    }
  };

  const config = styles[type] || styles.info;

  // 3. If memory says "Hide me", we return nothing.
  if (!isVisible || !message) return null;

  return (
    <div 
      className={cn(
        "w-full px-6 py-3 flex items-center justify-between transition-all duration-300",
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderBottom: `1px solid ${config.border}`
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accent }} />
        
        <p className="text-copy-14 font-medium m-0" style={{ color: config.text }}>
          {message}
        </p>

        {ctaLabel && (
          <a 
            href={ctaHref || "#"}
            className="text-copy-14 font-bold underline underline-offset-4 ml-2 hover:opacity-70 transition-opacity"
            style={{ color: config.accent }}
          >
            {ctaLabel}
          </a>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* 4. We only show the label IF it exists (Your design choice!) */}
        {config.label && (
          <div 
            className="text-[9px] uppercase font-black tracking-[0.2em] opacity-40 select-none"
            style={{ color: config.accent }}
          >
            {config.label}
          </div>
        )}

        {/* 5. The Close Button (The Interactivity) */}
        <button 
          onClick={() => setIsVisible(false)} // When clicked, change memory to 'false'
          className="p-1 hover:bg-black/5 rounded-md transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
          style={{ color: config.accent }}
          title="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
