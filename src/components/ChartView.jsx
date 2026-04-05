import { useState, useEffect, useRef } from 'react';
import { transposeChord, sectionStyle, getNashvilleNumber } from '../music';
import SectionBlock from './SectionBlock';
import TabBlock from './TabBlock';
import ChordDiagram from './ChordDiagram';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import { cn } from '../lib/utils';

export default function ChartView({
  song, onBack, onEdit, isPreview,
  defaultColumns = 1, defaultFontSize = 14,
  showInlineNotes = true, inlineNoteStyle = 'dashes',
  displayRole = 'leader', duplicateSections = 'full'
}) {
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(defaultColumns);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [nns, setNns] = useState(false);
  const [showChords, setShowChords] = useState(true);

  const containerRef = useRef(null);

  // Auto-scroll logic if needed
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollRef = useRef(null);

  const handleTranspose = (dir) => setTranspose(prev => prev + dir);

  const displayKey = transpose === 0 ? song.key : transposeChord(song.key, transpose);

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-[var(--geist-background)]",
      isPreview && "min-h-0 bg-transparent"
    )}>
      {!isPreview && (
        <PageHeader title={song.title} className="bg-[var(--geist-background)]/90 backdrop-blur-md">
          <div className="flex gap-1.5 items-center">
            <Button variant="secondary" size="sm" onClick={() => setTranspose(0)} disabled={transpose === 0}>0</Button>
            <div className="flex bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-button p-0.5">
              <Button variant="ghost" size="sm" className="px-2 h-7" onClick={() => handleTranspose(-1)}>-</Button>
              <span className="px-2 text-xs font-mono font-bold flex items-center min-w-[30px] justify-center">{transpose > 0 ? `+${transpose}` : transpose}</span>
              <Button variant="ghost" size="sm" className="px-2 h-7" onClick={() => handleTranspose(1)}>+</Button>
            </div>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </Button>
            <Button variant="secondary" size="sm" onClick={onBack}>&times;</Button>
          </div>
        </PageHeader>
      )}

      <div className={cn(
        "flex-1 px-6 pt-2 pb-20 max-w-7xl mx-auto w-full",
        isPreview && "px-0 pt-0 pb-0"
      )}>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--geist-border)] pb-6">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--accents-5)]">{song.artist}</div>
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Key</span>
                <span className="font-mono text-lg font-bold text-brand">{displayKey}</span>
              </div>
              {song.tempo && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Tempo</span>
                  <span className="font-mono text-lg font-bold text-[var(--accents-8)]">{song.tempo} <span className="text-[10px] opacity-40 font-normal">BPM</span></span>
                </div>
              )}
              {song.time && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Time</span>
                  <span className="font-mono text-lg font-bold text-[var(--accents-8)]">{song.time}</span>
                </div>
              )}
            </div>
          </div>

          {!isPreview && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setNns(!nns)} className={cn(nns && "bg-[var(--accents-2)] border-brand text-brand")}>NNS</Button>
              <Button variant="secondary" size="sm" onClick={() => setShowChords(!showChords)} className={cn(!showChords && "opacity-50")}>Chords</Button>
              <div className="bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-button p-0.5 flex">
                <button onClick={() => setFontSize(prev => Math.max(10, prev-2))} className="px-2 py-1 text-xs hover:bg-[var(--accents-2)] rounded transition-colors">-</button>
                <span className="px-2 py-1 text-[10px] font-mono font-bold flex items-center">{fontSize}px</span>
                <button onClick={() => setFontSize(prev => Math.min(30, prev+2))} className="px-2 py-1 text-xs hover:bg-[var(--accents-2)] rounded transition-colors">+</button>
              </div>
            </div>
          )}
        </div>

        <div
          className="chart-auto-cols gap-x-12 gap-y-8"
          style={{
            fontSize,
            gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : '1fr',
            lineHeight: 1.6
          }}
        >
          {song.sections.map((section, idx) => (
            <SectionBlock
              key={section.id || idx}
              section={section}
              transpose={transpose}
              nns={nns}
              songKey={song.key}
              showChords={showChords}
              inlineNotes={showInlineNotes}
              noteStyle={inlineNoteStyle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
