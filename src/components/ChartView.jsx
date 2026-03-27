import { useState } from 'react';
import { transposeKey } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';

export default function ChartView({ song, onBack, onEdit, navOverride }) {
  const [transpose, setTranspose] = useState(0);
  const [cols, setCols] = useState(2);
  const [size, setSize] = useState(1);

  const mid = cols === 2
    ? Math.ceil(song.sections.length / 2)
    : song.sections.length;

  const btnStyle = {
    width: 28, height: 28, borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--fm)',
  };

  const toggleStyle = (active) => ({
    ...btnStyle, padding: '4px 10px', width: 'auto',
    borderColor: active ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
    color: active ? 'var(--accent-text)' : 'rgba(255,255,255,0.4)',
    background: active ? 'var(--accent-soft)' : 'var(--surface)',
  });

  const labelStyle = {
    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '14px 18px 10px',
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onBack} style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: 4,
            }}>
              &#8592; Back
            </button>
            <div>
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 700,
                color: 'var(--text-bright)', letterSpacing: '-0.02em',
              }}>
                {song.title}
              </h1>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {song.artist}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <MetaPill label="Key" value={transposeKey(song.key, transpose)} highlight={transpose !== 0} />
            <MetaPill label="BPM" value={song.tempo} />
            <MetaPill label="Time" value={song.time} />
            {song.ccli && <MetaPill label="CCLI" value={song.ccli} />}
            {onEdit && (
              <button onClick={onEdit} style={{
                ...btnStyle, width: 'auto', padding: '5px 10px', fontSize: 12,
              }}>
                Edit
              </button>
            )}
          </div>
        </div>

        <StructureRibbon structure={song.structure || []} />

        {/* Controls */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          flexWrap: 'wrap', marginTop: 4, paddingBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={labelStyle}>Transpose</span>
            <button onClick={() => setTranspose(p => (p - 1 + 12) % 12)} style={btnStyle}>&#8722;</button>
            <span style={{
              minWidth: 26, textAlign: 'center',
              fontFamily: 'var(--fm)', fontWeight: 700, fontSize: 13,
              color: transpose ? 'var(--chord)' : 'rgba(255,255,255,0.4)',
            }}>
              {transpose > 0 ? '+' : ''}{transpose}
            </span>
            <button onClick={() => setTranspose(p => (p + 1) % 12)} style={btnStyle}>+</button>
          </div>

          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={labelStyle}>Layout</span>
            {[1, 2].map(n => (
              <button key={n} onClick={() => setCols(n)} style={toggleStyle(cols === n)}>
                {n}col
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={labelStyle}>Size</span>
            {[{ l: 'S', v: 0.88 }, { l: 'M', v: 1 }, { l: 'L', v: 1.14 }].map(({ l, v }) => (
              <button key={l} onClick={() => setSize(v)} style={toggleStyle(size === v)}>
                {l}
              </button>
            ))}
          </div>

          {navOverride && <div style={{ marginLeft: 'auto' }}>{navOverride}</div>}
        </div>
      </div>

      {/* Chart body */}
      <div style={{
        display: cols === 2 ? 'grid' : 'block',
        gridTemplateColumns: cols === 2 ? '1fr 1fr' : '1fr',
        gap: 10, padding: '14px 16px 50px',
        transform: `scale(${size})`, transformOrigin: 'top left',
        width: size !== 1 ? `${100 / size}%` : '100%',
      }}>
        <div>
          {song.sections.slice(0, mid).map((sec, i) => (
            <SectionBlock key={i} section={sec} transpose={transpose} />
          ))}
        </div>
        {cols === 2 && (
          <div>
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} transpose={transpose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
