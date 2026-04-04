import { useState, useMemo, useRef } from 'react';
import { transposeKey } from '../music';

export default function Library({
  songs, setlists, onBack,
  onSelectSong, onNewSong, onImportSong,
  onNewSetlist, onPlaySetlist, onViewSetlist, onImportSetlist,
  onSettings,
}) {
  const [tab, setTab] = useState('songs');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  const filtered = useMemo(() => {
    let res = songs.filter(s =>
      s.title?.toLowerCase().includes(query.toLowerCase()) ||
      s.artist?.toLowerCase().includes(query.toLowerCase()) ||
      s.key?.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === 'title') res.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'artist') res.sort((a, b) => a.artist.localeCompare(b.artist));
    if (sort === 'newest') res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return res;
  }, [songs, query, sort]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', border: 'var(--bw) solid var(--border)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: 'var(--bw) solid var(--border)',
        padding: '24px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={onBack} style={{
            background: 'var(--text-bright)', color: 'var(--bg)',
            padding: '8px 12px', minHeight: 'auto', fontSize: 14
          }}>←</button>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Library</h1>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--border)', border: 'var(--bw) solid var(--border)',
          gap: 'var(--bw)'
        }}>
          {['songs', 'setlists'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontSize: 14, fontWeight: 700,
              color: tab === t ? 'var(--accent-text)' : 'var(--text)',
              background: tab === t ? 'var(--accent)' : 'var(--bg)',
              padding: '12px 0', border: 'none', borderRadius: 0,
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Actions - RESTORED & SHARP */}
      <section style={{
        padding: '32px 20px',
        display: 'grid',
        gridTemplateColumns: tab === 'songs' ? '1fr 1fr' : '1fr',
        gap: 12
      }}>
        {tab === 'songs' ? (
          <>
            <button onClick={onNewSong} style={{ background: 'var(--accent)', padding: '16px' }}>NEW SONG</button>
            <button onClick={() => fileRef.current?.click()} style={{ background: 'var(--text-bright)', color: 'var(--bg)', padding: '16px' }}>IMPORT</button>
          </>
        ) : (
          <button onClick={onNewSetlist} style={{ background: 'var(--accent)', padding: '16px' }}>NEW SETLIST</button>
        )}
      </section>
      <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />

      {/* Lists */}
      <main style={{ padding: '0 20px 60px' }}>
        {tab === 'songs' && (
          <div>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SEARCH LIBRARY..."
              style={{ width: '100%', marginBottom: 32, padding: '16px', background: 'var(--bg)', border: 'var(--bw) solid var(--border)' }}
            />
            <div style={{ borderTop: 'var(--bw) solid var(--border)' }}>
              {filtered.map(song => (
                <div key={song.id} onClick={() => onSelectSong(song)} style={{
                  display: 'flex', alignItems: 'center', gap: 20,
                  padding: '24px 0', borderBottom: 'var(--bw) solid var(--border)', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, minWidth: 40 }}>{song.key}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{song.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{song.artist}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'setlists' && (
          <div style={{ borderTop: 'var(--bw) solid var(--border)' }}>
            {[...setlists].sort((a, b) => new Date(b.date) - new Date(a.date)).map(sl => (
              <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '24px 0', borderBottom: 'var(--bw) solid var(--border)', cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{sl.name || 'Untitled Setlist'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>
                    {sl.date} / {sl.items?.length || 0} SONGS
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                  padding: '8px 24px', fontSize: 13, minHeight: 'auto'
                }}>LIVE</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
