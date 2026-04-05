import React from 'react';
import PageHeader from './PageHeader';
import SongCard from './SongCard';
import SetlistCard from './SetlistCard';

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
    <div style={{ minHeight: '100vh', background: 'var(--ds-background-200)', paddingBottom: 100 }}>
      <PageHeader title="Welcome, Guest">
        <div className="text-copy-14" style={{ color: 'var(--text-muted)' }}>
          {dateStr}
        </div>
      </PageHeader>

      <div style={{ padding: '24px 24px 80px', maxWidth: 1000, margin: '0 auto' }}>

        {/* Recent Setlists */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="text-label-12-mono" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Recent Setlists
            </h2>
            <button onClick={onGoSetlists} className="text-label-12" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
              View All
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {latestSetlists.map(sl => (
              <SetlistCard
                key={sl.id}
                setlist={sl}
                onPlay={() => onPlaySetlist(sl)}
                onView={() => onViewSetlist(sl)}
              />
            ))}
            {latestSetlists.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 16 }}>
                <p className="text-copy-14" style={{ color: 'var(--text-muted)' }}>No setlists created yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Latest Songs */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="text-label-12-mono" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Latest Library Additions
            </h2>
            <button onClick={onGoLibrary} className="text-label-12" style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
              Full Library
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {latestSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                onClick={() => onSelectSong(song)}
              />
            ))}
            {latestSongs.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 16 }}>
                <p className="text-copy-14" style={{ color: 'var(--text-muted)' }}>Your library is empty.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
