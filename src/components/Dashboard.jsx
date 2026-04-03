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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      {/* Header */}
      <header style={{ padding: '40px 24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: 1 }} />
            <h1 style={{ fontSize: 24, fontWeight: 500 }}>ChordVault</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {songs.length} songs · {setlists.length} setlists
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SyncStatus syncState={syncState} onClick={onSyncNow} />
          <button onClick={onGoSettings} style={{ fontSize: 20, color: 'var(--text-muted)' }}>⚙</button>
        </div>
      </header>

      <main style={{ padding: '0 24px' }}>
        {/* Actions */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 56 }}>
          {[
            { label: 'New', icon: '+', action: onNewSong },
            { label: 'Import', icon: '↑', action: () => fileRef.current?.click() },
            { label: 'Setlist', icon: '☰', action: onNewSetlist },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              flexDirection: 'column', gap: 6, padding: '16px 8px',
              background: 'var(--surface-alt)', color: 'var(--text)', fontSize: 12,
            }}>
              <span style={{ fontSize: 20 }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </section>
        <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />

        {/* Content */}
        {upcomingSetlists.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Upcoming</h2>
            {upcomingSetlists.map(sl => (
              <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer'
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{sl.name || 'Untitled'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{sl.date}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                  padding: '6px 14px', border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: 12
                }}>Live</button>
              </div>
            ))}
          </section>
        )}

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Recent</h2>
          {recentSongs.length > 0 ? recentSongs.map(song => (
            <div key={song.id} onClick={() => onSelectSong(song)} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer'
            }}>
              <div style={{ width: 6, height: 6, background: 'var(--border)', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{song.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{song.artist}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>{song.key}</div>
            </div>
          )) : (
            <p style={{ fontSize: 14, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>No songs yet.</p>
          )}
        </section>

        <nav style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={onGoLibrary} style={{ background: 'var(--surface-alt)', fontSize: 14 }}>Library</button>
          <button onClick={onGoSetlists} style={{ background: 'var(--surface-alt)', fontSize: 14 }}>Setlists</button>
        </nav>
      </main>
    </div>
  );
}
