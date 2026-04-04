import { useState, useMemo, useRef } from 'react';
import { transposeKey, sectionStyle } from '../music';
import { songToMd } from '../parser';

export default function Library({
  songs, setlists, initialTab, onBack,
  onSelectSong, onNewSong, onImportSong,
  onNewSetlist, onPlaySetlist, onViewSetlist, onImportSetlist, onSettings,
}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(initialTab || 'songs');
  const [sort, setSort] = useState('title');
  const fileRef = useRef(null);
  const setlistFileRef = useRef(null);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onBack && (
              <button onClick={onBack} style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: '4px 2px', fontSize: 18,
                display: 'flex', alignItems: 'center',
              }}>
                &#8592;
              </button>
            )}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 500,
            }}>
              CV
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 500,
                color: 'var(--text-bright)', letterSpacing: '-0.02em',
              }}>
                ChordVault
              </h1>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {songs.length} song{songs.length !== 1 ? 's' : ''} · {setlists.length} setlist{setlists.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onSettings && (
              <button onClick={onSettings} style={{
                ...btnStyle, background: 'var(--surface)',
                border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 10px',
                fontSize: 16,
              }}>
                &#9881;
              </button>
            )}
            {tab === 'songs' && (
              <>
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
              </>
            )}
            {tab === 'setlists' && (
              <>
                <button onClick={() => setlistFileRef.current?.click()} style={{
                  ...btnStyle, background: 'var(--surface)',
                  border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
                }}>
                  Import
                </button>
                <input ref={setlistFileRef} type="file" accept=".zip"
                  onChange={e => {
                    if (e.target.files[0]) onImportSetlist(e.target.files[0]);
                    e.target.value = '';
                  }}
                  style={{ display: 'none' }} />
                <button onClick={onNewSetlist} style={{
                  ...btnStyle, background: 'var(--accent-soft)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: 'var(--accent-text)', padding: '7px 16px',
                }}>
                  + New Setlist
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upcoming setlists */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = setlists
            .filter(sl => sl.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));
          if (upcoming.length === 0) return null;
          return (
            <div style={{ padding: '12px 0 8px' }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                fontFamily: 'var(--fm)', marginBottom: 8, padding: '0 2px',
              }}>
                Upcoming
              </div>
              {upcoming.map(sl => {
                const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                return (
                  <div key={sl.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px', marginBottom: 4,
                    borderRadius: 8, background: 'rgba(99,102,241,0.04)',
                    border: '1px solid rgba(99,102,241,0.1)',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text-bright)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sl.name || 'Untitled'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {dateStr} · {sl.service}
                      </div>
                    </div>
                    <button onClick={() => onPlaySetlist(sl)} style={{
                      ...btnStyle, background: 'var(--accent-soft)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: 'var(--accent-text)', padding: '5px 14px',
                      flexShrink: 0,
                    }}>
                      Live
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Tab switch */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[{ id: 'songs', label: 'Songs' }, { id: 'setlists', label: 'Setlists' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--fb)',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Songs tab */}
      {tab === 'songs' && (
        <>
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
          <div style={{ padding: '8px 20px 40px' }}>
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
                    fontFamily: 'var(--fm)', fontSize: 14, fontWeight: 500, color: s.d,
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
        </>
      )}

      {/* Setlists tab */}
      {tab === 'setlists' && (
        <div style={{ padding: '12px 20px 40px' }}>
          {setlists.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              color: 'var(--text-dim)', fontSize: 14,
            }}>
              No setlists yet. Create one for this Sunday.
            </div>
          )}
          {[...setlists].sort((a, b) => new Date(b.date) - new Date(a.date)).map(sl => {
            const songCount = sl.items?.length || 0;
            const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            });
            return (
              <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                marginBottom: 8, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden', background: 'rgba(255,255,255,0.015)',
                cursor: 'pointer',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '14px 16px',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>
                      {sl.name || 'Untitled Setlist'}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateStr}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sl.service}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        {songCount} song{songCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                    ...btnStyle, background: 'var(--accent-soft)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: 'var(--accent-text)', padding: '6px 14px',
                  }}>
                    Live
                  </button>
                </div>
                {songCount > 0 && (
                  <div style={{
                    padding: '0 16px 12px', display: 'flex',
                    gap: 4, flexWrap: 'wrap',
                  }}>
                    {sl.items.map((it, i) => {
                      if (it.type === 'break') {
                        return (
                          <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 12,
                            background: 'var(--surface)',
                            border: '1px solid rgba(107,114,128,0.2)',
                            fontSize: 11, color: 'rgba(255,255,255,0.3)',
                            fontStyle: 'italic',
                          }}>
                            {it.label || 'Break'}
                          </span>
                        );
                      }
                      const song = songs.find(s => s.id === it.songId);
                      if (!song) return null;
                      return (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 12,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          fontSize: 11, color: 'rgba(255,255,255,0.45)',
                        }}>
                          <span style={{
                            fontFamily: 'var(--fm)', fontWeight: 500,
                            color: 'var(--chord)', fontSize: 10,
                          }}>
                            {transposeKey(song.key, it.transpose)}
                          </span>
                          {song.title}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
