import { useState, useMemo } from 'react';
import { sectionStyle, transposeKey } from '../music';

const btnStyle = {
  border: 'none', borderRadius: 6, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 500, fontSize: 12,
};

export default function Library({
  songs, setlists, onBack,
  onSelectSong, onNewSong, onImportSong,
  onNewSetlist, onPlaySetlist, onViewSetlist, onImportSetlist,
  onSettings,
}) {
  const [tab, setTab] = useState('songs');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');

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

  const handleExport = (song) => {
    const blob = new Blob([song.raw || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={onBack} style={{ color: 'var(--text-muted)', fontSize: 14 }}>←</button>
          <div style={{ width: 8, height: 8, borderRadius: 1, background: 'var(--accent)' }} />
          <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.03em' }}>Library</h1>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['songs', 'setlists'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              fontSize: 14, fontWeight: 500,
              color: tab === t ? 'var(--text-bright)' : 'var(--text-dim)',
              padding: '4px 0', borderBottom: tab === t ? '2px solid var(--accent)' : 'none',
              borderRadius: 0,
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'songs' && (
        <div style={{ padding: '24px 20px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            style={{ width: '100%', marginBottom: 24, padding: '12px', background: 'var(--surface-alt)', border: 'none' }}
          />
          {filtered.map(song => (
            <div key={song.id} onClick={() => onSelectSong(song)} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-bright)' }}>{song.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{song.artist}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>{song.key}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'setlists' && (
        <div style={{ padding: '24px 20px' }}>
          {[...setlists].sort((a, b) => new Date(b.date) - new Date(a.date)).map(sl => (
            <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
              padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-bright)' }}>{sl.name || 'Untitled'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
                {sl.date} · {sl.items?.length || 0} songs
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
