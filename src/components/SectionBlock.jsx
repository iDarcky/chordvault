import React from 'react';
import { Card, CardContent, Chip } from "@heroui/react";
import { transposeChord, sectionStyle } from '../music';
import { parseLine, extractInlineNotes } from '../parser';
import TabBlock from './TabBlock';

function ChordToken({ chord, text, transpose }) {
  const transposed = chord ? transposeChord(chord, transpose) : '';
  return (
    <span className="inline-block align-top mr-0.5">
      <span className="block font-mono font-bold text-[13px] text-warning h-[19px] leading-[19px] whitespace-pre tracking-tight">
        {transposed || '\u00A0'}
      </span>
      <span className="block font-sans text-[15px] text-foreground leading-[21px] whitespace-pre">
        {text || '\u00A0'}
      </span>
    </span>
  );
}

const LEADER_STYLES = {
  none: { border: 'none' },
  dashes: { backgroundImage: 'repeating-linear-gradient(to right, var(--text-dim) 0px, var(--text-dim) 8px, transparent 8px, transparent 14px)', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' },
  dots: { backgroundImage: 'radial-gradient(circle, var(--text-dim) 1px, transparent 1px)', backgroundSize: '6px 3px', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' },
  arrow: { backgroundImage: 'repeating-linear-gradient(to right, var(--text-dim) 0px, var(--text-dim) 8px, transparent 8px, transparent 14px)', backgroundRepeat: 'repeat-x', backgroundPosition: 'center', arrow: true },
};

function InlineNoteTag({ notes, leaderStyle = 'dashes' }) {
  const style = LEADER_STYLES[leaderStyle] || LEADER_STYLES.dashes;
  return (
    <span className="inline-flex items-end flex-1 min-w-[40px] ml-1.5">
      {leaderStyle !== 'none' && (
        <span
          className="flex-1 self-center h-[2px] min-w-[20px] mr-1.5"
          style={{
            ...style,
            marginRight: style.arrow ? 0 : 6,
          }}
        />
      )}
      {leaderStyle === 'none' && <span className="flex-1" />}
      {style.arrow && (
        <span className="self-center text-default-300 text-[9px] leading-none mr-1.5">▶</span>
      )}
      <span className="text-[10px] font-bold italic whitespace-nowrap text-warning opacity-80 font-sans leading-[19px] uppercase tracking-wider">
        {notes.join(' · ')}
      </span>
    </span>
  );
}

function ModulateBadge({ semitones }) {
  const sign = semitones > 0 ? '+' : '';
  return (
    <div className="flex items-center gap-2 my-2 py-1.5 border-y border-dashed border-primary/30">
      <Chip size="sm" variant="flat" color="primary" className="font-mono font-bold text-[10px]">
        KEY CHANGE: {sign}{semitones}
      </Chip>
    </div>
  );
}

export default function SectionBlock({ section, transpose = 0, modulateOffset = 0, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', collapsed = false }) {
  const s = sectionStyle(section.type);
  const colorKey = s.b === '#53796F' ? 'primary' : 'default';

  if (collapsed) {
    return (
      <Card shadow="none" className={`bg-${colorKey}/5 border border-${colorKey}/20 mb-3 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${colorKey}`} />
        <CardContent className="py-2.5 px-4 flex flex-row items-center gap-2">
          <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-${colorKey}/40 text-${colorKey} text-[9px] font-bold font-mono flex-shrink-0`}>
            {s.l}
          </span>
          <span className="text-xs font-bold text-foreground">
            {section.type}
          </span>
          <span className="text-[10px] text-default-400 italic">
            (see above)
          </span>
          {section.note && (
            <span className="text-[10px] text-primary font-medium italic ml-auto max-w-[45%] text-right truncate">
              {section.note}
            </span>
          )}
        </CardContent>
      </Card>
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
        return <TabBlock key={i} data={line} />;
      }
      if (!line.trim()) return <div key={i} className="h-1.5" />;

      const { clean, notes } = extractInlineNotes(line);
      const effectiveTranspose = transpose + modulateOffset + runningMod;
      const parts = parseLine(clean);
      const hasChords = parts.some(p => p.chord);
      const hasNotes = showInlineNotes && notes.length > 0;

      if (isVocalist) {
        const lyricsText = parts.map(p => p.text).join('');
        return (
          <div key={i} className={`${hasNotes ? 'flex' : 'block'} items-end text-[15px] text-foreground leading-[21px] mb-0.5`}>
            <span className="whitespace-pre-wrap">{lyricsText || clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      if (!hasChords) {
        return (
          <div key={i} className={`${hasNotes ? 'flex' : 'block'} items-end text-[15px] text-foreground leading-[21px] mb-0.5`}>
            <span className="whitespace-pre-wrap">{clean}</span>
            {hasNotes && <InlineNoteTag notes={notes} leaderStyle={inlineNoteStyle} />}
          </div>
        );
      }

      return (
        <div key={i} className="flex items-end mb-0.5 leading-none">
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
    <Card shadow="none" className={`bg-content1/50 border border-divider mb-4 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${colorKey}`} />

      <CardContent className="p-4">
        <header className={`flex items-center gap-2 ${(!isDrummer && section.lines.length) ? 'mb-3' : ''}`}>
          <span className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-${colorKey}/40 text-${colorKey} text-[10px] font-bold font-mono flex-shrink-0`}>
            {s.l}
          </span>
          <span className="text-[13px] font-black uppercase tracking-widest text-foreground">
            {section.type}
          </span>
          {isDrummer && lineCount > 0 && (
            <Chip size="xs" variant="flat" className="font-mono font-bold h-4 text-[9px] text-default-400">
              {lineCount} LINES
            </Chip>
          )}
          {section.note && (
            <span className={`text-[11px] font-medium italic ml-auto ${isDrummer ? 'text-foreground' : 'text-primary'} max-w-[50%] text-right leading-tight`}>
              {section.note}
            </span>
          )}
        </header>

        <div className="pl-9">
          {renderLines()}
        </div>
      </CardContent>
    </Card>
  );
}
