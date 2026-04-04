import { useState, useMemo } from 'react';
import { transposeKey, transposeChord } from '../music';
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

  const transpose = forceTranspose != null ? forceTranspose : localTranspose;
  const chordTranspose = capo ? (transpose - capo + 12) % 12 : transpose;

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

  const mid = (cols === 2 || cols === 'auto') ? Math.ceil(song.sections.length / 2) : song.sections.length;

  return (
    <div style={{ minHeight: compact ? 'auto' : '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      {/* 2026 Pro Header */}
      <header className="glass-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-alt)', fontSize: 18 }}>←</button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{song.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{transposeKey(song.key, transpose)} • {song.artist}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowDiagrams(!showDiagrams)} style={{ padding: '8px 12px', background: showDiagrams ? 'var(--accent)' : 'var(--surface-alt)', color: showDiagrams ? '#fff' : 'var(--text)' }}>
             {showDiagrams ? 'SHAPES' : 'TEXT'}
          </button>
          <button onClick={onEdit} style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-alt)' }}>✎</button>
        </div>
      </header>

      <main style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto' }} className="hide-scrollbar">
          <MetaPill label="KEY" value={transposeKey(song.key, transpose)} />
          <MetaPill label="TEMPO" value={song.tempo ? `${song.tempo}BPM` : '-'} />
          <MetaPill label="TIME" value={song.time || '4/4'} />
        </div>

        {showDiagrams && uniqueChords.length > 0 && (
          <div className="bento-card" style={{ marginBottom: 32, display: 'flex', gap: 20, overflowX: 'auto' }} className="hide-scrollbar">
            {uniqueChords.map(chord => <ChordDiagram key={chord} chord={chord} size={50} />)}
          </div>
        )}

        <div className="chart-auto-cols" style={{ gap: 40 }}>
           <div>
             {song.sections.slice(0, mid).map((sec, i) => (
               <SectionBlock key={i} section={sec} transpose={chordTranspose + (sectionModOffsets[i] || 0)} size={size} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} />
             ))}
           </div>
           <div>
             {song.sections.slice(mid).map((sec, i) => (
               <SectionBlock key={i + mid} section={sec} transpose={chordTranspose + (sectionModOffsets[i + mid] || 0)} size={size} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} />
             ))}
           </div>
        </div>
      </main>

      {/* Floating Control Bar */}
      <footer style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--header-bg)', backdropFilter: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 40, padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setLocalTranspose(t => t - 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-alt)' }}>-</button>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{localTranspose > 0 ? `+${localTranspose}` : localTranspose}</span>
          <button onClick={() => setLocalTranspose(t => t + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-alt)' }}>+</button>
        </div>
        <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['S', 'M', 'L'].map(s => (
            <button key={s} onClick={() => setSize(SIZE_MAP[s])} style={{ width: 32, height: 32, borderRadius: 8, background: size === SIZE_MAP[s] ? 'var(--accent)' : 'transparent', color: size === SIZE_MAP[s] ? '#fff' : 'var(--text)', fontSize: 11 }}>{s}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
