import { transposeKey } from '../music';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const songList = setlist.items || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      <header className="glass-header" style={{ padding: '20px 24px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-alt)', marginBottom: 16 }}>←</button>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>{setlist.name || 'Setlist'}</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{setlist.date} • {setlist.service}</p>
      </header>

      <section style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12 }}>
        <button className="primary" onClick={onPlay} style={{ height: 56, borderRadius: 16, fontSize: 16 }}>START LIVE</button>
        <button onClick={onEdit} style={{ height: 56, borderRadius: 16, border: '1px solid var(--border)' }}>EDIT</button>
        <button onClick={onExport} style={{ height: 56, borderRadius: 16, border: '1px solid var(--border)' }}>EXPORT</button>
      </section>

      <main style={{ padding: '0 24px' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Order of Service</h3>
        <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
          {songList.map((it, idx) => {
            if (it.type === 'break') {
              return (
                <div key={idx} style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)', opacity: 0.6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-dim)' }}>{it.label || 'BREAK'}</div>
                </div>
              );
            }
            const song = songs.find(s => s.id === it.songId);
            if (!song) return null;
            return (
              <div key={idx} style={{ padding: '20px 24px', borderBottom: idx === songList.length - 1 ? 'none' : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-dim)', width: 24 }}>{String(idx + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{song.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{transposeKey(song.key, it.transpose)} • {song.artist}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
