import React, { useState, useRef, useEffect } from 'react';
import SongCard from './SongCard';
import SetlistCard from './SetlistCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Chip } from './ui/Chip';
import PageHeader from './PageHeader';
import NotificationTray from './NotificationTray';

const SearchIconBtn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BellIconBtn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

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
  onGoSetlists,
  hasUnreadNotifications,
  notifications,
  onMarkRead,
  onNotificationAction,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifTrayOpen, setNotifTrayOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const fabRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Recently edited songs (latest first)
  const latestSongs = [...songs].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);

  // Upcoming setlists (closest date+time first, future only)
  const now = new Date();
  const upcomingSetlists = [...setlists]
    .filter(sl => {
      const slDate = new Date(`${sl.date}T${sl.time || '00:00'}:00`);
      return slDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`);
      return dateA - dateB;
    })
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

  // Close search results when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setFabOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  const formatDateFriendly = (dateStr) => {
    if (!dateStr) return 'Tonight';
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) return 'Tonight';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTimeFriendly = (timeStr) => {
    if (!timeStr) return '8:00 PM';
    return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
  };

  return (
    <div className="min-h-screen material-page pb-8">

      {/* Mobile Page Header — matches Library/Setlists header style */}
      <div className="sm:hidden">
        <PageHeader title="Home">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-[var(--ds-gray-300)] cursor-pointer text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] transition-colors"
            aria-label="Search songs"
          >
            <SearchIconBtn />
          </button>
          <button
            onClick={() => setNotifTrayOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-[var(--ds-gray-300)] cursor-pointer text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] transition-colors relative"
            aria-label="Notifications"
          >
            <BellIconBtn />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--ds-red-600)]" />
            )}
          </button>
        </PageHeader>
      </div>

      {/* Dashboard Header: Welcome + Search + Actions */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-heading-40 text-[var(--text-1)] m-0">
            Welcome, {userName}
          </h1>
          <p className="text-copy-16 text-[var(--text-2)] mt-1">
            {dateStr}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Bar - hidden on mobile header, we'll put it in content below */}
          <div className="relative w-full sm:w-64 hidden sm:block" ref={searchContainerRef}>
            <Input
              ref={searchInputRef}
              placeholder="Search songs…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              prefix={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
            />
            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full right-0 left-0 sm:left-auto sm:w-80 mt-2 rounded-xl border border-[var(--border-1)] bg-[var(--bg-1)] shadow-xl z-50 overflow-hidden divide-y divide-[var(--border-1)] max-h-[400px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(song => (
                    <div key={song.id} className="hover:bg-[var(--bg-2)] cursor-pointer">
                      <SongCard
                        song={song}
                        variant="row"
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          onSelectSong(song);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-copy-14 text-[var(--text-2)]">
                    No songs found.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0 hidden sm:flex">
            <Button variant="secondary" onClick={onNewSong}>New Song</Button>
            <Button variant="brand" onClick={onNewSetlist}>New Setlist</Button>
          </div>
        </div>
      </div>



      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Upcoming Setlists */}
        <section className="flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-20 font-bold text-[var(--text-1)]">
              Upcoming Setlists
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoSetlists}
              className="text-[var(--color-brand)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
            >
              View All
            </Button>
          </div>

          <div>
            {upcomingSetlists.length > 0 ? (
              <div className="flex flex-col md:flex-row w-full rounded-2xl overflow-hidden border border-[var(--border-1)] bg-[var(--dashboard-hero-bg)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-auto md:h-64 cursor-pointer group" onClick={() => onViewSetlist(upcomingSetlists[0])}>
                {/* Left part (Branded Gradient) */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-[var(--color-brand)] to-[#004f5e] h-32 md:h-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                {/* Right part (Details) */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-[var(--dashboard-hero-bg)] group-hover:bg-[var(--dashboard-hero-hover)] transition-colors">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {upcomingSetlists[0].tags && upcomingSetlists[0].tags.length > 0 ? (
                      upcomingSetlists[0].tags.slice(0,2).map(tag => (
                        <Chip key={tag} variant="success" size="sm">
                          {tag}
                        </Chip>
                      ))
                    ) : (
                      <Chip variant="success" size="sm">
                        Live Show
                      </Chip>
                    )}
                  </div>

                  {/* Setlist Name */}
                  <h3 className="text-heading-24 md:text-[32px] md:leading-[36px] font-bold text-[var(--text-1)] m-0 mb-3 tracking-tight">
                    {upcomingSetlists[0].name || "Untitled Setlist"}
                  </h3>

                  {/* Time & Location */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-label-14 text-[var(--ds-gray-700)] mb-6 font-medium">
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {formatDateFriendly(upcomingSetlists[0].date)} • {formatTimeFriendly(upcomingSetlists[0].time)}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {upcomingSetlists[0].location || "No Location Set"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-auto">
                    <Button
                      variant="brand"
                      className="px-6 font-bold"
                      onClick={(e) => { e.stopPropagation(); onPlaySetlist(upcomingSetlists[0]); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M8 5v14l11-7z"/></svg> 
                      Play Live
                    </Button>
                    <div className="text-label-13 text-[var(--text-2)] font-medium">
                      {upcomingSetlists[0].items.length} Songs • 1h 45m
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-14 text-center border-2 border-dashed border-[var(--border-1)] rounded-xl flex flex-col items-center gap-3">
                <p className="text-copy-14 text-[var(--text-2)] font-medium">
                  No upcoming setlists.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recently Edited */}
        <section className="flex flex-col gap-5 mt-4">
          <div className="flex justify-between items-center text-left">
            <h2 className="text-heading-20 font-bold text-[var(--text-1)]">
              Recently Edited
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoLibrary}
              className="text-[var(--color-brand)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
            >
              Full Library
            </Button>
          </div>

          <div className="rounded-xl border border-[var(--border-2)] overflow-hidden divide-y divide-[var(--border-1)] shadow-sm [&>*:nth-child(even)]:bg-[var(--dashboard-row-even-bg)] [&>*:nth-child(odd)]:bg-[var(--dashboard-row-odd-bg)]">
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
                <p className="text-copy-14 text-[var(--text-2)] font-medium">
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
      {/* FAB - Mobile Only Restoration */}
      <div
        ref={fabRef}
        className="fixed right-6 z-[150] sm:hidden flex flex-col items-center gap-3"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Search button above FAB */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="w-11 h-11 rounded-full bg-[var(--bg-1)] border border-[var(--border-1)] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[var(--bg-2)] transition-all duration-150 active:scale-95"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-1)]">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <div className="relative">
          {fabOpen && (
            <div className="absolute bottom-full right-0 mb-3 flex flex-col gap-2">
              <button
                onClick={() => { setFabOpen(false); onNewSong(); }}
                className="px-5 py-3 rounded-xl bg-[var(--bg-1)] border border-[var(--border-1)] shadow-lg cursor-pointer hover:border-[var(--border-3)] transition-all duration-150 whitespace-nowrap text-label-14 text-[var(--text-1)] text-left"
              >
                New Song
              </button>
              <button
                onClick={() => { setFabOpen(false); onNewSetlist(); }}
                className="px-5 py-3 rounded-xl bg-[var(--bg-1)] border border-[var(--border-1)] shadow-lg cursor-pointer hover:border-[var(--border-3)] transition-all duration-150 whitespace-nowrap text-label-14 text-[var(--text-1)] text-left"
              >
                New Setlist
              </button>
            </div>
          )}

          <button
            onClick={() => setFabOpen(!fabOpen)}
            className="w-14 h-14 rounded-full bg-[var(--color-brand)] shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all duration-150 active:scale-95 border-none"
            aria-label="Add new"
          >
            <svg
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[1000] bg-[var(--bg-1)] flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Input
                ref={mobileSearchInputRef}
                placeholder="Search songs…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                prefix={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
            </div>
            <Button variant="ghost" onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}>
              Cancel
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto -mx-4">
            <div className="divide-y divide-[var(--border-1)] border-t border-[var(--border-1)]">
              {searchQuery.trim().length > 0 ? (
                searchResults.length > 0 ? (
                  searchResults.map(song => (
                    <div key={song.id} className="hover:bg-[var(--bg-2)] cursor-pointer">
                      <SongCard
                        song={song}
                        variant="row"
                        onClick={() => {
                          setMobileSearchOpen(false);
                          setSearchQuery('');
                          onSelectSong(song);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-copy-16 text-[var(--text-2)]">
                    No songs found for "<strong>{searchQuery}</strong>".
                  </div>
                )
              ) : (
                <div className="px-6 py-12 text-center text-copy-14 text-[var(--text-2)] italic">
                  Search by song title or artist…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Notification Tray Modal */}
      <NotificationTray
        open={notifTrayOpen}
        onClose={() => setNotifTrayOpen(false)}
        notifications={notifications || []}
        onMarkRead={onMarkRead}
        onAction={(action) => {
          onNotificationAction?.(action);
          setNotifTrayOpen(false);
        }}
      />
    </div>
  );
}
