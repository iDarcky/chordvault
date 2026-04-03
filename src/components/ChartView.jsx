import { useState, useMemo } from 'react';
import { transposeKey, transposeChord } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';
import ChordDiagram from './ChordDiagram';
import { parseLine } from '../parser';

const SIZE_MAP = { S: 0.88, M: 1, L: 1.14 };

export default function ChartView({ song, onBack, onEdit, navOverride, compact, forceTranspose, capo = 0, defaultColumns, defaultFontSize, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', duplicateSections = 'full', defaultChordDisplay = 'standard' }) {
  const [localTranspose, setLocalTranspose] = useState(0);
  const [cols, setCols] = useState(defaultColumns || 'auto');
  const [size, setSize] = useState(SIZE_MAP[defaultFontSize] || 1);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [chordDisplay, setChordDisplay] = useState(defaultChordDisplay);

  const transpose = forceTranspose != null ? forceTranspose : localTranspose;
  // When capo is set, chords render as shapes (shifted down by capo)
  const chordTranspose = capo ? (transpose - capo + 12) % 12 : transpose;

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
      // Normalize: "Chorus 2" → "Chorus", "Verse 1" → "Verse"
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

  const toggleChordDisplay = () => {
    const modes = ['standard', 'nashville', 'roman'];
    const nextIdx = (modes.indexOf(chordDisplay) + 1) % modes.length;
    setChordDisplay(modes[nextIdx]);
  };

  const getChordDisplayLabel = () => {
    if (chordDisplay === 'standard') return 'Standard';
    if (chordDisplay === 'nashville') return 'Nashville';
    if (chordDisplay === 'roman') return 'Roman';
    return 'Chords';
  };

  return (
    <div style={{ minHeight: compact ? 'auto' : '100vh', background: 'var(--bg)' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: compact ? '10px 18px 6px' : '14px 18px 10px',
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!compact && (
              <button onClick={onBack} style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: 4,
              }}>
                &#8592; Back
              </button>
            )}
            <div>
              <h1 style={{
                margin: 0, fontSize: compact ? 18 : 22, fontWeight: 700,
                color: 'var(--text-bright)', letterSpacing: '-0.02em',
              }}>
                {song.title}
              </h1>
              {!compact && (
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {song.artist}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <MetaPill label="Key" value={transposeKey(song.key, compact ? 0 : transpose)} highlight={transpose !== 0} />
            {capo > 0 && (
              <MetaPill label="Capo" value={`${capo} → ${transposeKey(song.key, chordTranspose)} shapes`} highlight />
            )}
            {!compact && (
              <>
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
              </>
            )}
            {compact && navOverride && <div>{navOverride}</div>}
          </div>
        </div>

        <StructureRibbon structure={song.structure || []} compact={compact} />

        {/* Controls — hidden in compact mode */}
        {!compact && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            flexWrap: 'wrap', marginTop: 4, paddingBottom: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={labelStyle}>Transpose</span>
              <button onClick={() => setLocalTranspose(p => (p - 1 + 12) % 12)} style={btnStyle}>&#8722;</button>
              <span style={{
                minWidth: 26, textAlign: 'center',
                fontFamily: 'var(--fm)', fontWeight: 700, fontSize: 13,
                color: transpose ? 'var(--chord)' : 'rgba(255,255,255,0.4)',
              }}>
                {transpose > 0 ? '+' : ''}{transpose}
              </span>
              <button onClick={() => setLocalTranspose(p => (p + 1) % 12)} style={btnStyle}>+</button>
            </div>

            <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={labelStyle}>Layout</span>
              <button onClick={() => setCols('auto')} style={toggleStyle(cols === 'auto')}>Auto</button>
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

            <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <button onClick={toggleChordDisplay} style={toggleStyle(chordDisplay !== 'standard')}>
                {getChordDisplayLabel()}
              </button>
              <button onClick={() => setShowDiagrams(v => !v)} style={toggleStyle(showDiagrams)}>
                Diagrams
              </button>
            </div>

            {navOverride && <div style={{ marginLeft: 'auto' }}>{navOverride}</div>}
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
            <SectionBlock key={i} section={sec} keySig={song.key} transpose={chordTranspose} modulateOffset={sectionModOffsets[i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} chordDisplay={chordDisplay} collapsed={collapsedSections[i]} />
          ))}
        </div>
        {(isExplicit2Col || cols === 'auto') && (
          <div>
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} keySig={song.key} transpose={chordTranspose} modulateOffset={sectionModOffsets[mid + i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} chordDisplay={chordDisplay} collapsed={collapsedSections[mid + i]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
