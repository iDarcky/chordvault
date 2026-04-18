import React, { useEffect, useMemo, useRef, useState } from 'react';
import SongCard from './SongCard';
import GlobalInputBar from './GlobalInputBar';

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MobileTopBar({
  view,
  songs,
  setlists,
  onOpenDrawer,
  onSelectSong,
  onSelectSetlist,
  onNewSong,
  onNewSetlist,
}) {
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return { songs: [], setlists: [] };
    const matchedSongs = songs
      .filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
    const matchedSetlists = setlists
      .filter(sl =>
        (sl.name || '').toLowerCase().includes(q) ||
        (sl.service || '').toLowerCase().includes(q) ||
        (sl.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 4);
    return { songs: matchedSongs, setlists: matchedSetlists };
  }, [q, songs, setlists]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeSearch = () => {
    setQuery('');
  };

  const showResults = q.length > 0;
  const hasAnyResults = results.songs.length > 0 || results.setlists.length > 0;

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-40 sm:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="bg-[var(--ds-background-100)]">
        <div className="flex items-center gap-3 px-3 py-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open menu"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-1)] cursor-pointer active:bg-[rgba(0,0,0,0.05)] transition-colors border-none bg-transparent"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <HamburgerIcon />
          </button>

          <GlobalInputBar
            onSearch={setQuery}
            onNewSong={onNewSong}
            onNewSetlist={onNewSetlist}
          />
        </div>
      </div>

      {/* Search results dropdown */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full bg-[var(--ds-background-100)] border-b border-[var(--ds-gray-200)] shadow-lg max-h-[70vh] overflow-y-auto z-50">
          {hasAnyResults ? (
            <div className="divide-y divide-[var(--border-1)]">
              {results.songs.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-label-12 uppercase tracking-wider text-[var(--text-2)]">
                    Songs
                  </div>
                  <div className="divide-y divide-[var(--border-1)]">
                    {results.songs.map(song => (
                      <div key={song.id} className="active:bg-[var(--bg-2)]">
                        <SongCard
                          song={song}
                          variant="row"
                          onClick={() => {
                            closeSearch();
                            onSelectSong?.(song);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.setlists.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-label-12 uppercase tracking-wider text-[var(--text-2)]">
                    Setlists
                  </div>
                  <div className="divide-y divide-[var(--border-1)]">
                    {results.setlists.map(sl => (
                      <button
                        key={sl.id}
                        onClick={() => {
                          closeSearch();
                          onSelectSetlist?.(sl);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-transparent border-none cursor-pointer active:bg-[var(--bg-2)] text-left"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-copy-14 text-[var(--text-1)] truncate">
                            {sl.name || 'Untitled setlist'}
                          </span>
                          <span className="text-label-12 text-[var(--text-2)] truncate">
                            {(sl.items?.length || 0)} songs{sl.date ? ` • ${formatDateShort(sl.date)}` : ''}
                          </span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-2)] shrink-0">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-copy-14 text-[var(--text-2)]">
              No matches for "<span className="text-[var(--text-1)]">{query}</span>".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
