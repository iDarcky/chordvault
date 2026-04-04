import { useState, useMemo, useRef } from 'react';
import { transposeKey } from '../music';
import PageHeader from './PageHeader';

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist,
}) {
  const [fabOpen, setFabOpen] = useState(false);
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

  const renderSetlistRow = (sl, i, arr) => {
    const songCount = sl.items?.length || 0;
    return (
      <div
        key={sl.id}
        onClick={() => onViewSetlist(sl)}
        role="button"
        tabIndex={0}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', background: 'var(--card)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text-bright)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {sl.name || 'Untitled Setlist'}
          </div>
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginTop: 3,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>{formatDate(sl.date)}</span>
            {sl.service && (
              <>
                <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                <span>{sl.service}</span>
              </>
            )}
            <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>
              {songCount} song{songCount !== 1 ? 's' : ''}
            </span>
          </div>
          {songCount > 0 && (
            <div style={{
              display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6,
            }}>
              {sl.items.slice(0, 6).map((it, idx) => {
                if (it.type === 'break') {
                  return (
                    <span key={idx} style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 6px', borderRadius: 10,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      fontSize: 10, color: 'var(--text-dim)',
                      fontStyle: 'italic',
                    }}>
                      {it.label || 'Break'}
                    </span>
                  );
                }
                const song = songs.find(s => s.id === it.songId);
                if (!song) return null;
                return (
                  <span key={idx} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '2px 6px', borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: 10, color: 'var(--text-muted)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--fm)', fontWeight: 700,
                      color: 'var(--chord)', fontSize: 9,
                    }}>
                      {transposeKey(song.key, it.transpose)}
                    </span>
                    {song.title}
                  </span>
                );
              })}
              {sl.items.length > 6 && (
                <span style={{
                  fontSize: 10, color: 'var(--text-dim)', padding: '2px 4px',
                }}>
                  +{sl.items.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }} style={{
          border: '1px solid var(--accent-border)',
          borderRadius: 7, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
          padding: '6px 14px', flexShrink: 0, marginLeft: 12,
          background: 'var(--accent-soft)', color: 'var(--accent-text)',
        }}>
          Live
        </button>
      </div>
    );
  };

  const renderSection = (label, items) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: 'var(--text-dim)',
        marginBottom: 6, padding: '0 2px',
      }}>
        {label}
      </div>
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        {items.map((sl, i) => renderSetlistRow(sl, i, items))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title="Setlists" />

      <div style={{ padding: '0 24px', paddingBottom: 100 }}>
        {setlists.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-dim)', fontSize: 14,
            border: '1px solid var(--border)', borderRadius: 10,
          }}>
            No setlists yet. Tap + to create one.
          </div>
        )}

        {upcoming.length > 0 && renderSection('Upcoming', upcoming)}
        {all.length > 0 && renderSection('All', all)}
      </div>

      {/* FAB */}
      {fabOpen && (
        <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 89 }} />
      )}
      <div style={{
        position: 'fixed', bottom: 80, right: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 8, zIndex: 90,
      }}>
        {fabOpen && (
          <>
            <button onClick={() => { setFabOpen(false); onNewSetlist(); }} style={{
              borderRadius: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13,
              padding: '10px 18px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              New Setlist
            </button>
            <button onClick={() => { setFabOpen(false); fileRef.current?.click(); }} style={{
              borderRadius: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13,
              padding: '10px 18px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              Import .zip
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'linear-gradient(135deg, var(--accent), #6b9e91)',
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
      <input ref={fileRef} type="file" accept=".zip"
        onChange={e => {
          if (e.target.files[0]) onImportSetlist(e.target.files[0]);
          e.target.value = '';
        }}
        style={{ display: 'none' }} />
    </div>
  );
}
