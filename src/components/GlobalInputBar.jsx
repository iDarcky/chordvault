import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/Button';

export default function GlobalInputBar({
  onNewSong,
  onNewSetlist,
  onSearch,
  query,
  setQuery,
  activeView
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // cmd+k or ctrl+k to focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = () => {
    if (!query.trim()) return;

    // In Library, we search natively, but we can also offer "Create X" if no results
    // Let's defer to Dashboard logic for exact 'just save it' behavior, but provide basic hooks
    if (activeView === 'home' || activeView === 'library') {
      onNewSong(query);
      setQuery('');
    } else if (activeView === 'setlists') {
      onNewSetlist(query);
      setQuery('');
    }
  };

  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter') {
      handleAction();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setQuery('');
    }
  };

  return (
    <div className={`relative flex items-center w-full max-w-2xl mx-auto transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
      <div className="absolute left-4 text-[var(--ds-gray-400)] pointer-events-none">
        <Search size={20} strokeWidth={1.5} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch?.(e.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDownInput}
        placeholder="Just save it..."
        className="w-full h-14 pl-12 pr-24 bg-[var(--ds-background-200)] text-[var(--text-1)] text-copy-16 italic placeholder:not-italic placeholder:text-[var(--ds-gray-400)] rounded-full border-none outline-none ring-1 ring-[var(--ds-gray-200)] focus:ring-2 focus:ring-[var(--ds-teal-500)] transition-shadow"
      />
      {query.trim() && (
        <div className="absolute right-2 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAction}
            className="rounded-full px-4 bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)] hover:bg-[var(--ds-teal-200)]"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
