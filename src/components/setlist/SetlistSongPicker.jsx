import { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Chip } from '../ui/Chip';

/**
 * Song library picker — search and click to add songs.
 * Shows which songs are already in the set with a checkmark.
 */
export default function SetlistSongPicker({ songs, currentItems, onAddSong }) {
  const [search, setSearch] = useState('');

  // IDs already in set
  const inSet = useMemo(() => {
    const ids = new Set();
    currentItems.forEach(it => { if (it.songId) ids.add(it.songId); });
    return ids;
  }, [currentItems]);

  const results = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)
    );
  }, [songs, search]);

  return (
    <div className="flex flex-col gap-4">
      <p className="section-title m-0">Song Library</p>

      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Filter library…"
        prefix={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        }
      />

      <div className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] overflow-hidden divide-y divide-[var(--ds-gray-200)] max-h-[400px] overflow-y-auto">
        {results.map(song => {
          const added = inSet.has(song.id);
          return (
            <div
              key={song.id}
              role="button"
              tabIndex={0}
              onClick={() => !added && onAddSong(song)}
              onKeyDown={(e) => e.key === 'Enter' && !added && onAddSong(song)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
                added
                  ? 'bg-[var(--color-brand-soft)]'
                  : 'hover:bg-[var(--ds-gray-alpha-100)]'
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                added
                  ? 'bg-[var(--color-brand)] border-[var(--color-brand)]'
                  : 'border-[var(--ds-gray-400)] bg-transparent'
              }`}>
                {added && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-heading-14 m-0 truncate ${added ? 'text-[var(--color-brand-text)]' : 'text-[var(--ds-gray-1000)]'}`}>
                  {song.title}
                </p>
                <p className="text-copy-12 text-[var(--ds-gray-700)] m-0 mt-0.5 truncate">
                  {song.artist} · {song.key}
                </p>
              </div>
            </div>
          );
        })}
        {results.length === 0 && (
          <div className="py-8 text-center text-copy-13 text-[var(--ds-gray-600)]">
            No songs found
          </div>
        )}
      </div>
    </div>
  );
}
