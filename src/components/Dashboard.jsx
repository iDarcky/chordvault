import { useMemo, useRef } from 'react';
import { sectionStyle } from '../music';

const btnStyle = {
  border: 'none', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
};

function setlistSongItems(sl) {
  return (sl.items || []).filter(it => it.type !== 'break');
}

function setlistStatus(sl, songs) {
  const items = setlistSongItems(sl);
  if (items.length === 0) {
    return {
      pill: 'muted',
      label: 'Empty',
      footer: 'Add songs in the setlist editor',
    };
  }
  const missing = items.filter(it => !songs.find(s => s.id === it.songId));
  if (missing.length > 0) {
    return {
      pill: 'danger',
      label: 'Missing songs',
      footer: `${missing.length} reference${missing.length !== 1 ? 's' : ''} not in library`,
    };
  }
  const noted = items.filter(it => (it.note || '').trim()).length;
  if (noted < items.length) {
    return {
      pill: 'warn',
      label: 'Needs prep',
      footer: `Notes ${noted} / ${items.length}`,
    };
  }
  return {
    pill: 'ok',
    label: 'Ready',
    footer: `${items.length} song${items.length !== 1 ? 's' : ''}`,
  };
}

function pillStyle(kind) {
  const base = {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: 'var(--fb)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    flexShrink: 0,
    letterSpacing: '0.02em',
  };
  if (kind === 'ok') {
    return { ...base, background: 'var(--pill-ok-bg)', color: 'var(--pill-ok-text)' };
  }
  if (kind === 'warn') {
    return { ...base, background: 'var(--pill-warn-bg)', color: 'var(--pill-warn-text)' };
  }
  if (kind === 'danger') {
    return { ...base, background: 'var(--pill-danger-bg)', color: 'var(--pill-danger-text)' };
  }
  return { ...base, background: 'var(--pill-muted-bg)', color: 'var(--pill-muted-text)' };
}

const sectionTitle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontFamily: 'var(--fm)',
  marginBottom: 10,
};

export default function Dashboard({
  songs,
  setlists,
  settings,
  onUpdateSettings,
  onSelectSong,
  onNewSong,
  onImportSong,
  onNewSetlist,
  onViewSetlist,
  onPlaySetlist,
  onGoLibrary,
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
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [setlists]);

  const homeNotes = settings?.homeNotes ?? '';

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', padding: '24px 22px 48px' }}>
      <h1 style={{
        margin: '0 0 24px',
        fontSize: 26,
        fontWeight: 700,
        color: 'var(--text-bright)',
        letterSpacing: '-0.03em',
      }}>
        Home
      </h1>

      {/* Upcoming setlists */}
      <div style={{ marginBottom: 28 }}>
        <div style={sectionTitle}>Upcoming setlists</div>
        {upcomingSetlists.length === 0 ? (
          <div style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'var(--card-elevated)',
            padding: '28px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
              No upcoming setlists with a date on or after today.
            </div>
            <button
              type="button"
              onClick={onNewSetlist}
              style={{
                ...btnStyle,
                padding: '10px 18px',
                borderRadius: 10,
                background: 'var(--accent-soft)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: 'var(--accent-text)',
                fontSize: 13,
                margin: '0 auto',
              }}
            >
              New setlist
            </button>
          </div>
        ) : (
          upcomingSetlists.map(sl => {
            const d = new Date(sl.date + 'T12:00:00');
            const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayNum = d.getDate();
            const dateLine = d.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            });
            const st = setlistStatus(sl, songs);
            return (
              <div
                key={sl.id}
                role="button"
                tabIndex={0}
                onClick={() => onViewSetlist(sl)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewSetlist(sl);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  background: 'var(--card-elevated)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 52,
                  flexShrink: 0,
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 6px',
                }}
                >
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'var(--fm)',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                  }}>
                    {month}
                  </div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--text-bright)',
                    fontFamily: 'var(--fb)',
                    lineHeight: 1.1,
                  }}>
                    {dayNum}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 6,
                  }}
                  >
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--text-bright)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {sl.name || 'Untitled'}
                    </div>
                    <span style={pillStyle(st.pill)}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {dateLine}
                    {sl.service ? ` · ${sl.service}` : ''}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{st.footer}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
                      style={{
                        ...btnStyle,
                        background: 'var(--accent-soft)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: 'var(--accent-text)',
                        padding: '6px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    >
                      Live
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 28 }}>
        <div style={sectionTitle}>Notes</div>
        <textarea
          value={homeNotes}
          onChange={e => onUpdateSettings({ ...settings, homeNotes: e.target.value })}
          placeholder="Reminders, cables to pack, contacts..."
          rows={6}
          style={{
            width: '100%',
            maxWidth: 720,
            padding: '14px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'var(--card-elevated)',
            color: 'var(--text)',
            fontSize: 13,
            lineHeight: 1.5,
            resize: 'vertical',
            minHeight: 120,
            outline: 'none',
            fontFamily: 'var(--fm)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10,
        marginBottom: 28,
      }}>
        <button type="button" onClick={onNewSong} style={{
          ...btnStyle,
          flexDirection: 'column',
          gap: 6,
          padding: '16px 12px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-soft)',
          border: '1px solid rgba(99,102,241,0.2)',
          color: 'var(--accent-text)',
          fontSize: 12,
          justifyContent: 'center',
        }}
        >
          <span style={{ fontSize: 20 }}>+</span>
          New song
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} style={{
          ...btnStyle,
          flexDirection: 'column',
          gap: 6,
          padding: '16px 12px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: 12,
          justifyContent: 'center',
        }}
        >
          <span style={{ fontSize: 20 }}>{'\u2191'}</span>
          Import .md
        </button>
        <button type="button" onClick={onNewSetlist} style={{
          ...btnStyle,
          flexDirection: 'column',
          gap: 6,
          padding: '16px 12px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: 12,
          justifyContent: 'center',
        }}
        >
          <span style={{ fontSize: 20 }}>{'\u2630'}</span>
          New setlist
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

      {/* Recent songs */}
      {recentSongs.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={sectionTitle}>Recent songs</div>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  marginBottom: 6,
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                  border: `1px solid ${s.b}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--fm)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: s.d,
                }}
                >
                  {song.key}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {song.artist}
                  </div>
                </div>
                <span style={{
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--fm)',
                }}>
                  {song.tempo ? `${song.tempo}bpm` : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onGoLibrary}
        style={{
          ...btnStyle,
          width: '100%',
          maxWidth: 400,
          padding: '14px 18px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: 14,
          justifyContent: 'center',
        }}
      >
        Open full library
      </button>
    </div>
  );
}
