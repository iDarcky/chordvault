import React from 'react';
import { cn } from '../lib/utils';

/**
 * A strip bar shown at the top of the screen when viewing a team workspace.
 * Refined, narrower aesthetic with a frosted amber-400 glass effect.
 */
export default function TeamBanner({ teamName, onChangeWorkspace, className }) {
  if (!teamName) return null;

  return (
    <div 
      className={cn(
        "w-full px-4 py-1.5 flex items-center justify-center text-label-12 sm:text-label-13 font-semibold shadow-sm animate-in fade-in slide-in-from-top duration-300",
        className
      )}
      style={{
        zIndex: 100,
        backgroundColor: 'color-mix(in srgb, var(--ds-amber-400), transparent 15%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: 'var(--ds-amber-950)',
        borderBottom: '1px solid color-mix(in srgb, var(--ds-amber-500), transparent 60%)',
      }}
    >
      <div className="flex items-center gap-2 max-w-full overflow-hidden">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-80">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        
        <div className="flex items-center gap-1.5 truncate">
          <span className="opacity-80 whitespace-nowrap">Viewing</span>
          <span className="font-bold truncate">{teamName}</span>
        </div>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChangeWorkspace?.();
          }}
          className="ml-1 bg-black/5 hover:bg-black/10 active:scale-95 px-2 py-0.5 rounded-md text-label-11 transition-all border-none cursor-pointer text-[var(--ds-amber-950)] font-bold"
        >
          change
        </button>
      </div>
    </div>
  );
}
