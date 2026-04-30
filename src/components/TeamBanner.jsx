import React from 'react';
import { cn } from '../lib/utils';

/**
 * A strip bar shown at the top of the screen when viewing a team workspace.
 * Premium orange aesthetic with a direct action to switch workspaces.
 */
export default function TeamBanner({ teamName, onChangeWorkspace, className }) {
  if (!teamName) return null;

  return (
    <div 
      className={cn(
        "w-full bg-[var(--ds-amber-700)] text-white px-4 py-2.5 flex items-center justify-center text-label-13 sm:text-label-14 font-medium shadow-sm animate-in fade-in slide-in-from-top duration-300",
        className
      )}
      style={{
        zIndex: 100,
        background: 'linear-gradient(90deg, var(--ds-amber-700) 0%, var(--ds-amber-600) 100%)',
      }}
    >
      <div className="flex items-center gap-1.5 max-w-full overflow-hidden">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-90">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        
        <span className="opacity-90 whitespace-nowrap">You're viewing</span>
        <span className="font-bold truncate">{teamName}</span>
        
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChangeWorkspace?.();
          }}
          className="ml-1 bg-white/20 hover:bg-white/30 active:scale-95 px-2.5 py-1 rounded-lg text-label-11 sm:text-label-12 transition-all border-none cursor-pointer text-white font-bold backdrop-blur-sm"
        >
          change
        </button>
      </div>
    </div>
  );
}
