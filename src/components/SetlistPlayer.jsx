import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { transposeKey, sectionStyle } from '../music';
import ChartView from './ChartView';

export default function SetlistPlayer({ setlist, songs, onBack, defaultColumns, defaultFontSize, showInlineNotes, inlineNoteStyle, displayRole, duplicateSections, defaultChordDisplay }) {
  const [idx, setIdx] = useState(0);
  const songBarRef = useRef(null);

  const resolved = useMemo(() =>
    setlist.items
      .map(it => {
        if (it.type === 'break') return { ...it, isBreak: true };
        const song = songs.find(s => s.id === it.songId);
        return song ? { ...it, song } : null;
      })
      .filter(Boolean),
    [setlist, songs]
  );

  const goNext = useCallback(() => setIdx(p => Math.min(resolved.length - 1, p + 1)), [resolved.length]);
  const goPrev = useCallback(() => setIdx(p => Math.max(0, p - 1)), []);

  // Auto-scroll song strip to keep active item visible
  useEffect(() => {
    const container = songBarRef.current;
    if (!container) return;
    const activeBtn = container.children[idx];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [idx]);

  // Keyboard / Bluetooth pedal navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!resolved.length) {
    return (
      <div style={{
        padding: 40, textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        No items in setlist
      </div>
    );
  }

  const cur = resolved[idx];

  const cB = {
    width: 28, height: 28, borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--fm)',
  };

  const nav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--fm)',
      }}>
        {idx + 1}/{resolved.length}
      </span>
      <button
        onClick={goPrev}
        disabled={idx === 0}
        style={{ ...cB, opacity: idx === 0 ? 0.3 : 1 }}
      >
        &#9664;
      </button>
      <button
        onClick={goNext}
        disabled={idx === resolved.length - 1}
        style={{ ...cB, opacity: idx === resolved.length - 1 ? 0.3 : 1 }}
      >
        &#9654;
      </button>
    </div>
  );

  const progress = (
    <div style={{ display: 'flex', gap: 3, padding: '8px 18px 0', overflow: 'hidden' }}>
      {resolved.map((r, i) => {
        const color = r.isBreak
          ? '#6b7280'
          : sectionStyle(r.song.sections?.[0]?.type || 'Verse').b;
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              flex: 1, height: i === idx ? 6 : 4, borderRadius: 3,
              background: i === idx ? color : i < idx ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease', minWidth: 0, minHeight: 'auto',
            }}
          />
        );
      })}
    </div>
  );

  const songBar = (
    <div ref={songBarRef} className="hide-scrollbar" style={{
      display: 'flex', gap: 6, padding: '6px 18px',
      overflow: 'auto', scrollbarWidth: 'none',
    }}>
      {resolved.map((r, i) => {
        const active = i === idx;
        if (r.isBreak) {
          return (
            <button key={i} onClick={() => setIdx(i)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center',
              gap: 6, padding: '5px 10px', borderRadius: 8,
              border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)'}`,
              background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: active ? 'rgba(255,255,255,0.5)' : 'var(--text-dim)',
                fontFamily: 'var(--fm)',
              }}>
                {i + 1}
              </span>
              <span style={{
                fontSize: 11.5, fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-bright)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', fontFamily: 'var(--fb)',
                fontStyle: 'italic',
              }}>
                {r.label || 'Break'}
              </span>
            </button>
          );
        }
        const s = sectionStyle(r.song.sections?.[0]?.type || 'Verse');
        return (
          <button key={i} onClick={() => setIdx(i)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center',
            gap: 6, padding: '5px 10px', borderRadius: 8,
            border: `1px solid ${active ? s.b + '66' : 'rgba(255,255,255,0.04)'}`,
            background: active ? s.bg : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: active ? s.d : 'var(--text-dim)',
              fontFamily: 'var(--fm)',
            }}>
              {i + 1}
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-bright)' : 'var(--text-muted)',
              whiteSpace: 'nowrap', fontFamily: 'var(--fb)',
            }}>
              {r.song.title}
            </span>
            <span style={{
              fontSize: 10,
              color: active ? 'var(--chord)' : 'rgba(255,255,255,0.2)',
              fontFamily: 'var(--fm)',
            }}>
              {transposeKey(r.song.key, r.transpose)}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* Back button for the whole player */}
      <div style={{
        padding: '10px 18px 0',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', padding: 4, fontSize: 14,
        }}>
          &#8592; Back
        </button>
        <span style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
        }}>
          {setlist.name}
        </span>
      </div>
      {progress}
      {songBar}
      {cur.note && (
        <div style={{ padding: '4px 18px 0' }}>
          <div style={{
            padding: '6px 12px', borderRadius: 6,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)',
            fontSize: 12, color: '#fbbf24', fontFamily: 'var(--fb)',
          }}>
            {cur.note}
          </div>
        </div>
      )}
      {cur.isBreak ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px', minHeight: '50vh',
        }}>
          <div style={{
            fontSize: 32, fontWeight: 700,
            color: 'var(--text-bright)', marginBottom: 8,
          }}>
            {cur.label || 'Break'}
          </div>
          {cur.duration > 0 && (
            <div style={{
              fontSize: 16, color: 'var(--text-muted)',
              fontFamily: 'var(--fm)', marginBottom: 8,
            }}>
              {cur.duration} min
            </div>
          )}
          <div style={{ marginTop: 16 }}>{nav}</div>
        </div>
      ) : (
        <ChartView
          song={{ ...cur.song, key: transposeKey(cur.song.key, cur.transpose) }}
          onBack={onBack}
          navOverride={nav}
          compact
          forceTranspose={cur.transpose}
          capo={cur.capo || 0}
          defaultColumns={defaultColumns}
          defaultFontSize={defaultFontSize}
          showInlineNotes={showInlineNotes}
          inlineNoteStyle={inlineNoteStyle}
          displayRole={displayRole}
          duplicateSections={duplicateSections}
          defaultChordDisplay={defaultChordDisplay}
        />
      )}
    </div>
  );
}
