import { transposeChord, sectionStyle } from '../music';
import { parseLine, extractInlineNotes } from '../parser';
import TabBlock from './TabBlock';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

function ChordToken({ chord, text, transpose, role }) {
  const transposed = chord ? transposeChord(chord, transpose) : '';
  const showChords = !['vocalist', 'drummer'].includes(role);
  const showLyrics = role !== 'drummer';

  return (
    <span className="inline-block align-top mr-0.5">
      {showChords && (
        <span className="block font-mono font-black text-sm text-geist-link h-[18px] leading-[18px] whitespace-pre tracking-tight transition-all">
          {transposed || '\u00A0'}
        </span>
      )}
      {showLyrics && (
        <span className={cn(
          "block font-sans leading-[24px] whitespace-pre transition-all",
          role === 'vocalist' ? "text-lg font-medium" : "text-base font-normal text-foreground"
        )}>
          {text || '\u00A0'}
        </span>
      )}
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
        <span className={cn(leaderClasses[leaderStyle], "border-t-[1px] opacity-30")} />
      )}
      {leaderStyle === 'arrow' && (
        <span className="self-center text-accents-3 text-[10px] mr-2">&#9656;</span>
      )}
      <span className="text-[10px] italic whitespace-nowrap text-accents-4 font-black uppercase tracking-wider leading-[18px]">
        {notes.join(' · ')}
      </span>
    </span>
  );
}

function ModulateBadge({ semitones }) {
  const sign = semitones > 0 ? '+' : '';
  return (
    <div className="flex items-center gap-2 my-4 py-3 border-y border-dashed border-accents-2 bg-accents-1/20 px-4 rounded-xl">
      <Badge variant="success" className="font-mono text-[9px] h-5 px-2 font-black tracking-widest bg-foreground text-background border-none">
        MODULATE {sign}{semitones}
      </Badge>
      <span className="text-[10px] font-black text-accents-4 uppercase tracking-[0.2em] font-mono">Transition Event</span>
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
        className="rounded-2xl border border-accents-2 bg-accents-1/10 p-4 mb-4 relative opacity-60 flex items-center gap-4 group hover:opacity-100 transition-all cursor-default shadow-sm"
      >
        <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl transition-all group-hover:w-2" style={{ background: s.b }} />
        <Badge variant="outline" className="w-8 h-8 p-0 flex items-center justify-center font-mono text-[11px] font-black shrink-0 border-accents-2 bg-background shadow-sm" style={{ color: s.d }}>
          {s.l}
        </Badge>
        <span className="text-sm font-black text-foreground uppercase tracking-tight">
          {section.type}
        </span>
        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-accents-4 border-accents-2 h-5">REPEATED</Badge>
        {section.note && (
          <span className="text-xs text-accents-4 italic ml-auto max-w-[40%] text-right font-medium truncate">
            {section.note}
          </span>
        )}
      </div>
    );
  }

  const isDrummer = displayRole === 'drummer';
  const showTabs = ['leader', 'guitar', 'bass'].includes(displayRole);

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
        return showTabs ? <div key={i} className="my-6 scale-[1.02] origin-left"><TabBlock data={line} /></div> : null;
      }
      if (!line.trim()) return <div key={i} className="h-4" />;

      const { clean, notes } = extractInlineNotes(line);
      const effectiveTranspose = transpose + modulateOffset + runningMod;
      const parts = parseLine(clean);
      const hasChords = parts.some(p => p.chord);
      const hasNotes = showInlineNotes && notes.length > 0;

      if (!hasChords || displayRole === 'vocalist') {
        const lyricsText = parts.map(p => p.text).join('');
        return (
          <div key={i} className="flex items-end mb-1 transition-all group/line">
            <span className={cn(
              "whitespace-pre-wrap transition-colors",
              displayRole === 'vocalist' ? "text-xl font-medium" : "text-base text-foreground font-normal"
            )}>
              {lyricsText || clean}
            </span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      return (
        <div key={i} className="flex items-end mb-1 leading-none group/line">
          <span className="whitespace-pre-wrap">
            {parts.map((p, j) => (
              <ChordToken key={j} chord={p.chord} text={p.text} transpose={effectiveTranspose} role={displayRole} />
            ))}
          </span>
          {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
        </div>
      );
    });
  };

  return (
    <div className="rounded-2xl border border-accents-2 bg-background p-6 relative shadow-geist-sm transition-all hover:shadow-geist overflow-hidden">
      {/* Dynamic Left Bar */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 transition-all group-hover:w-2 shadow-[2px_0_10px_rgba(0,0,0,0.05)]" style={{ background: s.b }} />

      {/* Header Section */}
      <div className={cn(
        "flex items-center gap-4",
        (!isDrummer && section.lines.length) ? "mb-6" : ""
      )}>
        <Badge variant="outline" className="w-10 h-10 p-0 flex items-center justify-center font-mono text-sm font-black shrink-0 border-2 border-accents-2 shadow-sm transition-transform hover:rotate-6" style={{ color: s.d, backgroundColor: `${s.b}08` }}>
          {s.l}
        </Badge>
        <div className="flex flex-col">
          <span className="text-xs font-black text-accents-4 uppercase tracking-[0.2em] font-mono leading-none mb-1">
             Phase Segment
          </span>
          <span className="text-lg font-black text-foreground uppercase tracking-tight leading-none italic">
            {section.type}
          </span>
        </div>

        {section.note && (
          <div className="ml-auto flex flex-col items-end">
             <span className="text-[9px] font-black text-accents-3 uppercase tracking-widest font-mono mb-1">DYNAMIC CUE</span>
             <span className={cn(
               "text-xs font-bold leading-tight uppercase tracking-tight italic",
               isDrummer ? "text-geist-link font-black" : "text-accents-5"
             )}>
               {section.note}
             </span>
          </div>
        )}
      </div>

      {/* Primary Execution Content */}
      <div className={cn(
        "transition-all duration-500",
        displayRole === 'vocalist' ? "pl-0" : "pl-14"
      )}>
        {renderLines()}
      </div>
    </div>
  );
}
