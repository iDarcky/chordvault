import { transposeChord, sectionStyle } from '../music';
import { parseLine } from '../parser';
import TabBlock from './TabBlock';

function ChordToken({ chord, text, transpose }) {
  const transposed = chord ? transposeChord(chord, transpose) : '';
  return (
    <span style={{ display: 'inline-block', verticalAlign: 'top', marginRight: 1 }}>
      <span style={{
        display: 'block', fontFamily: 'var(--fm)', fontWeight: 700,
        fontSize: 13, color: 'var(--chord)', height: 19, lineHeight: '19px',
        whiteSpace: 'pre', letterSpacing: '0.01em',
      }}>
        {transposed || '\u00A0'}
      </span>
      <span style={{
        display: 'block', fontFamily: 'var(--fb)', fontSize: 15,
        color: 'var(--text)', lineHeight: '21px', whiteSpace: 'pre',
      }}>
        {text || '\u00A0'}
      </span>
    </span>
  );
}

export default function SectionBlock({ section, transpose = 0 }) {
  const s = sectionStyle(section.type);

  return (
    <div style={{
      background: s.bg, border: `1.5px solid ${s.b}88`,
      borderRadius: 10, padding: '12px 16px', marginBottom: 8,
      position: 'relative',
    }}>
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        background: s.b, borderRadius: '3px 0 0 3px',
      }} />

      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: section.lines.length ? 8 : 0,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${s.d}`, color: s.d,
          fontSize: 10, fontWeight: 700, fontFamily: 'var(--fm)', flexShrink: 0,
        }}>
          {s.l}
        </span>
        <span style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text-bright)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {section.type}
        </span>
        {section.note && (
          <span style={{
            fontSize: 10.5, color: 'rgba(255,255,255,0.28)',
            fontStyle: 'italic', marginLeft: 'auto',
            maxWidth: '45%', textAlign: 'right', lineHeight: 1.3,
          }}>
            {section.note}
          </span>
        )}
      </div>

      {/* Chord/lyric lines */}
      {section.lines.length > 0 && (
        <div style={{ paddingLeft: 36 }}>
          {section.lines.map((line, i) => {
            if (typeof line === 'object' && line.type === 'tab') {
              return <TabBlock key={i} data={line} />;
            }
            if (!line.trim()) return <div key={i} style={{ height: 5 }} />;

            const parts = parseLine(line);
            const hasChords = parts.some(p => p.chord);

            if (!hasChords) {
              return (
                <div key={i} style={{
                  fontSize: 15, color: 'var(--text)',
                  lineHeight: '21px', marginBottom: 1,
                  whiteSpace: 'pre-wrap',
                }}>
                  {line}
                </div>
              );
            }

            return (
              <div key={i} style={{ marginBottom: 1, whiteSpace: 'pre-wrap', lineHeight: 1 }}>
                {parts.map((p, j) => (
                  <ChordToken key={j} chord={p.chord} text={p.text} transpose={transpose} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
