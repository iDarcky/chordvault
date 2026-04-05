import { transposeChord, sectionStyle, getNashvilleNumber } from '../music';
import { cn } from '../lib/utils';
import TabBlock from './TabBlock';

export default function SectionBlock({
  section, transpose, nns, songKey,
  showChords = true, inlineNotes = true, noteStyle = 'dashes'
}) {
  const s = sectionStyle(section.type);

  const renderLine = (line, idx) => {
    if (typeof line !== 'string') {
      if (line.type === 'tab') return <TabBlock key={idx} data={line} />;
      if (line.type === 'modulate') {
        return (
          <div key={idx} className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-brand/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-brand text-white rounded-full shadow-sm">
              Key Change: {line.semitones > 0 ? '+' : ''}{line.semitones}
            </span>
            <div className="h-[1px] flex-1 bg-brand/20" />
          </div>
        );
      }
      return null;
    }

    const parts = line.split(/(\[.*?\])/);

    if (!line.includes('[') || !showChords) {
      return (
        <div key={idx} className="min-h-[1.5em] whitespace-pre-wrap text-[var(--geist-foreground)] font-mono opacity-90">
          {line.replace(/\{!.*?\}/g, '')}
        </div>
      );
    }

    let chordLine = '';
    let lyricLine = '';

    parts.forEach(part => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const chord = part.slice(1, -1);
        const displayChord = nns
          ? getNashvilleNumber(chord, songKey)
          : transposeChord(chord, transpose);

        const padding = Math.max(0, lyricLine.length - chordLine.length);
        chordLine += ' '.repeat(padding) + displayChord;
      } else {
        const cleanText = part.replace(/\{!.*?\}/g, '');
        lyricLine += cleanText;
      }
    });

    return (
      <div key={idx} className="mb-4 last:mb-0 group/line">
        <div className="font-mono font-bold text-[var(--chord)] whitespace-pre text-[0.95em] leading-none mb-1 select-none">
          {chordLine || ' '}
        </div>
        <div className="text-[var(--geist-foreground)] font-mono whitespace-pre-wrap leading-tight">
          {lyricLine || ' '}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-12 break-inside-avoid">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand">
            {section.type}
          </span>
          {section.note && (
            <span className="text-[10px] font-bold italic text-[var(--accents-4)] mt-1 px-1 border-l-2 border-brand/20 ml-0.5">
              {section.note}
            </span>
          )}
        </div>
        <div className="h-[1px] flex-1 bg-[var(--geist-border)] opacity-20" />
      </div>
      <div className="space-y-1">
        {(section.lines || []).map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
}
