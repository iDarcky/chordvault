import React, { useState } from 'react';
import SongCard from './SongCard';
import GlobalInputBar from './GlobalInputBar';

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
}) {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen material-page pb-16">

      {/* Dashboard Header: Welcome + Search + Actions */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 flex flex-col gap-12 text-center items-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-copy-16 text-[var(--text-2)] font-serif italic opacity-60 m-0">
            {dateStr}
          </p>
          <h1 className="text-heading-48 text-[var(--text-1)] m-0 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}
          </h1>
        </div>

        <div className="hidden sm:block w-full z-40 relative mt-4">
          <GlobalInputBar
            onSearch={setSearchQuery}
            onNewSong={(title) => {
               onNewSong(title);
            }}
            onNewSetlist={(title) => {
               onNewSetlist(title);
            }}
          />
        </div>
      </div>



      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">
        {searchQuery.trim().length > 0 ? (
          <div className="flex flex-col gap-8 mt-8">
            <div className="flex justify-between items-end border-b border-[var(--border-1)] pb-4">
              <h2 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                Search Results
              </h2>
              <span className="text-label-14 font-serif italic text-[var(--text-2)] opacity-60 mb-1">
                {searchResults.length}
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {searchResults.map(song => (
                  <SongCard
                    key={song.id}
                    song={song}
                    variant="card"
                    onClick={() => {
                      setSearchQuery('');
                      onSelectSong(song);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center flex flex-col items-center gap-4">
                <p className="text-heading-20 text-[var(--text-2)] opacity-50 font-serif italic m-0">
                  No songs found matching "{searchQuery}".
                </p>
                <p className="text-copy-16 text-[var(--text-2)] opacity-50 max-w-sm mt-0">
                  Press enter to create a new song or setlist with this name.
                </p>
              </div>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 animate-[fadeIn_300ms_ease-out]">
          {/* Upcoming Setlists */}
          <section className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-[var(--border-1)] pb-4">
              <h2 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                Upcoming Show
              </h2>
              <button
                onClick={onGoSetlists}
                className="text-label-13 uppercase tracking-widest font-semibold text-[var(--text-2)] bg-transparent border-none cursor-pointer hover:text-[var(--text-1)] transition-colors opacity-60 hover:opacity-100"
              >
                View All
              </button>
            </div>

            <div>
              {upcomingSetlists.length > 0 ? (
                <div className="flex flex-col w-full rounded-[32px] overflow-hidden bg-[var(--ds-background-200)] cursor-pointer group transition-all duration-300 hover:shadow-2xl border-none" onClick={() => onViewSetlist(upcomingSetlists[0])}>
                  <div className="w-full bg-gradient-to-br from-[var(--color-brand)] to-[#004f5e] h-40 relative overflow-hidden">
                     <div className="absolute inset-0 bg-black/10"></div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="bg-[var(--color-brand)] border-none text-white shadow-xl px-8 py-4 rounded-full font-bold text-copy-16 flex items-center cursor-pointer transition-transform hover:scale-105"
                          onClick={(e) => { e.stopPropagation(); onPlaySetlist(upcomingSetlists[0]); }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-3"><path d="M8 5v14l11-7z"/></svg>
                          Play Live
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-[var(--ds-background-200)] group-hover:bg-[var(--ds-gray-200)] transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      {upcomingSetlists[0].tags && upcomingSetlists[0].tags.length > 0 ? (
                        upcomingSetlists[0].tags.slice(0,2).map(tag => (
                          <span key={tag} className="text-label-11 text-[var(--color-brand)] uppercase tracking-widest font-semibold">#{tag}</span>
                        ))
                      ) : (
                        <span className="text-label-11 text-[var(--color-brand)] uppercase tracking-widest font-semibold">#LIVE</span>
                      )}
                    </div>

                    <h3 className="text-heading-32 font-serif text-[var(--text-1)] m-0 mb-4 tracking-tight leading-none">
                      {upcomingSetlists[0].name || "Untitled Setlist"}
                    </h3>

                    <div className="flex flex-col gap-3 text-copy-16 text-[var(--text-2)] font-serif italic opacity-80 mb-6">
                      <div className="flex items-center gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {formatDateFriendly(upcomingSetlists[0].date)} • {formatTimeFriendly(upcomingSetlists[0].time)}
                      </div>
                      <div className="flex items-center gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {upcomingSetlists[0].location || "No Location Set"}
                      </div>
                    </div>

                    <div className="text-label-14 text-[var(--text-2)] opacity-60 font-semibold mt-auto pt-4 border-t border-[var(--border-1)]">
                      {upcomingSetlists[0].items.length} Songs • 1h 45m
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center flex flex-col items-center gap-4">
                  <p className="text-heading-20 text-[var(--text-2)] opacity-50 font-serif italic m-0">
                    No upcoming shows.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Recently Edited */}
          <section className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-[var(--border-1)] pb-4">
              <h2 className="text-heading-24 font-serif text-[var(--text-1)] opacity-90 m-0">
                Recently Edited
              </h2>
              <button
                onClick={onGoLibrary}
                className="text-label-13 uppercase tracking-widest font-semibold text-[var(--text-2)] bg-transparent border-none cursor-pointer hover:text-[var(--text-1)] transition-colors opacity-60 hover:opacity-100"
              >
                Library
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {latestSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  variant="card"
                  onClick={() => onSelectSong(song)}
                />
              ))}
              {latestSongs.length === 0 && (
                <div className="py-24 text-center flex flex-col items-center gap-6">
                  <p className="text-heading-20 text-[var(--text-2)] opacity-50 font-serif italic m-0">
                    Your library is empty.
                  </p>
                  <p className="text-copy-16 text-[var(--text-2)] opacity-50 max-w-sm mt-0">
                    Start typing in the bar above to create your first song or setlist.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
        )}

      </div>
    </div>
  );
}
