import { useState, useEffect, useRef } from 'react';
import { transposeChord, sectionStyle, getNashvilleNumber } from '../music';
import SectionBlock from './SectionBlock';
import TabBlock from './TabBlock';
import ChordDiagram from './ChordDiagram';
import PageHeader from './PageHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { StructureRibbon, MetaPill } from './StructureRibbon';

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
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleTranspose = (dir) => setTranspose(prev => prev + dir);
  const displayKey = transpose === 0 ? song.key : transposeChord(song.key, transpose);

  // Extract all unique chords for diagrams
  const allChords = Array.from(new Set(
    song.sections.flatMap(s => s.lines)
      .filter(l => typeof l === 'string')
      .flatMap(l => {
        const matches = l.match(/\[(.*?)\]/g);
        return matches ? matches.map(m => m.slice(1, -1)) : [];
      })
  ));

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-[var(--ds-background-200)]",
      isPreview && "min-h-0 bg-transparent"
    )}>
      {!isPreview && (
        <PageHeader title={song.title} className="bg-[var(--ds-background-200)]/90 backdrop-blur-md">
          <div className="flex gap-1.5 items-center">
            <div className="flex bg-[var(--bg-1)] border border-[var(--border-1)] rounded-md p-0.5">
              <Button variant="ghost" size="sm" className="px-2 h-7" onClick={() => handleTranspose(-1)}>-</Button>
              <span className="px-2 text-xs font-mono font-bold flex items-center min-w-[30px] justify-center">{transpose > 0 ? `+${transpose}` : transpose}</span>
              <Button variant="ghost" size="sm" className="px-2 h-7" onClick={() => handleTranspose(1)}>+</Button>
            </div>
            <Button variant="secondary" size="sm" onClick={onEdit} className="w-9 px-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </Button>
            <Button variant="secondary" size="sm" onClick={onBack} className="w-9 px-0" aria-label="Close chart">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </Button>
          </div>
        </PageHeader>
      )}

      <div className={cn(
        "flex-1 px-6 pt-2 pb-24 max-w-[1600px] mx-auto w-full",
        isPreview && "px-0 pt-0 pb-0"
      )}>
        <div className="mb-8 flex flex-col gap-6">
          {/* Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-1)] pb-6">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--text-2)]">{song.artist}</div>
              <div className="flex gap-3">
                <MetaPill label="Key" value={displayKey} />
                {song.tempo && <MetaPill label="Tempo" value={`${song.tempo} BPM`} />}
                {song.time && <MetaPill label="Time" value={song.time} />}
              </div>
            </div>

            {!isPreview && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn("text-[12px] font-bold px-3", showSettings && "bg-[var(--bg-2)]")}
                >Aa</Button>
                {showSettings && (
                  <>
                    <div className="flex bg-[var(--bg-1)] border border-[var(--border-1)] rounded-md p-0.5">
                       <button
                        onClick={() => setColumns(1)}
                        className={cn("px-2 py-1 text-[10px] font-bold rounded-sm transition-all", columns === 1 ? "bg-[var(--ds-background-200)] text-brand shadow-sm" : "text-[var(--text-2)]")}
                       >1 COL</button>
                       <button
                        onClick={() => setColumns(2)}
                        className={cn("px-2 py-1 text-[10px] font-bold rounded-sm transition-all", columns === 2 ? "bg-[var(--ds-background-200)] text-brand shadow-sm" : "text-[var(--text-2)]")}
                       >2 COL</button>
                    </div>
                    <div className="bg-[var(--bg-1)] border border-[var(--border-1)] rounded-md p-0.5 flex">
                      <button onClick={() => setFontSize(prev => Math.max(10, prev-2))} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-2)] rounded transition-colors">-</button>
                      <span className="px-2 py-1 text-[10px] font-mono font-bold flex items-center">{fontSize}PX</span>
                      <button onClick={() => setFontSize(prev => Math.min(30, prev+2))} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-2)] rounded transition-colors">+</button>
                    </div>
                  </>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setNns(!nns)}
                  className={cn("text-[10px] font-bold px-2", nns && "border-brand text-brand bg-brand/5")}
                >NNS</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowChords(!showChords)}
                  className={cn("text-[10px] font-bold px-2", !showChords && "opacity-40")}
                >CHORDS</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDiagrams(!showDiagrams)}
                  className={cn("text-[10px] font-bold px-2", showDiagrams && "border-brand text-brand bg-brand/5")}
                >DIAGRAMS</Button>
              </div>
            )}
          </div>

          {/* Structure Ribbon */}
          {!isPreview && (
            <StructureRibbon
              structure={song.sections.map(s => s.type)}
              onSelect={(i) => {
                const el = document.getElementById(`section-${i}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          )}
        </div>

        {/* Chord Diagrams Strip */}
        {showDiagrams && !isPreview && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 mb-8 border-b border-[var(--border-1)]">
            {allChords.map(chord => (
              <div key={chord} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="text-[10px] font-mono font-bold text-[var(--text-2)]">{transposeChord(chord, transpose)}</div>
                <Card className="w-24 h-28 flex items-center justify-center p-2">
                   <ChordDiagram chord={transposeChord(chord, transpose)} />
                </Card>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "grid gap-x-16 gap-y-4",
            columns === 2 ? "lg:grid-cols-2" : "grid-cols-1"
          )}
          style={{ fontSize }}
        >
          {song.sections.map((section, idx) => (
            <div key={section.id || idx} id={`section-${idx}`}>
              <SectionBlock
                section={section}
                transpose={transpose}
                nns={nns}
                songKey={song.key}
                showChords={showChords}
                inlineNotes={showInlineNotes}
                noteStyle={inlineNoteStyle}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
