import { useState, useMemo } from 'react';
import { sectionStyle } from '../music';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';

const btnStyle = {
  border: 'none', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
};

export default function Dashboard({
  songs, setlists,
  onSelectSong, onNewSong,
  onNewSetlist, onViewSetlist, onPlaySetlist,
  onGoLibrary, onGoSetlists,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);

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

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { songs: [], setlists: [] };
    const q = searchQuery.toLowerCase();
    return {
      songs: songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      ).slice(0, 10),
      setlists: setlists.filter(sl =>
        (sl.name || '').toLowerCase().includes(q) ||
        (sl.service || '').toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [songs, setlists, searchQuery]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title="Setlists MD">
        <button onClick={() => setShowSearch(true)} style={{
          ...btnStyle, background: 'var(--surface)',
          border: '1px solid var(--border)', color: 'var(--text-muted)',
          padding: '7px 12px', fontSize: 13, borderRadius: 8, gap: 6,
        }}>
          <SearchIcon size={14} /> Search
        </button>
      </PageHeader>

      <div style={{ padding: '0 24px 80px' }}>
        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-dim)',
              marginBottom: 6, padding: '0 2px',
            }}>
              Upcoming
            </div>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
            }}>
              {upcomingSetlists.map((sl, i) => {
                const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                return (
                  <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: i < upcomingSetlists.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', background: 'var(--card)',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        className: "text-button-14", fontWeight: 500, color: 'var(--text-bright)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {sl.name || 'Untitled'}
                      </div>
                      <div style={{
                        fontSize: 12, color: 'var(--text-muted)', marginTop: 3,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span>{dateStr}</span>
                        {sl.service && (
                          <>
                            <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                            <span>{sl.service}</span>
                          </>
                        )}
                        <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                        <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>
                          {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                      ...btnStyle, background: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                      color: 'var(--accent-text)', padding: '6px 14px',
                      flexShrink: 0, marginLeft: 12,
                    }}>
                      Live
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-dim)',
              marginBottom: 6, padding: '0 2px',
            }}>
              Recent
            </div>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
            }}>
              {recentSongs.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: i < recentSongs.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', background: 'var(--card)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      className: "text-button-14", fontWeight: 500, color: 'var(--text-bright)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {song.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)', marginTop: 3,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span>{song.artist}</span>
                      <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                      <span style={{ fontFamily: 'var(--fm)', className: "text-label-12-mono", color: 'var(--chord)' }}>
                        {song.key}
                      </span>
                      {song.tempo && (
                        <>
                          <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                          <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{song.tempo} bpm</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <button onClick={onGoLibrary} style={{
            ...btnStyle,
            padding: '16px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            className: "text-button-14",
            justifyContent: 'center',
          }}>
            Full Library
          </button>
          <button onClick={onGoSetlists} style={{
            ...btnStyle,
            padding: '16px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            className: "text-button-14",
            justifyContent: 'center',
          }}>
            All Setlists
          </button>
        </div>
      </div>

      {/* FAB */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 89,
          }}
        />
      )}
      <div style={{
        position: 'fixed', bottom: 80, right: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 8, zIndex: 90,
      }}>
        {fabOpen && (
          <>
            <button onClick={() => { setFabOpen(false); onNewSong(); }} style={{
              ...btnStyle,
              padding: '10px 18px',
              borderRadius: 24,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              fontSize: 13,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              New Song
            </button>
            <button onClick={() => { setFabOpen(false); onNewSetlist(); }} style={{
              ...btnStyle,
              padding: '10px 18px',
              borderRadius: 24,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              fontSize: 13,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              New Setlist
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'linear-gradient(135deg, #53796F, #6b9e91)',
            border: 'none', color: '#fff',
            fontSize: 28, fontWeight: 300, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(83,121,111,0.4)',
            transition: 'transform 0.2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </button>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'center',
            borderBottom: '1px solid var(--border)',
          }}>
            <button onClick={closeSearch} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, fontSize: 18,
              display: 'flex', alignItems: 'center',
            }}>
              &#8592;
            </button>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search songs, setlists..."
              style={{
                flex: 1, padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text)',
                fontSize: 15, outline: 'none',
                fontFamily: 'var(--fb)', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
            {!searchQuery.trim() && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                color: 'var(--text-dim)', className: "text-button-14",
              }}>
                Search across all songs and setlists
              </div>
            )}

            {searchQuery.trim() && searchResults.songs.length === 0 && searchResults.setlists.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                color: 'var(--text-dim)', className: "text-button-14",
              }}>
                No results found
              </div>
            )}

            {searchResults.songs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  className: "text-label-12-mono", color: 'var(--text-muted)',
                      fontFamily: 'var(--fm)', marginBottom: 8,
                }}>
                  Songs
                </div>
                {searchResults.songs.map(song => {
                  const s = song.sections?.length
                    ? sectionStyle(song.sections[0].type)
                    : { b: '#6b7280', d: '#9ca3af' };
                  return (
                    <div
                      key={song.id}
                      onClick={() => { closeSearch(); onSelectSong(song); }}
                      role="button"
                      tabIndex={0}
                      style={{
                        display: 'flex', alignItems: 'center',
                        gap: 12, padding: '10px 12px', marginBottom: 4,
                        borderRadius: 10, background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                        background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                        border: `1px solid ${s.b}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 700, color: s.d,
                      }}>
                        {song.key}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          className: "text-button-14", fontWeight: 600, color: 'var(--text-bright)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {song.title}
                        </div>
                        <div style={{ className: "text-label-12", color: 'var(--text-muted)', marginTop: 1 }}>
                          {song.artist}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {searchResults.setlists.length > 0 && (
              <div>
                <div style={{
                  className: "text-label-12-mono", color: 'var(--text-muted)',
                      fontFamily: 'var(--fm)', marginBottom: 8,
                }}>
                  Setlists
                </div>
                {searchResults.setlists.map(sl => {
                  const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  });
                  return (
                    <div
                      key={sl.id}
                      onClick={() => { closeSearch(); onViewSetlist(sl); }}
                      role="button"
                      tabIndex={0}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px', marginBottom: 4,
                        borderRadius: 10, background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          className: "text-button-14", fontWeight: 600, color: 'var(--text-bright)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {sl.name || 'Untitled'}
                        </div>
                        <div style={{ className: "text-label-12", color: 'var(--text-muted)', marginTop: 1 }}>
                          {dateStr}{sl.service ? ` \u00B7 ${sl.service}` : ''} · {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
