import { transposeChord, sectionStyle } from '../music';
import { parseLine, extractInlineNotes } from '../parser';
import TabBlock from './TabBlock';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

function ChordToken({ chord, text, transpose }) {
  const transposed = chord ? transposeChord(chord, transpose) : '';
  return (
    <span className="inline-block align-top mr-0.5">
      <span className="block font-mono font-bold text-sm text-geist-link h-[18px] leading-[18px] whitespace-pre tracking-wide">
        {transposed || '\u00A0'}
      </span>
      <span className="block font-sans text-base text-foreground leading-[22px] whitespace-pre">
        {text || '\u00A0'}
      </span>
    </span>
  );
}

function InlineNoteTag({ notes, leaderStyle = 'dashes' }) {
  const leaderClasses = {
    none: "",
    dashes: "flex-1 self-center h-[1px] mx-2 bg-accents-2 border-dashed",
    dots: "flex-1 self-center h-[1px] mx-2 bg-accents-2 border-dotted",
    arrow: "flex-1 self-center h-[1px] ml-2 mr-1 bg-accents-2 border-dashed",
  };

  return (
    <span className="inline-flex items-end flex-1 min-w-[40px] ml-2">
      {leaderStyle !== 'none' && (
        <span className={cn(leaderClasses[leaderStyle], "border-t-[1px]")} />
      )}
      {leaderStyle === 'arrow' && (
        <span className="self-center text-accents-3 text-[10px] mr-2">&#9656;</span>
      )}
      <span className="text-[11px] italic whitespace-nowrap text-accents-5 font-medium leading-[18px]">
        {notes.join(' · ')}
      </span>
    </span>
  );
}

function ModulateBadge({ semitones }) {
  const sign = semitones > 0 ? '+' : '';
  return (
    <div className="flex items-center gap-2 my-2 py-2 border-y border-dashed border-geist-link/30">
      <Badge variant="success" className="font-mono text-[10px] h-5 px-2">
        KEY CHANGE: {sign}{semitones}
      </Badge>
    </div>
  );
}

export default function SectionBlock({
  section, transpose = 0, modulateOffset = 0, showInlineNotes = true,
  inlineNoteStyle = 'dashes', displayRole = 'leader', collapsed = false
}) {
  const s = sectionStyle(section.type);

  if (collapsed) {
    return (
      <div
        className="rounded-geist border border-accents-2 bg-accents-1/30 p-3 mb-4 relative opacity-60 flex items-center gap-3"
      >
        <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-geist" style={{ background: s.b }} />
        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center font-mono text-[10px] shrink-0 border-accents-3" style={{ color: s.d }}>
          {s.l}
        </Badge>
        <span className="text-xs font-bold text-accents-5 uppercase tracking-wider">
          {section.type}
        </span>
        <span className="text-[10px] text-accents-3 italic font-mono uppercase">
          (COLLAPSED)
        </span>
        {section.note && (
          <span className="text-[10px] text-accents-4 italic ml-auto max-w-[40%] text-right truncate">
            {section.note}
          </span>
        )}
      </div>
    );
  }

  const isDrummer = displayRole === 'drummer';
  const isVocalist = displayRole === 'vocalist';
  const lineCount = isDrummer ? section.lines.filter(l => typeof l === 'string' && l.trim()).length : 0;

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
        return <div key={i} className="my-4"><TabBlock data={line} /></div>;
      }
      if (!line.trim()) return <div key={i} className="h-2" />;

      const { clean, notes } = extractInlineNotes(line);
      const effectiveTranspose = transpose + modulateOffset + runningMod;
      const parts = parseLine(clean);
      const hasChords = parts.some(p => p.chord);
      const hasNotes = showInlineNotes && notes.length > 0;

      if (isVocalist) {
        const lyricsText = parts.map(p => p.text).join('');
        return (
          <div key={i} className="flex items-end text-base text-foreground leading-[22px] mb-1">
            <span className="whitespace-pre-wrap">{lyricsText || clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      if (!hasChords) {
        return (
          <div key={i} className="flex items-end text-base text-foreground leading-[22px] mb-1">
            <span className="whitespace-pre-wrap">{clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      return (
        <div key={i} className="flex items-end mb-1 leading-none">
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
    <div className="rounded-geist border border-accents-2 bg-background p-4 relative shadow-sm overflow-hidden group">
      {/* Left accent bar */}
      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: s.b }} />

      {/* Section header */}
      <div className={cn(
        "flex items-center gap-3",
        (!isDrummer && section.lines.length) ? "mb-4" : ""
      )}>
        <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center font-mono text-xs font-bold shrink-0 border-accents-2" style={{ color: s.d, backgroundColor: `${s.b}10` }}>
          {s.l}
        </Badge>
        <span className="text-sm font-bold text-foreground uppercase tracking-tight">
          {section.type}
        </span>
        {isDrummer && lineCount > 0 && (
          <span className="text-[10px] font-bold text-accents-3 uppercase font-mono tracking-widest">
            {lineCount} LINES
          </span>
        )}
        {section.note && (
          <span className={cn(
            "text-xs italic ml-auto max-w-[50%] text-right leading-tight",
            isDrummer ? "text-accents-5 font-semibold" : "text-accents-4"
          )}>
            {section.note}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="pl-10">
        {renderLines()}
      </div>
    </div>
  );
}
