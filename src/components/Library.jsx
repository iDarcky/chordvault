import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import PageHeader from './PageHeader';
import SongCard from './SongCard';
import GlobalInputBar from './GlobalInputBar';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { useIsDesktop } from '../lib/useMediaQuery';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChartView = lazy(() => import('./ChartView'));

const SORT_MODES = [
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'key', label: 'Key' },
];

function formatRelativeTime(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGroupKey(song, sortMode) {
  if (sortMode === 'title') {
    const first = (song.title || '').trim()[0]?.toUpperCase();
    return first && /[A-Z]/.test(first) ? first : '#';
  }
  if (sortMode === 'artist') {
    return (song.artist || 'Unknown').trim();
  }
  if (sortMode === 'key') {
    return (song.key || 'C').replace(/[#bmb]/g, '').toUpperCase();
  }
  return '#';
}

function groupAndSort(songs, sortMode, sortAsc) {
  const groups = {};
  songs.forEach(song => {
    const key = getGroupKey(song, sortMode);
    if (!groups[key]) groups[key] = [];
    groups[key].push(song);
  });

  const dir = sortAsc ? 1 : -1;

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    if (sortMode === 'key') {
      const order = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      return (order.indexOf(a) - order.indexOf(b)) * dir;
    }
    return a.localeCompare(b) * dir;
  });

  sortedKeys.forEach(key => {
    groups[key].sort((a, b) => a.title.localeCompare(b.title) * dir);
  });

  return { groups, sortedKeys };
}

// Skeleton rows for loading state
function SkeletonRows() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map(g => (
        <div key={g} className="flex flex-col gap-3">
          <div className="h-5 w-8 bg-[var(--bg-2)] rounded animate-pulse mx-1" />
          <div className="rounded-xl border border-[var(--border-1)] bg-[var(--bg-1)] overflow-hidden divide-y divide-[var(--border-1)]">
            {[1, 2, 3].map(r => (
              <div key={r} className="flex items-center justify-between px-5 py-4">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-40 bg-[var(--bg-2)] rounded animate-pulse" />
                  <div className="h-3 w-24 bg-[var(--bg-2)] rounded animate-pulse" />
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="h-3 w-6 bg-[var(--bg-2)] rounded animate-pulse" />
                  <div className="h-3 w-14 bg-[var(--bg-2)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const INITIAL_VISIBLE = 100;
const VISIBLE_PAGE_SIZE = 100;

export default function Library({
  songs,
  loaded = true,
  onSelectSong,
  onNewSong,
  onImportSong,
  onPasteImport,
  previewSongId = null,
  onSelectPreview,
  isFullscreen = false,
  onToggleFullscreen,
  onEditSong,
  chartDefaults = {},
  globalSearchQuery,
}) {
  const isDesktop = useIsDesktop();
  const previewSong = useMemo(
    () => songs.find(s => s.id === previewSongId) || null,
    [songs, previewSongId],
  );

  const handleRowClick = (song) => {
    if (isDesktop && onSelectPreview) {
      onSelectPreview(song.id);
    } else {
      onSelectSong(song);
    }
  };

  const [query, setQuery] = useState('');
  const activeQuery = globalSearchQuery !== undefined ? (globalSearchQuery || query) : query;
  const [sortMode, setSortMode] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const tagsRef = useRef(null);
  const fileInputRef = useRef(null);
  const sentinelRef = useRef(null);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    songs.forEach(s => s.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [songs]);

  useEffect(() => {
    const handler = (e) => {
      if (tagsRef.current && !tagsRef.current.contains(e.target)) setTagsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setTagsOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    let result = songs;
    if (query) {
      const q = activeQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        (s.key || '').toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter(s =>
        selectedTags.every(tag => s.tags?.includes(tag))
      );
    }
    return result;
  }, [songs, query, selectedTags]);

  // Reset pagination when filter criteria change so the user doesn't stay
  // scrolled into a stale reveal window.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [query, selectedTags, sortMode, sortAsc]);

  const truncated = useMemo(
    () => filtered.length > visibleCount ? filtered.slice(0, visibleCount) : filtered,
    [filtered, visibleCount]
  );
  const hasMore = filtered.length > truncated.length;

  const { groups, sortedKeys } = useMemo(
    () => groupAndSort(truncated, sortMode, sortAsc),
    [truncated, sortMode, sortAsc]
  );

  // Lazy-reveal the next page when the sentinel enters the viewport.
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisibleCount(c => c + VISIBLE_PAGE_SIZE);
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSortClick = (modeKey) => {
    if (sortMode === modeKey) {
      setSortAsc(prev => !prev);
    } else {
      setSortMode(modeKey);
      setSortAsc(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen">
      <div
        className={cn(
          "relative min-w-0 material-page pb-8",
          "lg:h-screen lg:overflow-y-auto lg:border-r lg:border-[var(--ds-gray-200)]",
          "flex-1 lg:flex-none lg:w-[480px] xl:w-[560px]",
          isFullscreen && "lg:hidden",
        )}
      >
      <div className="hidden sm:block">
        <PageHeader title="Song Library" />
      </div>

      <div className="flex flex-col gap-0">

        {/* Sticky Search + Global Input Bar */}
        <div className="sticky top-0 z-20 bg-[var(--ds-background-100)] hidden sm:block">
          <div className="a4-container py-4 flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <GlobalInputBar
                onSearch={setQuery}
                onNewSong={(title) => onNewSong(title)}
                onNewSetlist={() => {
                   if (window.appNavigation) window.appNavigation('setlists');
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Tags Dropdown */}
              {allTags.length > 0 && (
                <div ref={tagsRef} className="relative">
                  <button
                    onClick={() => setTagsOpen(!tagsOpen)}
                    className={`
                      h-9 px-3 rounded-full border cursor-pointer
                      flex items-center gap-1.5
                      text-label-13 transition-all duration-150
                      ${selectedTags.length > 0
                        ? 'border-[var(--color-brand)] text-[var(--color-brand)] bg-[var(--color-brand-soft)]'
                        : 'border-[var(--border-1)] text-[var(--text-1)] bg-transparent hover:border-[var(--border-3)]'
                      }
                    `}
                  >
                    {selectedTags.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                    )}
                    Tags{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform duration-150 ${tagsOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {tagsOpen && (
                    <div className="absolute left-0 top-full mt-2 w-[220px] rounded-xl border border-[var(--border-1)] bg-[var(--bg-1)] shadow-lg z-50 overflow-hidden">
                      {allTags.length > 5 && (
                        <div className="px-3 pt-3 pb-2">
                          <input
                            type="text"
                            placeholder="Search tags…"
                            value={tagQuery}
                            onChange={e => setTagQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-full h-8 px-3 rounded-lg border border-[var(--border-1)] bg-[var(--bg-2)] text-copy-13 text-[var(--text-1)] placeholder:text-[var(--text-2)] outline-none focus:border-[var(--border-3)] transition-colors"
                          />
                        </div>
                      )}
                      <div className="flex flex-col py-1 max-h-[320px] overflow-y-auto">
                        {(() => {
                          const tq = tagQuery.toLowerCase();
                          const filteredTags = allTags.filter(t => t.toLowerCase().includes(tq));
                          const selected = filteredTags.filter(t => selectedTags.includes(t));
                          const unselected = filteredTags.filter(t => !selectedTags.includes(t)).slice(0, 10 - selected.length);
                          const visible = [...selected, ...unselected];
                          const hasMore = filteredTags.length > visible.length;
                          return (
                            <>
                              {visible.map(tag => (
                                <label
                                  key={tag}
                                  className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[var(--bg-2)] transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => toggleTag(tag)}
                                    className="w-4 h-4 rounded accent-[var(--color-brand)] cursor-pointer"
                                  />
                                  <span className="text-copy-14 text-[var(--text-1)]">{tag}</span>
                                </label>
                              ))}
                              {visible.length === 0 && (
                                <div className="px-4 py-3 text-copy-13 text-[var(--text-2)]">No tags found</div>
                              )}
                              {hasMore && (
                                <div className="px-4 py-2 text-copy-12 text-[var(--ds-gray-600)]">
                                  {filteredTags.length - visible.length} more — refine search
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      {selectedTags.length > 0 && (
                        <>
                          <div className="border-t border-[var(--border-1)]" />
                          <button
                            onClick={() => { setSelectedTags([]); setTagQuery(''); }}
                            className="w-full px-4 py-2.5 text-copy-14 text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--ds-gray-alpha-100)] transition-colors cursor-pointer bg-transparent border-none text-center"
                          >
                            Clear all
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sort Pills */}
              <div className="flex items-center gap-1.5 ml-auto">
                {SORT_MODES.map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => handleSortClick(mode.key)}
                    className={`
                      px-3 py-1.5 rounded-full text-label-12 font-semibold cursor-pointer
                      transition-all duration-150 border border-transparent flex items-center gap-1
                      ${sortMode === mode.key
                        ? 'bg-[var(--text-1)] text-[var(--bg-1)]'
                        : 'bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-2)] border-[var(--border-1)]'
                      }
                    `}
                  >
                    {mode.label.toUpperCase()}
                    {sortMode === mode.key && (
                      <svg
                        width="10" height="10" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform duration-200 ${sortAsc ? '' : 'rotate-180'}`}
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="a4-container py-8">
          {!loaded ? (
            <SkeletonRows />
          ) : sortedKeys.length > 0 ? (
            <div className="flex flex-col gap-10">
              {sortedKeys.map(groupKey => (
                <div key={groupKey} className="flex flex-col gap-8">
                  <div className="flex items-end gap-3 border-b border-[var(--border-1)] pb-4 mt-6">
                    <h3 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                      {groupKey}
                    </h3>
                    <span className="text-label-14 font-serif italic text-[var(--text-2)] opacity-60 mb-1">
                      {groups[groupKey].length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {groups[groupKey].map(song => (
                      <SongCard
                        key={song.id}
                        song={song}
                        variant="card"
                        showTags={true}
                        selected={isDesktop && song.id === previewSongId}
                        onClick={() => handleRowClick(song)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {hasMore && (
                <div ref={sentinelRef} className="py-12 text-center text-copy-14 font-serif italic text-[var(--text-2)] opacity-50">
                  Loading more… ({truncated.length} of {filtered.length})
                </div>
              )}
            </div>
          ) : query || selectedTags.length > 0 ? (
            <div className="py-24 text-center text-[var(--text-2)] font-serif italic text-heading-20 opacity-50">
              No songs matching "{activeQuery}".
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center text-center">
              <h2 className="text-heading-24 font-serif text-[var(--text-2)] opacity-50 m-0 italic">Your library is empty</h2>
              <p className="text-copy-16 text-[var(--text-2)] opacity-50 max-w-sm mt-4">
                Start typing in the bar above to create a new song, or use the options below to import.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                {onPasteImport && (
                  <button onClick={onPasteImport} className="text-label-13 uppercase tracking-widest font-semibold text-[var(--text-2)] bg-transparent border-none cursor-pointer hover:text-[var(--text-1)] transition-colors opacity-60 hover:opacity-100">
                    Paste text
                  </button>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="text-label-13 uppercase tracking-widest font-semibold text-[var(--text-2)] bg-transparent border-none cursor-pointer hover:text-[var(--text-1)] transition-colors opacity-60 hover:opacity-100">
                  Import .md
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => onImportSong(ev.target.result);
            reader.readAsText(file);
          }
          e.target.value = '';
        }}
        className="hidden"
      />
      </div>

      {/* Preview pane — desktop only */}
      <div className="hidden lg:flex lg:flex-1 lg:min-w-0 lg:h-screen lg:flex-col lg:bg-[var(--ds-background-100)]">
        {previewSong ? (
          <Suspense fallback={<div className="p-8 text-copy-14 text-[var(--ds-gray-700)]">Loading…</div>}>
            <ChartView
              key={previewSong.id}
              song={previewSong}
              onBack={() => {
                if (isFullscreen) onToggleFullscreen?.();
                onSelectPreview?.(null);
              }}
              onEdit={() => onEditSong?.(previewSong)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
              {...chartDefaults}
            />
          </Suspense>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-8 py-16">
            <div className="w-14 h-14 rounded-full bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-gray-700)]">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <p className="text-copy-14 text-[var(--ds-gray-700)] max-w-xs">
              Select a song from the library to preview it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
