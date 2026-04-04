import { useState, useMemo, useEffect, useRef } from 'react';
import { transposeKey, transposeChord, ALL_KEYS, semitonesBetween } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';
import ChordDiagram from './ChordDiagram';
import { parseLine } from '../parser';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

const SIZE_MAP = { S: 0.88, M: 1, L: 1.14 };

export default function ChartView({
  song, onBack, onEdit, navOverride, compact, forceTranspose,
  capo = 0, defaultColumns, defaultFontSize, showInlineNotes = true,
  inlineNoteStyle = 'dashes', displayRole = 'leader', duplicateSections = 'full'
}) {
  const [localTranspose, setLocalTranspose] = useState(0);
  const [cols, setCols] = useState(defaultColumns || 'auto');
  const [size, setSize] = useState(SIZE_MAP[defaultFontSize] || 1);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  const transpose = forceTranspose != null ? forceTranspose : localTranspose;
  const chordTranspose = capo ? (transpose - capo + 12) % 12 : transpose;
  const currentKey = transposeKey(song.key, transpose);

  // Track scroll to collapse header
  useEffect(() => {
    if (compact) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [compact]);
 
  // Pre-compute cumulative modulate offsets per section
  const sectionModOffsets = useMemo(() => {
    const offsets = [];
    const acc = { total: 0 };
    for (const sec of song.sections) {
      offsets.push(acc.total);
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          acc.total += line.semitones;
        }
      }
    }
    return offsets;
  }, [song.sections]);

  // Compute which sections are collapsed
  const collapsedSections = useMemo(() => {
    if (duplicateSections !== 'first') return [];
    const seen = new Set();
    return song.sections.map(sec => {
      const baseType = sec.type.replace(/\s*\d+$/, '').trim();
      if (seen.has(baseType)) return true;
      seen.add(baseType);
      return false;
    });
  }, [song.sections, duplicateSections]);

  // Collect unique chords
  const uniqueChords = useMemo(() => {
    if (!showDiagrams) return [];
    const seen = new Set();
    for (let si = 0; si < song.sections.length; si++) {
      const sec = song.sections[si];
      let runningMod = sectionModOffsets[si] || 0;
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          runningMod += line.semitones;
          continue;
        }
        if (typeof line !== 'string') continue;
        const parts = parseLine(line);
        for (const p of parts) {
          if (p.chord) {
            const transposed = transposeChord(p.chord, chordTranspose + runningMod);
            seen.add(transposed);
          }
        }
      }
    }
    return [...seen];
  }, [showDiagrams, song.sections, chordTranspose, sectionModOffsets]);

  const isExplicit2Col = cols === 2;
  const mid = (isExplicit2Col || cols === 'auto')
    ? Math.ceil(song.sections.length / 2)
    : song.sections.length;

  const handleKeyChange = (newKey) => {
    const semitones = semitonesBetween(song.key, newKey);
    setLocalTranspose(semitones);
  };

  return (
    <div className={cn(
      "bg-background",
      compact ? "min-h-auto" : "min-h-screen pt-[env(safe-area-inset-top,0px)]"
    )}>
      {/* Sticky header */}
      <div ref={headerRef} className={cn(
        "sticky top-0 z-[100] bg-background/80 backdrop-blur-md border-b border-accents-2 transition-all duration-150",
        compact ? "px-6 pt-3 pb-2" : "px-6 pt-4 pb-3"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!compact && (
              <button onClick={onBack} className="p-2 -ml-2 text-accents-4 hover:text-foreground">
                &#8592;
              </button>
            )}
            <div className="min-w-0">
              <h1 className={cn(
                "font-bold text-foreground tracking-tight transition-all truncate",
                compact ? "text-lg" : (scrolled ? "text-base" : "text-xl")
              )}>
                {song.title}
              </h1>
              {!compact && !scrolled && (
                <div className="text-xs text-accents-5 mt-0.5 truncate flex items-center gap-1.5">
                  <span className="font-semibold">{song.artist}</span>
                  {song.tempo && (
                    <>
                      <span className="text-accents-3">&middot;</span>
                      <span className="font-mono bg-accents-1 px-1 rounded border border-accents-2">{song.tempo} BPM</span>
                    </>
                  )}
                  {song.time && (
                    <>
                      <span className="text-accents-3">&middot;</span>
                      <span className="font-mono">{song.time}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {!compact && (
            <div className="flex items-center gap-2 shrink-0">
              {/* Key selector */}
              <div className="relative">
                <select
                  value={currentKey}
                  onChange={e => handleKeyChange(e.target.value)}
                  className={cn(
                    "h-9 px-3 pr-8 rounded-geist border text-xs font-mono font-bold appearance-none bg-background cursor-pointer transition-colors",
                    transpose !== 0 ? "border-geist-link text-geist-link" : "border-accents-2 text-foreground"
                  )}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                  }}
                >
                  {ALL_KEYS.map(k => (
                    <option key={k} value={k}>{k}{k === song.key ? ' (Original)' : ''}</option>
                  ))}
                </select>
              </div>

              <Button
                variant={showDiagrams ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowDiagrams(v => !v)}
                className="h-9 px-3 text-[11px] font-bold tracking-tight"
              >
                DIAGRAMS
              </Button>

              {!scrolled && onEdit && (
                <Button variant="secondary" size="sm" onClick={onEdit} className="h-9 px-3 text-[11px] font-bold tracking-tight">
                  EDIT
                </Button>
              )}

              <Button
                variant={showSettings ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowSettings(v => !v)}
                className="h-9 w-9 p-0 font-bold"
              >
                Aa
              </Button>
            </div>
          )}
          {compact && navOverride && <div>{navOverride}</div>}
        </div>
         
        <StructureRibbon structure={song.structure || []} compact />

        {/* Aa settings popover */}
        {showSettings && !compact && !scrolled && (
          <div className="mt-3 pt-3 border-t border-accents-2 flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-accents-4 uppercase tracking-wider font-mono">Layout</span>
              <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2">
                {['auto', 1, 2].map(n => (
                  <button
                    key={n}
                    onClick={() => setCols(n)}
                    className={cn(
                      "px-2.5 py-0.5 text-[10px] font-bold uppercase rounded transition-all",
                      cols === n ? "bg-background shadow-sm text-foreground" : "text-accents-4 hover:text-accents-6"
                    )}
                  >
                    {n === 'auto' ? 'Auto' : `${n} Col`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-accents-4 uppercase tracking-wider font-mono">Size</span>
              <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2">
                {[{ l: 'S', v: 0.88 }, { l: 'M', v: 1 }, { l: 'L', v: 1.14 }].map(({ l, v }) => (
                  <button
                    key={l}
                    onClick={() => setSize(v)}
                    className={cn(
                      "px-2.5 py-0.5 text-[10px] font-bold uppercase rounded transition-all",
                      size === v ? "bg-background shadow-sm text-foreground" : "text-accents-4 hover:text-accents-6"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chord diagram strip */}
        {showDiagrams && uniqueChords.length > 0 && (
          <div className="mt-3 pt-3 border-t border-accents-2 flex gap-3 overflow-x-auto hide-scrollbar animate-in fade-in slide-in-from-top-1">
            {uniqueChords.map(chord => (
              <div key={chord} className="bg-accents-1 rounded-geist p-1 border border-accents-2 shrink-0">
                <ChordDiagram chord={chord} size={80} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart body */}
      <div
        className={cn(
          "p-6 pb-20",
          cols === 'auto' ? "chart-auto-cols" : "grid gap-8",
          cols === 1 && "grid-cols-1",
          cols === 2 && "grid-cols-2"
        )}
        style={{
          transform: `scale(${size})`, transformOrigin: 'top left',
          width: size !== 1 ? `${100 / size}%` : '100%',
        }}
      >
        <div className="space-y-6">
          {song.sections.slice(0, mid).map((sec, i) => (
            <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[i]} />
          ))}
        </div>
        {(isExplicit2Col || cols === 'auto') && (
          <div className="space-y-6">
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[mid + i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[mid + i]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
