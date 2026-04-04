import { useMemo, useRef } from 'react';
import { transposeKey } from '../music';
import PageHeader from './PageHeader';

const btnStyle = {
  border: 'none', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
};

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist,
}) {
  const fileRef = useRef(null);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [setlists]);

  const all = useMemo(() => {
    return [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [setlists]);

  const formatDate = (date) =>
    new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  const renderSetlistCard = (sl) => {
    const songCount = sl.items?.length || 0;
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(sl.date)}</span>
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
                    fontFamily: 'var(--fm)', fontWeight: 700,
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
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        padding: '20px 24px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{
          margin: 0, fontSize: 20, fontWeight: 700,
          color: 'var(--text-bright)', letterSpacing: '-0.02em',
        }}>
          Setlists
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => fileRef.current?.click()} style={{
              ...btnStyle, background: 'var(--surface)',
              border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
            }}>
              Import
            </button>
            <input ref={fileRef} type="file" accept=".zip"
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
          </div>
      </div>

      <div style={{ padding: '0 24px', paddingBottom: 80 }}>
        {setlists.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-dim)', fontSize: 14,
          }}>
            No setlists yet. Create one for this Sunday.
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              fontFamily: 'var(--fm)', marginBottom: 8,
            }}>
              Upcoming
            </div>
            {upcoming.map(renderSetlistCard)}
          </div>
        )}

        {/* All */}
        {all.length > 0 && (
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              fontFamily: 'var(--fm)', marginBottom: 8,
            }}>
              All
            </div>
            {all.map(renderSetlistCard)}
          </div>
        )}
      </div>
    </div>
  );
}
