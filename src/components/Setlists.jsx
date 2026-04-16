import React, { useState, useEffect, useRef, useMemo } from 'react';
import PageHeader from './PageHeader';
import SetlistCard from './SetlistCard';
import { Button } from './ui/Button';

function SkeletonCards() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2].map(section => (
        <div key={section} className="flex flex-col gap-4">
          <div className="h-5 w-28 bg-[var(--ds-gray-200)] rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(c => (
              <div key={c} className="rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-24 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                  <div className="h-4 w-16 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                </div>
                <div className="h-6 w-40 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                <div className="h-4 w-20 bg-[var(--ds-gray-200)] rounded animate-pulse" />
                <div className="flex gap-3 mt-2">
                  <div className="h-10 flex-1 bg-[var(--ds-gray-200)] rounded-md animate-pulse" />
                  <div className="h-10 flex-1 bg-[var(--ds-gray-200)] rounded-md animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Setlists({ songs, setlists, loaded = true, onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist }) {
  const [query, setQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) setFabOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setFabOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return setlists;
    const q = query.toLowerCase();
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
    <div className="min-h-screen material-page pb-32">
      <PageHeader title="Setlists" />

      <div className="a4-container flex flex-col gap-0">

        {/* Sticky Search */}
        <div className="sticky top-0 z-20 bg-[var(--ds-background-200)] pt-6 pb-4">
          <div className="relative">
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ds-gray-600)] pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search setlists…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-copy-14 text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-600)] outline-none focus:border-[var(--ds-gray-600)] transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="py-4 flex flex-col gap-10">
          {!loaded ? (
            <SkeletonCards />
          ) : (
            <>
              {/* Upcoming Section */}
              {upcoming.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-heading-18 text-[var(--ds-gray-1000)] uppercase tracking-wider">
                      Upcoming
                    </h2>
                    <span className="text-label-12 text-[var(--ds-gray-600)]">
                      {upcoming.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcoming.map(sl => (
                      <SetlistCard
                        key={sl.id}
                        setlist={sl}
                        onPlay={() => onPlaySetlist(sl)}
                        onView={() => onViewSetlist(sl)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Section */}
              {past.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-heading-18 text-[var(--ds-gray-1000)] uppercase tracking-wider">
                      Past
                    </h2>
                    <span className="text-label-12 text-[var(--ds-gray-600)]">
                      {past.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {past.map(sl => (
                      <SetlistCard
                        key={sl.id}
                        setlist={sl}
                        onPlay={() => onPlaySetlist(sl)}
                        onView={() => onViewSetlist(sl)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {filtered.length === 0 && (
                query ? (
                  <div className="py-16 text-center text-[var(--ds-gray-700)] text-copy-14">
                    No setlists matching your search.
                  </div>
                ) : (
                  <div className="py-24 border-2 border-dashed border-[var(--ds-gray-400)] rounded-2xl flex flex-col items-center text-center">
                    <div className="w-14 h-14 mb-4 rounded-full bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-gray-700)]">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </div>
                    <h2 className="text-heading-20 text-[var(--ds-gray-1000)] m-0 mb-1.5">No setlists yet</h2>
                    <p className="text-copy-14 text-[var(--ds-gray-700)] max-w-sm mb-5">
                      Organize your songs into setlists for rehearsals or live performances.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="brand" onClick={onNewSetlist}>Create setlist</Button>
                      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Import .zip</Button>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* FAB Cluster */}
      <div
        ref={fabRef}
        className="fixed right-6 z-[150]"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      >
        {fabOpen && (
          <div className="absolute bottom-full right-0 mb-3 flex flex-col gap-2">
            <button
              onClick={() => { setFabOpen(false); onNewSetlist(); }}
              className="px-5 py-3 rounded-xl bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] shadow-lg cursor-pointer hover:border-[var(--ds-gray-600)] transition-all duration-150 whitespace-nowrap text-label-14 text-[var(--ds-gray-1000)] text-left"
            >
              Create Setlist
            </button>
            <button
              onClick={() => { setFabOpen(false); fileInputRef.current?.click(); }}
              className="px-5 py-3 rounded-xl bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] shadow-lg cursor-pointer hover:border-[var(--ds-gray-600)] transition-all duration-150 whitespace-nowrap text-label-14 text-[var(--ds-gray-1000)] text-left"
            >
              Import Setlist
            </button>
          </div>
        )}

        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 rounded-full bg-[var(--color-brand)] shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all duration-150 active:scale-95 border-none"
        >
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
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
  );
}
