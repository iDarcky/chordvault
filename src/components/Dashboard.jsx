import { useState, useMemo } from 'react';
import { sectionStyle } from '../music';
import SearchIcon from './SearchIcon';
import SongCard from './SongCard';
import SetlistCard from './SetlistCard';

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

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).toUpperCase();
  }, []);

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      {/* Header Section */}
      <div style={{ padding: '48px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p className="text-label-12-mono" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 6 }}>
              {todayStr}
            </p>
            <h1 className="text-heading-32" style={{ color: 'var(--text-bright)', margin: 0 }}>
              Welcome, Guest
            </h1>
          </div>
          <button onClick={() => setShowSearch(true)} style={{
            ...btnStyle, background: 'var(--ds-gray-100)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            padding: '8px 16px', fontSize: 13, borderRadius: 8, gap: 8,
          }}>
            <SearchIcon size={14} /> Search...
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="text-label-14" style={{
              color: 'var(--text-muted)',
              marginBottom: 16, padding: '0 2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Upcoming Setlists
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {upcomingSetlists.map(sl => (
                <SetlistCard
                  key={sl.id}
                  setlist={sl}
                  onPlay={() => onPlaySetlist(sl)}
                  onView={() => onViewSetlist(sl)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="text-label-14" style={{
              color: 'var(--text-muted)',
              marginBottom: 16, padding: '0 2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Recent Songs
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {recentSongs.map(song => (
                <SongCard key={song.id} song={song} onClick={() => onSelectSong(song)} />
              ))}
            </div>
          </div>
        )}

        {/* Navigation Shortcuts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <button onClick={onGoLibrary} style={{
            ...btnStyle,
            padding: '20px',
            borderRadius: 16,
            background: 'var(--ds-background-100)',
            border: '1px solid var(--border)',
            color: 'var(--text-bright)',
            className: "text-button-14",
            justifyContent: 'center',
            fontSize: 14,
          }} className="hover:bg-[var(--ds-gray-100)] active:scale-[0.98]">
            Full Library
          </button>
          <button onClick={onGoSetlists} style={{
            ...btnStyle,
            padding: '20px',
            borderRadius: 16,
            background: 'var(--ds-background-100)',
            border: '1px solid var(--border)',
            color: 'var(--text-bright)',
            className: "text-button-14",
            justifyContent: 'center',
            fontSize: 14,
          }} className="hover:bg-[var(--ds-gray-100)] active:scale-[0.98]">
            All Setlists
          </button>
        </div>
      </div>

      {/* FAB (Geist design) */}
      <div style={{
        position: 'fixed', bottom: 84, right: 24,
        zIndex: 90,
      }}>
        {fabOpen && (
          <>
            <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 89 }} />
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 12px)', right: 0,
              display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160,
              padding: '8px', borderRadius: 12, background: 'var(--ds-background-100)',
              border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 90,
            }}>
              <button onClick={() => { setFabOpen(false); onNewSong(); }} style={{
                ...btnStyle, padding: '10px 16px', borderRadius: 8, background: 'none',
                color: 'var(--text-bright)', fontSize: 13, justifyContent: 'flex-start',
              }} className="hover:bg-[var(--ds-gray-100)]">
                + New Song
              </button>
              <button onClick={() => { setFabOpen(false); onNewSetlist(); }} style={{
                ...btnStyle, padding: '10px 16px', borderRadius: 8, background: 'none',
                color: 'var(--text-bright)', fontSize: 13, justifyContent: 'flex-start',
              }} className="hover:bg-[var(--ds-gray-100)]">
                + New Setlist
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'var(--color-brand)',
            border: 'none', color: '#fff',
            fontSize: 28, fontWeight: 300, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px var(--accent-border)',
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
            padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center',
            borderBottom: '1px solid var(--border)', background: 'var(--ds-background-200)',
          }}>
            <button onClick={closeSearch} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 8, fontSize: 18,
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
                flex: 1, padding: '12px 16px',
                background: 'var(--ds-background-100)',
                border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-bright)',
                fontSize: 15, outline: 'none',
                fontFamily: 'var(--fb)', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
            {searchResults.songs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="text-label-12-mono" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                  SONGS
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {searchResults.songs.map(song => (
                    <SongCard key={song.id} song={song} onClick={() => { closeSearch(); onSelectSong(song); }} />
                  ))}
                </div>
              </div>
            )}
            {searchResults.setlists.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="text-label-12-mono" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                  SETLISTS
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {searchResults.setlists.map(sl => (
                    <SetlistCard key={sl.id} setlist={sl} onPlay={() => { closeSearch(); onPlaySetlist(sl); }} onView={() => { closeSearch(); onViewSetlist(sl); }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
