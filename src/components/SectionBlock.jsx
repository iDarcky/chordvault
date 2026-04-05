import { transposeChord, sectionStyle, getNashvilleNumber } from '../music';
import { cn } from '../lib/utils';

export default function SectionBlock({
  section, transpose, nns, songKey,
  showChords = true, inlineNotes = true, noteStyle = 'dashes'
}) {
  const s = sectionStyle(section.type);

  const renderContent = () => {
    const lines = section.content.split('\n');
    return lines.map((line, i) => {
      // Process chords in the line [C] or [C/E]
      const parts = line.split(/(\[.*?\])/);
      return (
        <div key={i} className="min-h-[1.5em] whitespace-pre-wrap">
          {parts.map((part, pi) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const chord = part.slice(1, -1);
              if (!showChords) return null;

              const displayChord = nns
                ? getNashvilleNumber(chord, songKey)
                : transposeChord(chord, transpose);

              return (
                <span key={pi} className="font-mono font-bold text-[var(--chord)] bg-[var(--accents-1)]/50 px-1 rounded-sm border border-[var(--geist-border)]/20 shadow-sm relative -top-1">
                  {displayChord}
                </span>
              );
            }
            return <span key={pi} className="text-[var(--geist-foreground)]">{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="mb-8 break-inside-avoid">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] py-1 px-2.5 rounded bg-[var(--accents-1)] border border-[var(--geist-border)] text-brand shadow-sm">
          {section.type}
        </span>
        <div className="h-[1px] flex-1 bg-[var(--geist-border)] opacity-50" />
      </div>
      <div className="space-y-1 pl-1">
        {renderContent()}
      </div>
    </div>
  );
}
