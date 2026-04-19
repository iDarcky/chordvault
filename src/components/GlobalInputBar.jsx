import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import SearchIcon from './SearchIcon';

export default function GlobalInputBar({ onSearch, onNewSong, onNewSetlist }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  const showDropdown = focused && query.trim().length > 0;

  const handleCreateSong = () => {
    onNewSong(query.trim());
    setQuery('');
    setFocused(false);
  };

  const handleCreateSetlist = () => {
    onNewSetlist(query.trim());
    setQuery('');
    setFocused(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto flex-1 z-[110]">
      <div className={cn(
        "flex items-center w-full h-14 bg-transparent rounded-2xl px-5 transition-all duration-300 relative z-[110] group",
        focused ? "bg-[var(--ds-gray-alpha-100)] ring-1 ring-[var(--ds-gray-400)] shadow-lg" : "hover:bg-[var(--ds-gray-alpha-100)]"
      )}>
        <span className={cn(
          "shrink-0 transition-opacity duration-300",
          focused ? "text-[var(--color-brand)] opacity-100" : "text-[var(--text-2)] opacity-50 group-hover:opacity-80"
        )}>
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Just save it..."
          className="w-full h-full bg-transparent border-none outline-none pl-4 pr-2 text-heading-18 font-serif italic text-[var(--text-1)] placeholder:text-[var(--text-2)] placeholder:opacity-50"
        />
        {query.length > 0 && (
          <button
            onClick={() => setQuery('')}
            className="text-[var(--text-2)] hover:text-[var(--text-1)] shrink-0 border-none bg-transparent cursor-pointer p-2 rounded-full hover:bg-[var(--ds-gray-alpha-200)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-[var(--ds-background-100)] border border-[var(--ds-gray-alpha-200)] rounded-[20px] shadow-2xl z-[110] overflow-hidden animate-[fadeIn_150ms_ease-out]">
          <div className="p-2 flex flex-col gap-1">
            <button
              onClick={handleCreateSong}
              className="flex items-center gap-4 px-4 py-3 bg-transparent border-none text-left w-full hover:bg-[var(--ds-gray-alpha-100)] cursor-pointer rounded-xl transition-all duration-200 group/btn"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--ds-gray-alpha-100)] text-[var(--text-2)] group-hover/btn:bg-[var(--color-brand-soft)] group-hover/btn:text-[var(--color-brand)] transition-colors shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="truncate text-heading-16 text-[var(--text-1)] font-serif italic">New Song: <strong className="not-italic opacity-80">{query}</strong></span>
            </button>
            <div className="h-px bg-[var(--ds-gray-alpha-100)] mx-4" />
            <button
              onClick={handleCreateSetlist}
              className="flex items-center gap-4 px-4 py-3 bg-transparent border-none text-left w-full hover:bg-[var(--ds-gray-alpha-100)] cursor-pointer rounded-xl transition-all duration-200 group/btn"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--ds-gray-alpha-100)] text-[var(--text-2)] group-hover/btn:bg-[var(--color-brand-soft)] group-hover/btn:text-[var(--color-brand)] transition-colors shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <span className="truncate text-heading-16 text-[var(--text-1)] font-serif italic">New Show: <strong className="not-italic opacity-80">{query}</strong></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
