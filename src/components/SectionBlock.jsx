import { sectionStyle } from '../music';
import { parseLine } from '../parser';
import { useMemo } from 'react';

export default function SectionBlock({ section, transpose, size, showInlineNotes, inlineNoteStyle, displayRole }) {
  const isVocalist = displayRole === 'vocalist';
  const isDrummer = displayRole === 'drummer';
  const isLeader = displayRole === 'leader';

  const style = useMemo(() => sectionStyle(section.type), [section.type]);

  if (isDrummer) {
    return (
      <div style={{ marginBottom: 32 * size, padding: '16px 20px', borderRadius: 12, background: 'var(--surface)', border: `1px solid ${style.b}33`, borderLeft: `4px solid ${style.b}` }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: style.b, margin: '0 0 4px', textTransform: 'uppercase' }}>{section.type}</h4>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>
          {section.lines.filter(l => typeof l === 'object' && l.type === 'modulate').map((l, i) => (
            <div key={i}>MODULATE {l.semitones > 0 ? '+' : ''}{l.semitones}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ marginBottom: 40 * size }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
         <h4 style={{ fontSize: 11, fontWeight: 800, color: style.b, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{section.type}</h4>
         <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${style.b}33, transparent)` }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 * size }}>
        {section.lines.map((line, li) => {
          if (typeof line === 'object') return null; // Logic handled at chart level
          return (
             <div key={li} style={{ lineHeight: 1.6, fontSize: 16 * size }}>
                <LineContent line={line} transpose={transpose} showChords={!isVocalist} />
             </div>
          );
        })}
      </div>
    </div>
  );
}

function LineContent({ line, transpose, showChords }) {
  const parts = parseLine(line);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 4 }}>
      {parts.map((p, i) => (
        <span key={i} style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', marginTop: showChords ? 20 : 0 }}>
          {showChords && p.chord && (
            <span style={{ position: 'absolute', top: -20, left: 0, fontSize: '0.85em', fontWeight: 800, color: 'var(--chord)', fontFamily: 'var(--fm)' }}>{p.chord}</span>
          )}
          <span>{p.text || '\u00A0'}</span>
        </span>
      ))}
    </div>
  );
}
