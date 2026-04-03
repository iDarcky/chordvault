import { transposeChord, sectionStyle } from '../music';
import { parseLine, extractInlineNotes } from '../parser';
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

const LEADER_STYLES = {
  none: { border: 'none' },
  dashes: { borderBottom: '1px dashed rgba(255,255,255,0.15)' },
  dots: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '6px 3px', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' },
  arrow: { borderBottom: '1px solid rgba(255,255,255,0.15)', arrow: true },
};

function InlineNoteTag({ notes, leaderStyle = 'dashes' }) {
  const style = LEADER_STYLES[leaderStyle] || LEADER_STYLES.dashes;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'flex-end',
      flex: 1, minWidth: 40, marginLeft: 6,
    }}>
      {leaderStyle !== 'none' && (
        <span style={{
          flex: 1, alignSelf: 'center',
          ...style,
          height: style.backgroundImage ? 3 : undefined,
          marginBottom: 3, marginRight: style.arrow ? 0 : 6,
          minWidth: 20,
        }} />
      )}
      {leaderStyle === 'none' && <span style={{ flex: 1 }} />}
      {style.arrow && (
        <span style={{
          alignSelf: 'center', color: 'rgba(255,255,255,0.15)',
          fontSize: 10, lineHeight: 1, marginRight: 6, marginBottom: 1,
        }}>&#9656;</span>
      )}
      <span style={{
        fontSize: 10.5, fontStyle: 'italic', whiteSpace: 'nowrap',
        color: 'var(--chord)', opacity: 0.7,
        fontFamily: 'var(--fb)', lineHeight: '19px',
      }}>
        {notes.join(' · ')}
      </span>
    </span>
  );
}

function ModulateBadge({ semitones }) {
  const sign = semitones > 0 ? '+' : '';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      margin: '6px 0', padding: '4px 0',
      borderTop: '1px dashed var(--accent)',
      borderBottom: '1px dashed var(--accent)',
    }}>
      <span style={{
        fontSize: 10, fontWeight: 700, fontFamily: 'var(--fm)',
        color: 'var(--accent-text)', background: 'var(--accent-soft)',
        borderRadius: 4, padding: '2px 8px',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        Key Change: {sign}{semitones}
      </span>
    </div>
  );
}

export default function SectionBlock({ section, transpose = 0, modulateOffset = 0, showInlineNotes = true, inlineNoteStyle = 'dashes' }) {
  const s = sectionStyle(section.type);

  // Pre-compute lines with running modulate offset
  const renderLines = () => {
    let runningMod = 0;
    return section.lines.map((line, i) => {
      if (typeof line === 'object' && line.type === 'modulate') {
        runningMod += line.semitones;
        return <ModulateBadge key={i} semitones={line.semitones} />;
      }
      if (typeof line === 'object' && line.type === 'tab') {
        return <TabBlock key={i} data={line} />;
      }
      if (!line.trim()) return <div key={i} style={{ height: 5 }} />;

      const { clean, notes } = extractInlineNotes(line);
      const effectiveTranspose = transpose + modulateOffset + runningMod;
      const parts = parseLine(clean);
      const hasChords = parts.some(p => p.chord);
      const hasNotes = showInlineNotes && notes.length > 0;

      if (!hasChords) {
        return (
          <div key={i} style={{
            display: hasNotes ? 'flex' : 'block', alignItems: 'flex-end',
            fontSize: 15, color: 'var(--text)',
            lineHeight: '21px', marginBottom: 1,
          }}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      return (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 1, lineHeight: 1 }}>
          <span style={{ whiteSpace: 'pre-wrap' }}>
            {parts.map((p, j) => (
              <ChordToken key={j} chord={p.chord} text={p.text} transpose={effectiveTranspose} />
            ))}
          </span>
          {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
        </div>
      );
    });
  };

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
          {renderLines()}
        </div>
      )}
    </div>
  );
}
