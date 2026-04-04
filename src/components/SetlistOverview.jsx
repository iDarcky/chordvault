import { transposeKey } from '../music';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const songList = setlist.items || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', border: 'var(--bw) solid var(--border)' }}>
      {/* Header */}
      <header style={{
        padding: '40px 24px',
        borderBottom: 'var(--bw) solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <button onClick={onBack} style={{
            background: 'var(--text-bright)', color: 'var(--bg)',
            padding: '8px 12px', minHeight: 'auto', fontSize: 14, marginBottom: 16
          }}>← BACK</button>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{setlist.name || 'Setlist'}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>{setlist.date} / {setlist.service}</p>
        </div>
      </header>

      {/* Actions */}
      <section style={{ padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <button onClick={onPlay} style={{ background: 'var(--accent)', padding: '16px' }}>PLAY</button>
        <button onClick={onEdit} style={{ background: 'var(--text-bright)', color: 'var(--bg)', padding: '16px' }}>EDIT</button>
        <button onClick={onExport} style={{ background: 'var(--bg)', border: 'var(--bw) solid var(--border)', color: 'var(--text)', padding: '16px' }}>EXPORT</button>
      </section>

      {/* Song List */}
      <main style={{ padding: '0 24px 60px' }}>
        <h2 style={{ fontSize: 14, marginBottom: 24 }}>ORDER OF SERVICE</h2>
        <div style={{ borderTop: 'var(--bw) solid var(--border)' }}>
          {songList.map((it, idx) => {
            if (it.type === 'break') {
              return (
                <div key={idx} style={{
                  padding: '24px 0', borderBottom: 'var(--bw) solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 16,
                  color: 'var(--text-dim)', fontStyle: 'italic'
                }}>
                  <div style={{ fontSize: 14 }}>{String(idx + 1).padStart(2, '0')}</div>
                  <div style={{ fontSize: 18 }}>{it.label || 'BREAK'}</div>
                </div>
              );
            }
            const song = songs.find(s => s.id === it.songId);
            if (!song) return null;
            return (
              <div key={idx} style={{
                padding: '24px 0', borderBottom: 'var(--bw) solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 20
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-dim)' }}>{String(idx + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{song.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{transposeKey(song.key, it.transpose)} / {song.artist}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
