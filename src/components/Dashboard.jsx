import { useMemo, useRef } from 'react';
import { sectionStyle } from '../music';
import SyncStatus from './SyncStatus';

const btnStyle = {
  border: 'none', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
};

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '28px 20px 0',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, fontWeight: 700,
            }}>
              CV
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 700,
                color: 'var(--text-bright)', letterSpacing: '-0.02em',
              }}>
                ChordVault
              </h1>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {songs.length} song{songs.length !== 1 ? 's' : ''} · {setlists.length} setlist{setlists.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <SyncStatus syncState={syncState} onClick={onSyncNow} />
            <button onClick={onGoSettings} style={{
              ...btnStyle, background: 'var(--surface)',
              border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 10px',
              fontSize: 16,
            }}>
              &#9881;
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 28,
        }}>
          <button onClick={onNewSong} style={{
            ...btnStyle,
            flexDirection: 'column',
            gap: 6,
            padding: '16px 8px',
            borderRadius: 12,
            background: 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: 'var(--accent-text)',
            fontSize: 12,
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>+</span>
            New Song
          </button>
          <button onClick={() => fileRef.current?.click()} style={{
            ...btnStyle,
            flexDirection: 'column',
            gap: 6,
            padding: '16px 8px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12,
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>{'\u2191'}</span>
            Import
          </button>
          <button onClick={onNewSetlist} style={{
            ...btnStyle,
            flexDirection: 'column',
            gap: 6,
            padding: '16px 8px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12,
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>{'\u2630'}</span>
            New Setlist
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt"
          multiple
          onChange={handleFiles}
          style={{ display: 'none' }}
        />

        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontFamily: 'var(--fm)', marginBottom: 8,
            }}>
              Upcoming
            </div>
            {upcomingSetlists.map(sl => {
              const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              });
              return (
                <div key={sl.id} onClick={() => onViewSetlist(sl)} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: 4,
                  borderRadius: 10, background: 'rgba(99,102,241,0.04)',
                  border: '1px solid rgba(99,102,241,0.1)',
                  cursor: 'pointer',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text-bright)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sl.name || 'Untitled'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {dateStr}{sl.service ? ` \u00B7 ${sl.service}` : ''} · {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
                    ...btnStyle, background: 'var(--accent-soft)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: 'var(--accent-text)', padding: '6px 14px',
                    flexShrink: 0,
                  }}>
                    Live
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontFamily: 'var(--fm)', marginBottom: 8,
            }}>
              Recent Songs
            </div>
            {recentSongs.map(song => {
              const s = song.sections?.length
                ? sectionStyle(song.sections[0].type)
                : { b: '#6b7280', d: '#9ca3af' };
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 12, padding: '12px 12px', marginBottom: 4,
                    borderRadius: 10, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                    border: `1px solid ${s.b}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--fm)', fontSize: 13, fontWeight: 700, color: s.d,
                  }}>
                    {song.key}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text-bright)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {song.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {song.artist}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--fm)',
                  }}>
                    {song.tempo ? `${song.tempo}bpm` : ''}
                  </span>
                </div>
              );
            })}
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
            fontSize: 14,
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
            fontSize: 14,
            justifyContent: 'center',
          }}>
            All Setlists
          </button>
        </div>
      </div>
    </div>
  );
}
