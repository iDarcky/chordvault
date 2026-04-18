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
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto flex-1">
      <div className={cn(
        "flex items-center w-full h-12 bg-[var(--ds-background-100)] rounded-full px-4 transition-shadow",
        "border border-[var(--border-1)]",
        focused ? "shadow-md border-[var(--border-2)]" : "shadow-sm hover:border-[var(--border-2)]"
      )}>
        <span className="text-[var(--text-2)] opacity-70 shrink-0">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Just save it..."
          className="w-full h-full bg-transparent border-none outline-none pl-3 pr-2 text-copy-16 text-[var(--text-1)] placeholder:text-[var(--text-2)]"
        />
        {query.length > 0 && (
          <button
            onClick={() => setQuery('')}
            className="text-[var(--text-2)] hover:text-[var(--text-1)] shrink-0 border-none bg-transparent cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--ds-background-100)] border border-[var(--border-1)] rounded-xl shadow-lg z-50 overflow-hidden animate-[fadeIn_150ms_ease-out]">
          <div className="py-2 flex flex-col">
            <button
              onClick={handleCreateSong}
              className="flex items-center gap-3 px-4 py-3 bg-transparent border-none text-left w-full hover:bg-[var(--bg-2)] cursor-pointer text-[var(--text-1)] text-copy-14 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)] shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="truncate">Create new Song with <strong>"{query}"</strong></span>
            </button>
            <div className="h-px bg-[var(--border-1)] mx-2" />
            <button
              onClick={handleCreateSetlist}
              className="flex items-center gap-3 px-4 py-3 bg-transparent border-none text-left w-full hover:bg-[var(--bg-2)] cursor-pointer text-[var(--text-1)] text-copy-14 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)] shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <span className="truncate">Create new Setlist with <strong>"{query}"</strong></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
