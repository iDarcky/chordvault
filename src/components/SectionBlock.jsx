import { transposeChord, sectionStyle } from '../music';
import { parseLine, extractInlineNotes } from '../parser';
import TabBlock from './TabBlock';
import { Badge } from './ui/Badge';

function ChordToken({ chord, text, transpose }) {
  const transposed = chord ? transposeChord(chord, transpose) : '';
  return (
    <span className="inline-block align-top mr-px">
      <span className="block font-mono font-bold text-[13px] text-[var(--chord)] h-[19px] leading-[19px] whitespace-pre tracking-tight">
        {transposed || '\u00A0'}
      </span>
      <span className="block text-[15px] text-[var(--ds-gray-900)] leading-[21px] whitespace-pre">
        {text || '\u00A0'}
      </span>
    </span>
  );
}

const LEADER_STYLES = {
  none: {},
  dashes: { backgroundImage: 'repeating-linear-gradient(to right, var(--ds-gray-500) 0px, var(--ds-gray-500) 8px, transparent 8px, transparent 14px)', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' },
  dots: { backgroundImage: 'radial-gradient(circle, var(--ds-gray-500) 1px, transparent 1px)', backgroundSize: '6px 3px', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' },
  arrow: { backgroundImage: 'repeating-linear-gradient(to right, var(--ds-gray-500) 0px, var(--ds-gray-500) 8px, transparent 8px, transparent 14px)', backgroundRepeat: 'repeat-x', backgroundPosition: 'center', arrow: true },
};

function InlineNoteTag({ notes, leaderStyle = 'dashes' }) {
  const style = LEADER_STYLES[leaderStyle] || LEADER_STYLES.dashes;
  return (
    <span className="inline-flex items-end flex-1 min-w-[40px] ml-1.5">
      {leaderStyle !== 'none' && (
        <span
          className="flex-1 self-center h-0.5 min-w-[20px]"
          style={{ ...style, marginRight: style.arrow ? 0 : 6 }}
        />
      )}
      {leaderStyle === 'none' && <span className="flex-1" />}
      {style.arrow && (
        <span className="self-center text-[var(--ds-gray-500)] text-[9px] leading-none mr-1.5">&#9656;</span>
      )}
      <span className="text-copy-11 italic whitespace-nowrap text-[var(--chord)] opacity-70 leading-[19px]">
        {notes.join(' · ')}
      </span>
    </span>
  );
}

function ModulateBadge({ semitones }) {
  const sign = semitones > 0 ? '+' : '';
  return (
    <div className="flex items-center gap-2 my-1.5 py-1 border-t border-b border-dashed border-[var(--color-brand)]">
      <Badge variant="brand" className="text-label-10-mono">
        Key Change: {sign}{semitones}
      </Badge>
    </div>
  );
}

export default function SectionBlock({ section, transpose = 0, modulateOffset = 0, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', collapsed = false }) {
  const s = sectionStyle(section.type);

  if (collapsed) {
    return (
      <div
        className="rounded-xl px-4 py-2.5 mb-2 relative opacity-70"
        style={{ background: s.bg, border: `1.5px solid ${s.b}33` }}
      >
        {/* Left accent bar */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ background: s.b }}
        />
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[8px] font-bold font-mono shrink-0"
            style={{ border: `2px solid ${s.d}`, color: s.d }}
          >
            {s.l}
          </span>
          <span className="text-label-12 font-bold text-[var(--ds-gray-600)]">
            {section.type}
          </span>
          <span className="text-copy-11 text-[var(--ds-gray-500)] italic">
            (see above)
          </span>
          {section.note && (
            <span className="text-copy-11 text-[var(--ds-gray-600)] italic ml-auto max-w-[45%] text-right leading-tight">
              {section.note}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isDrummer = displayRole === 'drummer';
  const isVocalist = displayRole === 'vocalist';

  // Count non-empty lyric lines for drummer bar count
  const lineCount = isDrummer ? section.lines.filter(l => typeof l === 'string' && l.trim()).length : 0;

  // Pre-compute lines with running modulate offset
  const renderLines = () => {
    if (isDrummer) {
      return section.lines.map((line, i) => {
        if (typeof line === 'object' && line.type === 'modulate') {
          return <ModulateBadge key={i} semitones={line.semitones} />;
        }
        return null;
      }).filter(Boolean);
    }

    let runningMod = 0;
    return section.lines.map((line, i) => {
      if (typeof line === 'object' && line.type === 'modulate') {
        runningMod += line.semitones;
        return <ModulateBadge key={i} semitones={line.semitones} />;
      }
      if (typeof line === 'object' && line.type === 'tab') {
        return <TabBlock key={i} data={line} />;
      }
      if (!line.trim()) return <div key={i} className="h-[5px]" />;

      const { clean, notes } = extractInlineNotes(line);
      const effectiveTranspose = transpose + modulateOffset + runningMod;
      const parts = parseLine(clean);
      const hasChords = parts.some(p => p.chord);
      const hasNotes = showInlineNotes && notes.length > 0;

      if (isVocalist) {
        const lyricsText = parts.map(p => p.text).join('');
        return (
          <div key={i} className={`${hasNotes ? 'flex items-end' : ''} text-[15px] text-[var(--ds-gray-900)] leading-[21px] mb-px`}>
            <span className="whitespace-pre-wrap">{lyricsText || clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      if (!hasChords) {
        return (
          <div key={i} className={`${hasNotes ? 'flex items-end' : ''} text-[15px] text-[var(--ds-gray-900)] leading-[21px] mb-px`}>
            <span className="whitespace-pre-wrap">{clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      return (
        <div key={i} className="flex items-end mb-px leading-none">
          <span className="whitespace-pre-wrap">
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
    <div
      className="rounded-xl px-4 py-3 mb-2 relative"
      style={{ background: s.bg, border: `1.5px solid ${s.br}` }}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ background: s.b }}
      />

      {/* Section header */}
      <div className={`flex items-center gap-2 ${(!isDrummer && section.lines.length) ? 'mb-2' : ''}`}>
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold font-mono shrink-0"
          style={{ border: `2px solid ${s.d}`, color: s.d }}
        >
          {s.l}
        </span>
        <span className="text-label-13 font-bold text-[var(--ds-gray-1000)]">
          {section.type}
        </span>
        {isDrummer && lineCount > 0 && (
          <span className="text-label-11-mono font-semibold text-[var(--ds-gray-500)] opacity-60">
            {lineCount} line{lineCount !== 1 ? 's' : ''}
          </span>
        )}
        {section.note && (
          <span
            className={`italic ml-auto text-right leading-tight ${
              isDrummer
                ? 'text-label-12 text-[var(--ds-gray-600)] font-semibold max-w-[60%]'
                : 'text-copy-11 text-[var(--ds-gray-500)] max-w-[45%]'
            }`}
          >
            {section.note}
          </span>
        )}
      </div>

      {/* Content */}
      {isDrummer && (
        <div className="pl-9">{renderLines()}</div>
      )}
      {!isDrummer && section.lines.length > 0 && (
        <div className="pl-9">{renderLines()}</div>
      )}
    </div>
  );
}
