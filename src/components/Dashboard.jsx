import { useMemo, useRef } from 'react';
import { sectionStyle } from '../music';
import SyncStatus from './SyncStatus';

export default function Dashboard({
  songs, setlists, syncState,
  onSelectSong, onNewSong, onImportSong,
  onNewSetlist, onViewSetlist, onPlaySetlist,
  onGoLibrary, onGoSetlists, onGoSettings, onSyncNow,
}) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  const recentSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      .slice(0, 5);
  }, [songs]);

  const upcomingSetlists = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [setlists]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', border: 'var(--bw) solid var(--border)' }}>
      {/* Header Area */}
      <header style={{
        padding: '40px 24px',
        borderBottom: 'var(--bw) solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>ChordVault</h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginTop: 4 }}>
            {songs.length} SONGS / {setlists.length} SETLISTS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SyncStatus syncState={syncState} onClick={onSyncNow} />
          <button onClick={onGoSettings} style={{
            background: 'var(--text-bright)', color: 'var(--bg)',
            padding: '8px 12px', fontSize: 20, minHeight: 'auto'
          }}>⚙</button>
        </div>
      </header>

      <main style={{ padding: '40px 24px' }}>
        {/* Bold Quick Actions */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--bw)',
          background: 'var(--border)',
          border: 'var(--bw) solid var(--border)',
          marginBottom: 60
        }}>
          {[
            { label: 'New', icon: '+', action: onNewSong },
            { label: 'Import', icon: '↑', action: () => fileRef.current?.click() },
            { label: 'Setlist', icon: '☰', action: onNewSetlist },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              flexDirection: 'column', gap: 8, padding: '24px 8px',
              background: 'var(--bg)', color: 'var(--text)',
              fontSize: 14, fontWeight: 700
            }}>
              <span style={{ fontSize: 24 }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </section>
        <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />

        {/* Dynamic Content - Structural Lines */}
        {upcomingSetlists.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: 14, marginBottom: 20 }}>Upcoming Setlists</h2>
            {upcomingSetlists.map(sl => (
              <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '24px 0', borderTop: 'var(--bw) solid var(--border)', cursor: 'pointer'
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{sl.name || 'Untitled Setlist'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{sl.date} / {sl.items?.length || 0} SONGS</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                  padding: '8px 24px', fontSize: 13, minHeight: 'auto'
                }}>LIVE</button>
              </div>
            ))}
          </section>
        )}

        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 14, marginBottom: 20 }}>Recent Songs</h2>
          {recentSongs.length > 0 ? (
            <div style={{ borderTop: 'var(--bw) solid var(--border)' }}>
              {recentSongs.map(song => (
                <div key={song.id} onClick={() => onSelectSong(song)} style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '20px 0', borderBottom: 'var(--bw) solid var(--border)', cursor: 'pointer'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, minWidth: 32 }}>{song.key}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{song.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>{song.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', borderTop: 'var(--bw) solid var(--border)', paddingTop: 20 }}>NO SONGS YET</p>
          )}
        </section>

        {/* Global Navigation Blocks */}
        <nav style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--bw)',
          background: 'var(--border)',
          border: 'var(--bw) solid var(--border)'
        }}>
          <button onClick={onGoLibrary} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '20px' }}>Library</button>
          <button onClick={onGoSetlists} style={{ background: 'var(--bg)', color: 'var(--text)', padding: '20px' }}>Setlists</button>
        </nav>
      </main>
    </div>
  );
}
