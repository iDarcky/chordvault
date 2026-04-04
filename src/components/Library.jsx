import { useState, useMemo, useRef } from 'react';

export default function Library({
  songs, setlists, onBack,
  onSelectSong, onNewSong, onImportSong,
  onNewSetlist, onPlaySetlist, onViewSetlist, onImportSetlist,
  onSettings,
}) {
  const [tab, setTab] = useState('songs');
  const [query, setQuery] = useState('');
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    let res = songs.filter(s =>
      s.title?.toLowerCase().includes(query.toLowerCase()) ||
      s.artist?.toLowerCase().includes(query.toLowerCase()) ||
      s.key?.toLowerCase().includes(query.toLowerCase())
    );
    res.sort((a, b) => a.title.localeCompare(b.title));
    return res;
  }, [songs, query]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
      <header className="glass-header" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-alt)', fontSize: 18 }}>←</button>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Library</h1>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {['songs', 'setlists'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'transparent', padding: '8px 0', borderRadius: 0, fontSize: 14, fontWeight: 700,
              color: tab === t ? 'var(--text-bright)' : 'var(--text-dim)',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`
            }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </header>

      <main style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="SEARCH..."
            style={{ flex: 1, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
          <button className="primary" onClick={tab === 'songs' ? onNewSong : onNewSetlist} style={{ width: 48, height: 48, borderRadius: 12, fontSize: 20 }}>+</button>
        </div>

        {tab === 'songs' && (
          <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.map((s, i) => (
              <div key={s.id} onClick={() => onSelectSong(s)} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
                cursor: 'pointer', transition: 'background 0.2s'
              }} className="hover-bg">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent)', fontSize: 14 }}>{s.key}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>{s.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'setlists' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {setlists.map(sl => (
              <div key={sl.id} className="bento-card" onClick={() => onViewSetlist(sl)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{sl.name || 'Untitled'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{sl.date}</div>
                </div>
                <button className="primary" onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{ borderRadius: 30, padding: '6px 16px', fontSize: 12 }}>LIVE</button>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{` .hover-bg:hover { background: var(--surface-alt); } `}</style>
    </div>
  );
}
