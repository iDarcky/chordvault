import { useMemo } from 'react';
import { transposeKey, sectionStyle } from '../music';

const btnStyle = {
  border: 'none', borderRadius: 7, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 5,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 12,
};

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const getSong = (id) => songs.find(s => s.id === id);

  const { songCount, breakCount, totalDuration } = useMemo(() => {
    let sc = 0, bc = 0, dur = 0;
    for (const it of setlist.items) {
      if (it.type === 'break') {
        bc++;
        dur += it.duration || 0;
      } else {
        sc++;
        const s = getSong(it.songId);
        if (s) {
          const bpm = s.tempo || 120;
          dur += Math.round(240 / bpm * s.sections.length);
        }
      }
    }
    return { songCount: sc, breakCount: bc, totalDuration: dur };
  }, [setlist, songs]);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--header-bg, rgba(11,11,15,0.92))', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: 4,
          }}>
            &#8592; Back
          </button>
          <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-bright)' }}>
            {setlist.name || 'Untitled Setlist'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onExport} style={{
            ...btnStyle, background: 'var(--surface)',
            border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
          }}>
            &#8595; Export
          </button>
          <button onClick={onEdit} style={{
            ...btnStyle, background: 'var(--surface)',
            border: '1px solid var(--border)', color: '#94a3b8', padding: '7px 12px',
          }}>
            Edit
          </button>
          <button onClick={onPlay} style={{
            ...btnStyle, background: 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--accent-text)', padding: '7px 16px',
          }}>
            Live
          </button>
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: '16px 18px 8px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          padding: '4px 10px', borderRadius: 6,
          background: 'var(--accent-soft)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: 12, fontWeight: 600, color: 'var(--accent-text)',
        }}>
          {setlist.service || 'Service'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{dateStr}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--fm)' }}>
          {songCount} song{songCount !== 1 ? 's' : ''}
          {breakCount > 0 && ` + ${breakCount} break${breakCount !== 1 ? 's' : ''}`}
          {totalDuration > 0 && ` · ~${totalDuration} min`}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: '8px 18px 40px' }}>
        {setlist.items.map((item, idx) => {
          // Break item
          if (item.type === 'break') {
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
                borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
                padding: '12px 16px', background: 'rgba(255,255,255,0.015)',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text-dim)',
                  fontFamily: 'var(--fm)', width: 24, textAlign: 'center', flexShrink: 0,
                }}>
                  {idx + 1}
                </span>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(107,114,128,0.15)',
                  border: '1px solid rgba(107,114,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: 'rgba(255,255,255,0.4)',
                }}>
                  &#9646;
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: 'var(--text-bright)',
                    fontStyle: 'italic',
                  }}>
                    {item.label || 'Break'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    {item.duration > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--fm)' }}>
                        {item.duration} min
                      </span>
                    )}
                    {item.note && (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {item.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Song item
          const song = getSong(item.songId);
          if (!song) return null;
          const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
          const displayKey = transposeKey(song.key, item.transpose);

          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px', background: 'rgba(255,255,255,0.015)',
            }}>
              <span style={{
                fontSize: 13, fontWeight: 500, color: 'var(--text-dim)',
                fontFamily: 'var(--fm)', width: 24, textAlign: 'center', flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                border: `1px solid ${s.b}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--fm)', fontSize: 13, fontWeight: 500, color: s.d,
              }}>
                {displayKey}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: 'var(--text-bright)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {song.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  {song.artist} · {song.tempo} bpm · {song.time}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                {item.transpose !== 0 && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 500,
                    fontFamily: 'var(--fm)', color: 'var(--chord)',
                    background: 'rgba(226,168,50,0.1)', border: '1px solid rgba(226,168,50,0.2)',
                  }}>
                    {song.key} → {displayKey}
                  </span>
                )}
                {(item.capo || 0) > 0 && (
                  <span style={{
                    padding: '2px 7px', borderRadius: 5, fontSize: 10, fontWeight: 500,
                    fontFamily: 'var(--fm)', color: 'var(--accent-text)',
                    background: 'var(--accent-soft)', border: '1px solid rgba(99,102,241,0.2)',
                  }}>
                    Capo {item.capo}
                  </span>
                )}
                {item.note && (
                  <span style={{
                    fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic',
                    maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.note}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
