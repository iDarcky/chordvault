import { useState, useMemo, useRef } from 'react';
import { sectionStyle } from '../music';
import { songToMd } from '../parser';

export default function Library({
  songs, onSelectSong, onNewSong, onImportSong,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    let list = songs;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sort === 'key') sorted.sort((a, b) => a.key.localeCompare(b.key));
    else if (sort === 'newest') sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sorted;
  }, [songs, query, sort]);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  const handleExport = (song) => {
    const md = songToMd(song);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = song.title
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase() + '.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => songs.forEach(s => handleExport(s));

  const btnStyle = {
    border: 'none', borderRadius: 7, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 5,
    fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '28px 20px 0',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 700,
              color: 'var(--text-bright)', letterSpacing: '-0.02em',
            }}>
              Library
            </h1>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {songs.length} song{songs.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleExportAll} style={{
              ...btnStyle, background: 'var(--surface)',
              border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
            }}>
              All .md
            </button>
            <button onClick={() => fileRef.current?.click()} style={{
              ...btnStyle, background: 'var(--surface)',
              border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
            }}>
              Import
            </button>
            <input ref={fileRef} type="file" accept=".md,.txt" multiple
              onChange={handleFiles} style={{ display: 'none' }} />
            <button onClick={onNewSong} style={{
              ...btnStyle, background: 'var(--accent-soft)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--accent-text)', padding: '7px 16px',
            }}>
              + New Song
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, artists, keys..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, color: 'var(--text)',
              fontSize: 14, outline: 'none',
              fontFamily: 'var(--fb)', boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-dim)',
            fontSize: 14,
          }}>
            &#128269;
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {[
            { id: 'title', label: 'Title' },
            { id: 'artist', label: 'Artist' },
            { id: 'key', label: 'Key' },
            { id: 'newest', label: 'Newest' },
          ].map(s => (
            <button key={s.id} onClick={() => setSort(s.id)} style={{
              ...btnStyle, padding: '4px 10px', fontSize: 11,
              borderColor: sort === s.id ? 'var(--accent)' : 'var(--border)',
              color: sort === s.id ? 'var(--accent-text)' : 'var(--text-muted)',
              background: sort === s.id ? 'var(--accent-soft)' : 'transparent',
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Song list */}
      <div style={{ padding: '8px 20px', paddingBottom: 80 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-dim)', fontSize: 14,
          }}>
            {songs.length === 0
              ? 'No songs yet. Import .md files or create a new song.'
              : 'No songs match your search.'}
          </div>
        )}
        {filtered.map((song, i) => {
          const s = song.sections?.length
            ? sectionStyle(song.sections[0].type)
            : { b: '#6b7280', d: '#9ca3af' };
          return (
            <div
              key={song.id || i}
              onClick={() => onSelectSong(song)}
              role="button"
              tabIndex={0}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 14, padding: '14px 14px', marginBottom: 4,
                borderRadius: 10, background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', textAlign: 'left',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                border: `1px solid ${s.b}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--fm)', fontSize: 14, fontWeight: 700, color: s.d,
              }}>
                {song.key}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: 'var(--text-bright)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {song.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                  {song.artist}
                </div>
              </div>
              <div style={{
                display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--fm)',
                }}>
                  {song.tempo} bpm
                </span>
                <span style={{
                  fontSize: 11.5, color: 'var(--text-dim)', fontFamily: 'var(--fm)',
                }}>
                  {song.time}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleExport(song); }}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                    padding: 4, display: 'flex', fontSize: 14,
                  }}
                >
                  &#8595;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
