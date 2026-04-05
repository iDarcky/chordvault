import React from 'react';
import PageHeader from './PageHeader';
import SongCard from './SongCard';
import SetlistCard from './SetlistCard';
import { Button } from './ui/Button';

export default function Dashboard({
  songs,
  setlists,
  onSelectSong,
  onNewSong,
  onNewSetlist,
  onViewSetlist,
  onPlaySetlist,
  onGoLibrary,
  onGoSetlists
}) {
  const latestSongs = [...songs].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4);
  const latestSetlists = [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] pb-32">
      <PageHeader title="Welcome, Guest">
        <div className="text-copy-14 text-[var(--ds-gray-900)] font-medium">
          {dateStr}
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-12">

        {/* Recent Setlists */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold">
              Recent Setlists
            </h2>
            <Button variant="ghost" size="sm" onClick={onGoSetlists}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestSetlists.map(sl => (
              <SetlistCard
                key={sl.id}
                setlist={sl}
                onPlay={() => onPlaySetlist(sl)}
                onView={() => onViewSetlist(sl)}
              />
            ))}
            {latestSetlists.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--ds-gray-400)] rounded-2xl flex flex-col items-center gap-4">
                <p className="text-copy-14 text-[var(--ds-gray-700)] font-medium">
                  No setlists created yet.
                </p>
                <Button variant="brand" onClick={onNewSetlist}>
                  Create First Setlist
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Latest Songs */}
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold">
              Latest Library Additions
            </h2>
            <Button variant="ghost" size="sm" onClick={onGoLibrary}>
              Full Library
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => onSelectSong(song)}
              />
            ))}
            {latestSongs.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--ds-gray-400)] rounded-2xl flex flex-col items-center gap-4">
                <p className="text-copy-14 text-[var(--ds-gray-700)] font-medium">
                  Your library is empty.
                </p>
                <Button variant="brand" onClick={onNewSong}>
                  Add Your First Song
                </Button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
