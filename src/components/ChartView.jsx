import { useState, useMemo } from 'react';
import { transposeKey, transposeChord, ALL_KEYS, semitonesBetween } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';
import ChordDiagram from './ChordDiagram';
import { parseLine } from '../parser';

const SIZE_MAP = { S: 0.88, M: 1, L: 1.14 };

export default function ChartView({ song, onBack, onEdit, navOverride, compact, forceTranspose, capo = 0, defaultColumns, defaultFontSize, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', duplicateSections = 'full' }) {
  const [localTranspose, setLocalTranspose] = useState(0);
  const [cols, setCols] = useState(defaultColumns || 'auto');
  const [size, setSize] = useState(SIZE_MAP[defaultFontSize] || 1);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const transpose = forceTranspose != null ? forceTranspose : localTranspose;
  const chordTranspose = capo ? (transpose - capo + 12) % 12 : transpose;
  const currentKey = transposeKey(song.key, transpose);

  // Pre-compute cumulative modulate offsets per section
  const sectionModOffsets = useMemo(() => {
    const offsets = [];
    const acc = { total: 0 };
    for (const sec of song.sections) {
      offsets.push(acc.total);
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          acc.total += line.semitones;
        }
      }
    }
    return offsets;
  }, [song.sections]);

  // Compute which sections are collapsed (duplicate type, 1st-only mode)
  const collapsedSections = useMemo(() => {
    if (duplicateSections !== 'first') return [];
    const seen = new Set();
    return song.sections.map(sec => {
      const baseType = sec.type.replace(/\s*\d+$/, '').trim();
      if (seen.has(baseType)) return true;
      seen.add(baseType);
      return false;
    });
  }, [song.sections, duplicateSections]);

  // Collect unique chord names from all sections (transposed)
  const uniqueChords = useMemo(() => {
    if (!showDiagrams) return [];
    const seen = new Set();
    for (let si = 0; si < song.sections.length; si++) {
      const sec = song.sections[si];
      let runningMod = sectionModOffsets[si] || 0;
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          runningMod += line.semitones;
          continue;
        }
        if (typeof line !== 'string') continue;
        const parts = parseLine(line);
        for (const p of parts) {
          if (p.chord) {
            const transposed = transposeChord(p.chord, chordTranspose + runningMod);
            seen.add(transposed);
          }
        }
      }
    }
    return [...seen];
  }, [showDiagrams, song.sections, chordTranspose, sectionModOffsets]);

  const isExplicit2Col = cols === 2;
  const mid = (isExplicit2Col || cols === 'auto')
    ? Math.ceil(song.sections.length / 2)
    : song.sections.length;

  const btnStyle = {
    height: 32, borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--text)',
    fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--fb)', fontWeight: 500,
    padding: '0 10px',
  };

  const toggleStyle = (active) => ({
    ...btnStyle,
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    color: active ? 'var(--accent-text)' : 'var(--text-muted)',
    background: active ? 'var(--accent-soft)' : 'var(--surface)',
  });

  const handleKeyChange = (newKey) => {
    const semitones = semitonesBetween(song.key, newKey);
    setLocalTranspose(semitones);
  };

  return (
    <div style={{ minHeight: compact ? 'auto' : '100vh', background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--header-bg)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: compact ? '10px 18px 6px' : '12px 18px 8px',
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            {!compact && (
              <button onClick={onBack} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px 0', fontSize: 18, flexShrink: 0,
                display: 'flex', alignItems: 'center',
              }}>
                &#8592;
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                margin: 0, fontSize: compact ? 18 : 20, fontWeight: 700,
                color: 'var(--text-bright)', letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {song.title}
              </h1>
              {!compact && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                  {song.artist}
                </div>
              )}
            </div>
          </div>
          {!compact && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <MetaPill label="BPM" value={song.tempo} />
              <MetaPill label="Time" value={song.time} />
              {song.ccli && <MetaPill label="CCLI" value={song.ccli} />}
              {onEdit && (
                <button onClick={onEdit} style={btnStyle}>
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowSettings(v => !v)}
                style={{
                  ...btnStyle,
                  fontFamily: 'var(--fb)',
                  fontWeight: 700,
                  fontSize: 14,
                  borderColor: showSettings ? 'var(--accent)' : 'var(--border)',
                  color: showSettings ? 'var(--accent-text)' : 'var(--text)',
                  background: showSettings ? 'var(--accent-soft)' : 'var(--surface)',
                }}
              >
                Aa
              </button>
            </div>
          )}
          {compact && navOverride && <div>{navOverride}</div>}
        </div>

        <StructureRibbon structure={song.structure || []} compact />

        {/* Controls row — hidden in compact mode */}
        {!compact && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flexWrap: 'wrap', paddingBottom: 4,
          }}>
            {/* Key selector (transpose) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Key</span>
              <select
                value={currentKey}
                onChange={e => handleKeyChange(e.target.value)}
                style={{
                  ...btnStyle,
                  fontFamily: 'var(--fm)', fontWeight: 700, fontSize: 13,
                  color: transpose !== 0 ? 'var(--chord)' : 'var(--text)',
                  appearance: 'none', WebkitAppearance: 'none',
                  padding: '0 24px 0 10px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {ALL_KEYS.map(k => (
                  <option key={k} value={k}>{k}{k === song.key ? ' (original)' : ''}</option>
                ))}
              </select>
            </div>

            {capo > 0 && (
              <MetaPill label="Capo" value={`${capo} → ${transposeKey(song.key, chordTranspose)} shapes`} highlight />
            )}

            <div style={{ flex: 1 }} />

            <button onClick={() => setShowDiagrams(v => !v)} style={toggleStyle(showDiagrams)}>
              Diagrams
            </button>

            {navOverride && <div>{navOverride}</div>}
          </div>
        )}

        {/* Aa settings popover */}
        {showSettings && !compact && (
          <div style={{
            padding: '10px 0 6px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Layout</span>
              <button onClick={() => setCols('auto')} style={toggleStyle(cols === 'auto')}>Auto</button>
              {[1, 2].map(n => (
                <button key={n} onClick={() => setCols(n)} style={toggleStyle(cols === n)}>
                  {n}col
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>Size</span>
              {[{ l: 'S', v: 0.88 }, { l: 'M', v: 1 }, { l: 'L', v: 1.14 }].map(({ l, v }) => (
                <button key={l} onClick={() => setSize(v)} style={toggleStyle(size === v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chord diagram strip */}
        {showDiagrams && uniqueChords.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            paddingTop: 8, paddingBottom: 4,
            borderTop: '1px solid var(--border)',
            marginTop: 4,
            overflowX: 'auto',
          }}>
            {uniqueChords.map(chord => (
              <ChordDiagram key={chord} chord={chord} size={100} />
            ))}
          </div>
        )}
      </div>

      {/* Chart body */}
      <div
        className={cols === 'auto' ? 'chart-auto-cols' : undefined}
        style={{
          ...(cols !== 'auto' && {
            display: isExplicit2Col ? 'grid' : 'block',
            gridTemplateColumns: isExplicit2Col ? '1fr 1fr' : '1fr',
          }),
          gap: 10, padding: '14px 16px 50px',
          transform: `scale(${size})`, transformOrigin: 'top left',
          width: size !== 1 ? `${100 / size}%` : '100%',
        }}
      >
        <div>
          {song.sections.slice(0, mid).map((sec, i) => (
            <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[i]} />
          ))}
        </div>
        {(isExplicit2Col || cols === 'auto') && (
          <div>
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[mid + i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[mid + i]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
