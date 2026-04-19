import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import PageHeader from './PageHeader';
import SetlistCard from './SetlistCard';
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

const SetlistOverview = lazy(() => import('./SetlistOverview'));

function SkeletonCards() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2].map(section => (
        <div key={section} className="flex flex-col gap-4">
          <div className="h-5 w-28 bg-[var(--ds-gray-200)] rounded animate-pulse" />
          <div className="flex flex-col gap-4">
            {[1, 2].map(c => (
              <div key={c} className="flex flex-col md:flex-row rounded-2xl border border-[var(--border-1)] bg-[var(--ds-background-100)] h-auto md:h-64 overflow-hidden">
                <div className="w-full md:w-1/3 h-32 md:h-full bg-[var(--ds-gray-200)] animate-pulse" />
                <div className="flex-1 p-8 flex flex-col gap-3">
                  <div className="h-5 w-20 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                  <div className="h-8 w-56 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                  <div className="h-4 w-40 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                  <div className="h-10 w-32 bg-[var(--ds-gray-200)] rounded-md animate-pulse mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Setlists({
  songs,
  setlists,
  loaded = true,
  onViewSetlist,
  onPlaySetlist,
  onNewSetlist,
  onImportSetlist,
  previewSetlistId = null,
  onSelectPreview,
  isFullscreen = false,
  onToggleFullscreen,
  onEditSetlist,
  onExportSetlist,
  onDeleteSetlist,
  globalSearchQuery,
}) {
  const isDesktop = useIsDesktop();
  const previewSetlist = useMemo(
    () => setlists.find(s => s.id === previewSetlistId) || null,
    [setlists, previewSetlistId],
  );

  const handleView = (sl) => {
    if (isDesktop && onSelectPreview) onSelectPreview(sl.id);
    else onViewSetlist(sl);
  };
  const [query, setQuery] = useState('');
  const activeQuery = globalSearchQuery !== undefined ? (globalSearchQuery || query) : query;
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!activeQuery) return setlists;
    const q = activeQuery.toLowerCase();
    return setlists.filter(sl =>
      (sl.name || '').toLowerCase().includes(q) ||
      (sl.service || '').toLowerCase().includes(q) ||
      (sl.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [setlists, query]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { upcoming, past } = useMemo(() => {
    const upcoming = [];
    const past = [];
    filtered.forEach(sl => {
      const slDate = new Date(sl.date + 'T12:00:00');
      if (slDate >= today) {
        upcoming.push(sl);
      } else {
        past.push(sl);
      }
    });
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { upcoming, past };
  }, [filtered]);

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
        <PageHeader title="Setlists" />
      </div>

      <div className="flex flex-col gap-0">

        {/* Global Input Bar — hidden on mobile (global top-bar covers it) */}
        <div className="sticky top-0 z-20 bg-[var(--ds-background-100)] hidden sm:block">
          <div className="a4-container py-4 flex items-center justify-center">
            <GlobalInputBar
              onSearch={setQuery}
              onNewSong={() => {
                if (window.appNavigation) window.appNavigation('library');
              }}
              onNewSetlist={(title) => { onNewSetlist(title); }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="a4-container py-8 flex flex-col gap-10">
          {!loaded ? (
            <SkeletonCards />
          ) : (
            <>
              {/* Upcoming Section */}
              {upcoming.length > 0 && (
                <section className="flex flex-col gap-8">
                  <div className="flex items-end gap-3 border-b border-[var(--border-1)] pb-4">
                    <h2 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                      Upcoming
                    </h2>
                    <span className="text-label-14 font-serif italic text-[var(--text-2)] opacity-60 mb-1">
                      {upcoming.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {upcoming.map(sl => (
                      <SetlistCard
                        key={sl.id}
                        setlist={sl}
                        selected={isDesktop && sl.id === previewSetlistId}
                        onPlay={() => onPlaySetlist(sl)}
                        onView={() => handleView(sl)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Section */}
              {past.length > 0 && (
                <section className="flex flex-col gap-8 mt-12">
                  <div className="flex items-end gap-3 border-b border-[var(--border-1)] pb-4">
                    <h2 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                      Past
                    </h2>
                    <span className="text-label-14 font-serif italic text-[var(--text-2)] opacity-60 mb-1">
                      {past.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {past.map(sl => (
                      <SetlistCard
                        key={sl.id}
                        setlist={sl}
                        selected={isDesktop && sl.id === previewSetlistId}
                        onPlay={() => onPlaySetlist(sl)}
                        onView={() => handleView(sl)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {filtered.length === 0 && (
                query ? (
                  <div className="py-24 text-center text-[var(--text-2)] font-serif italic text-heading-20 opacity-50">
                    No setlists matching "{activeQuery}".
                  </div>
                ) : (
                  <div className="py-32 flex flex-col items-center text-center">
                    <h2 className="text-heading-24 font-serif text-[var(--text-2)] opacity-50 m-0 italic">No shows yet</h2>
                    <p className="text-copy-16 text-[var(--text-2)] opacity-50 max-w-sm mt-4">
                      Create your first setlist by searching above, or import a .zip file.
                    </p>
                    <div className="mt-8">
                      <button onClick={() => fileInputRef.current?.click()} className="text-label-13 uppercase tracking-widest font-semibold text-[var(--text-2)] bg-transparent border-none cursor-pointer hover:text-[var(--text-1)] transition-colors opacity-60 hover:opacity-100">
                        Import .zip
                      </button>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onImportSetlist(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      </div>

      {/* Preview pane — desktop only */}
      <div className="hidden lg:flex lg:flex-1 lg:min-w-0 lg:h-screen lg:flex-col lg:bg-[var(--ds-background-100)] lg:overflow-y-auto">
        {previewSetlist ? (
          <Suspense fallback={<div className="p-8 text-copy-14 text-[var(--ds-gray-700)]">Loading…</div>}>
            <SetlistOverview
              key={previewSetlist.id}
              setlist={previewSetlist}
              songs={songs}
              onBack={() => {
                if (isFullscreen) onToggleFullscreen?.();
                onSelectPreview?.(null);
              }}
              onEdit={() => onEditSetlist?.(previewSetlist)}
              onExport={() => onExportSetlist?.(previewSetlist)}
              onPlay={() => onPlaySetlist(previewSetlist)}
              onDelete={() => onDeleteSetlist?.(previewSetlist.id)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
            />
          </Suspense>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-8 py-16">
            <div className="w-14 h-14 rounded-full bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-gray-700)]">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <p className="text-copy-14 text-[var(--ds-gray-700)] max-w-xs">
              Select a setlist from the list to preview it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
