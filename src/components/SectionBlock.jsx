import { useMemo } from 'react';
import { transposeChord, sectionStyle, getNashvilleNumber } from '../music';
import TabBlock from './TabBlock';

const NOTE_SEPARATORS = {
  dashes: ' ---- ',
  dots:   ' ...... ',
  arrow:  ' ----> ',
};

export default function SectionBlock({
  section, transpose, modOffset = 0, nns, songKey,
  showChords = true, inlineNotes = true, noteStyle = 'dashes'
}) {
  const s = sectionStyle(section.type);

  // Pre-compute per-line modulate offsets (cumulative within this section)
  const lineOffsets = useMemo(() => {
    const acc = { running: modOffset };
    return (section.lines || []).map(line => {
      if (typeof line === 'object' && line.type === 'modulate') {
        acc.running += line.semitones;
      }
      return acc.running;
    });
  }, [section.lines, modOffset]);

  // Strip trailing colon from section type for display (demos may include it)
  const sectionLabel = section.type.replace(/:+$/, '');

  const renderLine = (line, idx) => {
    if (typeof line !== 'string') {
      if (line.type === 'tab') return <TabBlock key={idx} data={line} />;
      if (line.type === 'modulate') {
        return (
          <div key={idx} className="my-6 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-[var(--color-brand-border)]" />
            <span className="text-label-10 font-black uppercase tracking-[0.2em] px-3 py-1 bg-[var(--color-brand)] text-white rounded-full shadow-sm">
              Key Change: {line.semitones > 0 ? '+' : ''}{line.semitones}
            </span>
            <div className="h-[1px] flex-1 bg-[var(--color-brand-border)]" />
          </div>
        );
      }
      return null;
    }

    const effectiveTranspose = transpose + lineOffsets[idx];

    // Extract inline notes {!...}
    const noteMatch = line.match(/\{!(.*?)\}/);
    const inlineNote = noteMatch ? noteMatch[1] : null;
    const cleanLine = line.replace(/\{!.*?\}/g, '');

    const parts = cleanLine.split(/(\[.*?\])/);

    if (!cleanLine.includes('[') || !showChords) {
      const displayLine = !showChords ? cleanLine.replace(/\[.*?\]/g, '') : cleanLine;
      return (
        <div key={idx} className="min-h-[1.5em] whitespace-pre-wrap text-[var(--text-1)] opacity-90">
          {displayLine}
          {inlineNotes && inlineNote && (
            <span className="text-[var(--text-2)] italic text-[0.8em]">
              {NOTE_SEPARATORS[noteStyle] || NOTE_SEPARATORS.dashes}{inlineNote}
            </span>
          )}
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
          : transposeChord(chord, effectiveTranspose);

        const padding = Math.max(0, lyricLine.length - chordLine.length);
        chordLine += ' '.repeat(padding) + displayChord;
      } else {
        lyricLine += part;
      }
    });

    return (
      <div key={idx} className="mb-4 last:mb-0 overflow-x-auto">
        <div className="font-bold text-[var(--chord)] whitespace-pre text-[0.95em] leading-none mb-1 select-none">
          {chordLine || ' '}
        </div>
        <div className="text-[var(--text-1)] whitespace-pre leading-tight">
          {lyricLine || ' '}
          {inlineNotes && inlineNote && (
            <span className="text-[var(--text-2)] italic text-[0.8em]">
              {NOTE_SEPARATORS[noteStyle] || NOTE_SEPARATORS.dashes}{inlineNote}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8 md:mb-12 break-inside-avoid">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-label-14 font-black uppercase tracking-[0.15em]" style={{ color: s.b }}>
            {sectionLabel}:
          </span>
          {section.note && (
            <span className="text-label-11 italic text-[var(--text-2)] mt-1 px-1 ml-0.5 border-l-2" style={{ borderColor: s.br }}>
              {section.note}
            </span>
          )}
        </div>
        <div className="h-[1px] flex-1 bg-[var(--ds-gray-400)] opacity-20" />
      </div>
      <div className="space-y-1">
        {(section.lines || []).map((line, i) => renderLine(line, i))}
      </div>
    </div>
  );
}
