import React, { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';
import SetlistCard from './SetlistCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function Dashboard({
  songs,
  setlists,
  settings,
  onSelectSong,
  onNewSong,
  onNewSetlist,
  onViewSetlist,
  onPlaySetlist,
  onGoLibrary,
  onGoSetlists
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fabRef = useRef(null);
  const searchInputRef = useRef(null);

  // Recently edited songs (latest first)
  const latestSongs = [...songs].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);

  // Upcoming setlists (soonest date first)
  const upcomingSetlists = [...setlists]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);

  // Date formatting: "Monday, April 6"
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // Greeting name
  const userName = settings?.userName || 'Guest';

  // Search results
  const searchResults = searchQuery.trim()
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close FAB popover on outside click
  useEffect(() => {
    if (!fabOpen) return;
    const handler = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [fabOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!searchOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery('');
    }
  }, [searchOpen]);

  return (
    <div className="min-h-screen material-page pb-32">

      {/* Welcome Greeting */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-2">
        <h1 className="text-heading-40 text-foreground m-0">
          Welcome, {userName}
        </h1>
        <p className="text-copy-16 text-default-500 mt-1">
          {dateStr}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Upcoming Setlists */}
        <section className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-18 text-foreground uppercase tracking-wider">
              Upcoming Setlists
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoSetlists}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-100)]"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingSetlists.map(sl => (
              <SetlistCard
                key={sl.id}
                setlist={sl}
                onPlay={() => onPlaySetlist(sl)}
                onView={() => onViewSetlist(sl)}
              />
            ))}
            {upcomingSetlists.length === 0 && (
              <div className="col-span-full py-14 text-center border-2 border-dashed border-default-200 rounded-xl flex flex-col items-center gap-3">
                <p className="text-copy-14 text-default-500 font-medium">
                  No upcoming setlists.
                </p>
                <Button variant="brand" size="sm" onClick={onNewSetlist}>
                  Create First Setlist
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Recently Edited */}
        <section className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-18 text-foreground uppercase tracking-wider">
              Recently Edited
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoLibrary}
              className="text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-100)]"
            >
              Full Library
            </Button>
          </div>

          <div className="rounded-xl border border-default-200 bg-content1 overflow-hidden divide-y divide-default-200">
            {latestSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                variant="row"
                onClick={() => onSelectSong(song)}
              />
            ))}
            {latestSongs.length === 0 && (
              <div className="py-14 text-center flex flex-col items-center gap-3">
                <p className="text-copy-14 text-default-500 font-medium">
                  Your library is empty.
                </p>
                <Button variant="brand" size="sm" onClick={onNewSong}>
                  Add Your First Song
                </Button>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          onClick={() => setSearchOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-content1 opacity-80" />

          {/* Search Content */}
          <div
            className="relative z-10 w-full max-w-lg mx-auto mt-16 px-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              ref={searchInputRef}
              placeholder="Search songs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-50"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
            />

            {searchQuery.trim() && (
              <div className="rounded-xl border border-default-200 bg-content1 overflow-hidden divide-y divide-default-200 shadow-lg">
                {searchResults.length > 0 ? (
                  searchResults.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      variant="row"
                      onClick={() => {
                        setSearchOpen(false);
                        onSelectSong(song);
                      }}
                    />
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-copy-14 text-default-500">
                    No songs found.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSearchOpen(false)}
              className="mt-2 self-center text-label-13 text-default-500 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              Press Esc or tap to close
            </button>
          </div>
        </div>
      )}

      {/* Escape key handler for search */}
      {searchOpen && <SearchEscHandler onClose={() => setSearchOpen(false)} />}

      {/* FAB Cluster */}
      <div
        ref={fabRef}
        className="fixed right-6 z-[150]"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* FAB Popover — absolutely positioned above the FABs */}
        {fabOpen && (
          <div className="absolute bottom-full right-0 mb-3 flex flex-col gap-2">
            <button
              onClick={() => { setFabOpen(false); onNewSong(); }}
              className="px-5 py-3 rounded-xl bg-content1 border border-default-200 shadow-lg cursor-pointer hover:border-default-400 transition-all duration-150 whitespace-nowrap text-label-14 text-foreground text-left"
            >
              New Song
            </button>
            <button
              onClick={() => { setFabOpen(false); onNewSetlist(); }}
              className="px-5 py-3 rounded-xl bg-content1 border border-default-200 shadow-lg cursor-pointer hover:border-default-400 transition-all duration-150 whitespace-nowrap text-label-14 text-foreground text-left"
            >
              New Setlist
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          {/* Search FAB */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-11 h-11 rounded-full bg-content1 border border-default-200 shadow-lg flex items-center justify-center cursor-pointer hover:border-default-400 transition-all duration-150 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Create FAB */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all duration-150 active:scale-95 border-none"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Small helper component to handle Escape key for search
function SearchEscHandler({ onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  return null;
}
