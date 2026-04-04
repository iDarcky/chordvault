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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      {/* 2026 Glass Header */}
      <header className="glass-header" style={{ padding: '24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #fb7185)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 800,
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>CV</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>ChordVault</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{songs.length} SONGS / {setlists.length} SETLISTS</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SyncStatus syncState={syncState} onClick={onSyncNow} />
          <button onClick={onGoSettings} style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)',
            border: '1px solid var(--border)', fontSize: 18, color: 'var(--text-muted)'
          }}>⚙</button>
        </div>
      </header>

      <main style={{ padding: '32px 24px' }}>
        {/* Bento Quick Actions */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr',
          gap: 16,
          marginBottom: 32
        }}>
          <div className="bento-card" onClick={onNewSong} style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            cursor: 'pointer', minHeight: 160
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--accent)' }}>+</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>New Song</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>Create a new chord chart from scratch.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             <button onClick={() => fileRef.current?.click()} style={{
               flex: 1, borderRadius: 'var(--radius)', background: 'var(--surface)',
               border: '1px solid var(--border)', flexDirection: 'column', padding: 20
             }}>
               <span style={{ fontSize: 24, marginBottom: 8 }}>↑</span>
               <span style={{ fontSize: 13, fontWeight: 700 }}>IMPORT</span>
             </button>
             <button onClick={onNewSetlist} style={{
               flex: 1, borderRadius: 'var(--radius)', background: 'var(--surface)',
               border: '1px solid var(--border)', flexDirection: 'column', padding: 20
             }}>
               <span style={{ fontSize: 24, marginBottom: 8 }}>☰</span>
               <span style={{ fontSize: 13, fontWeight: 700 }}>SETLIST</span>
             </button>
          </div>
        </section>
        <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />

        {/* Bento Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {upcomingSetlists.length > 0 && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, paddingLeft: 4 }}>Upcoming Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingSetlists.map(sl => (
                  <div key={sl.id} className="bento-card" onClick={() => onViewSetlist(sl)} style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{sl.name || 'Untitled Setlist'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{sl.date} • {sl.items?.length || 0} SONGS</div>
                    </div>
                    <button className="primary" onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{ padding: '8px 20px', fontSize: 12, borderRadius: 30 }}>LIVE</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, paddingLeft: 4 }}>Recent Songs</h3>
            <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
              {recentSongs.length > 0 ? (
                <div>
                  {recentSongs.map((song, i) => (
                    <div key={song.id} onClick={() => onSelectSong(song)} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 24px', borderBottom: i === recentSongs.length - 1 ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer', transition: 'background 0.2s'
                    }} className="hover-bg">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{song.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{song.artist}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--fm)', fontWeight: 600 }}>{song.key}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No recent songs</div>
              )}
              <div onClick={onGoLibrary} style={{ padding: '16px', textAlign: 'center', background: 'var(--surface-alt)', fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Full Library</div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .hover-bg:hover { background: var(--surface-alt); }
      `}</style>
    </div>
  );
}
