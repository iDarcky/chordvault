import { useState, useMemo } from 'react';
import { transposeKey, sectionStyle } from '../music';
import ChartView from './ChartView';

export default function SetlistPlayer({ setlist, songs, onBack }) {
  const [idx, setIdx] = useState(0);

  const resolved = useMemo(() =>
    setlist.items
      .map(it => ({ ...it, song: songs.find(s => s.id === it.songId) }))
      .filter(it => it.song),
    [setlist, songs]
  );

  if (!resolved.length) {
    return (
      <div style={{
        padding: 40, textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        No songs in setlist
      </div>
    );
  }

  const cur = resolved[idx];
  const songWithTranspose = { ...cur.song };

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
        onClick={() => setIdx(p => Math.max(0, p - 1))}
        disabled={idx === 0}
        style={{ ...cB, opacity: idx === 0 ? 0.3 : 1 }}
      >
        &#9664;
      </button>
      <button
        onClick={() => setIdx(p => Math.min(resolved.length - 1, p + 1))}
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
        const s = sectionStyle(r.song.sections?.[0]?.type || 'Verse');
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              flex: 1, height: i === idx ? 6 : 4, borderRadius: 3,
              background: i === idx ? s.b : i < idx ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease', minWidth: 0, minHeight: 'auto',
            }}
          />
        );
      })}
    </div>
  );

  const songBar = (
    <div className="hide-scrollbar" style={{
      display: 'flex', gap: 6, padding: '6px 18px',
      overflow: 'auto', scrollbarWidth: 'none',
    }}>
      {resolved.map((r, i) => {
        const s = sectionStyle(r.song.sections?.[0]?.type || 'Verse');
        const active = i === idx;
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
      <ChartView
        song={songWithTranspose}
        onBack={onBack}
        navOverride={nav}
      />
    </div>
  );
}
