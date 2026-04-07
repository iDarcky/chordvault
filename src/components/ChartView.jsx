import { useState, useMemo, useEffect, useRef } from 'react';
import { transposeKey, transposeChord, ALL_KEYS, semitonesBetween } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';
import ChordDiagram from './ChordDiagram';
import { parseLine } from '../parser';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { SegmentedControl } from './ui/SegmentedControl';

const SIZE_MAP = { S: 0.88, M: 1, L: 1.14 };

export default function ChartView({ song, onBack, onEdit, navOverride, compact, forceTranspose, capo = 0, defaultColumns, defaultFontSize, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', duplicateSections = 'full' }) {
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

  // Compute which sections are collapsed (duplicate type, 1st-only mode)
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

  // Collect unique chord names from all sections (transposed)
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
    <div
      className={compact ? '' : 'min-h-screen bg-[var(--ds-background-200)]'}
      style={{ paddingTop: compact ? 0 : 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Sticky header */}
      <div
        ref={headerRef}
        className="material-header"
        style={{
          padding: compact ? '10px 18px 6px' : '12px 18px 8px',
          paddingTop: compact ? 10 : `calc(12px + env(safe-area-inset-top, 0px))`,
          transition: 'padding 0.15s ease',
        }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* The close button was moved to the floating side button */}
            <div className="min-w-0">
              <h1
                className="text-[var(--ds-gray-1000)] m-0 truncate"
                style={{
                  fontSize: compact ? 18 : (scrolled ? 16 : 20),
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  transition: 'font-size 0.15s ease',
                }}
              >
                {song.title}
              </h1>
              {!compact && !scrolled && (
                <div className="text-label-12 text-[var(--ds-gray-600)] mt-0.5">
                  {song.artist}
                  {song.tempo ? ` · ${song.tempo} bpm` : ''}
                  {song.time ? ` · ${song.time}` : ''}
                  {song.ccli ? ` · CCLI ${song.ccli}` : ''}
                </div>
              )}
            </div>
          </div>
          {!compact && (
            <div className="flex gap-1.5 items-center shrink-0">
              {/* Key selector */}
              <select
                value={currentKey}
                onChange={e => handleKeyChange(e.target.value)}
                className={`h-8 rounded-md font-mono text-label-13 font-bold cursor-pointer outline-none border bg-[var(--ds-gray-100)] pr-6 pl-2.5 ${
                  transpose !== 0
                    ? 'border-[var(--chord)] text-[var(--chord)]'
                    : 'border-[var(--ds-gray-400)] text-[var(--ds-gray-1000)]'
                }`}
                style={{
                  appearance: 'none', WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {ALL_KEYS.map(k => (
                  <option key={k} value={k}>{k}{k === song.key ? ' (original)' : ''}</option>
                ))}
              </select>

              <Button
                variant={showDiagrams ? 'brand' : 'secondary'}
                size="xs"
                onClick={() => setShowDiagrams(v => !v)}
              >
                Diagrams
              </Button>

              {!scrolled && onEdit && (
                <Button variant="secondary" size="xs" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {!scrolled && (
                <IconButton
                  variant={showSettings ? 'active' : 'default'}
                  size="sm"
                  onClick={() => setShowSettings(v => !v)}
                  aria-label="Display settings"
                >
                  Aa
                </IconButton>
              )}
            </div>
          )}
          {compact && navOverride && <div>{navOverride}</div>}
        </div>

        <StructureRibbon structure={song.structure || []} compact />

        {/* Capo indicator */}
        {!compact && !scrolled && capo > 0 && (
          <div className="pb-1">
            <MetaPill label="Capo" value={`${capo} → ${transposeKey(song.key, chordTranspose)} shapes`} highlight />
          </div>
        )}

        {/* Nav override for non-compact */}
        {!compact && navOverride && !scrolled && (
          <div className="pb-1">{navOverride}</div>
        )}

        {/* Aa settings popover */}
        {showSettings && !compact && !scrolled && (
          <div className="flex gap-4 flex-wrap items-center pt-2.5 pb-1.5 border-t border-[var(--ds-gray-300)]">
            <div className="flex items-center gap-1.5">
              <span className="text-label-12 text-[var(--ds-gray-600)] font-medium">Layout</span>
              <SegmentedControl
                value={cols}
                onChange={setCols}
                size="xs"
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 1, label: '1col' },
                  { value: 2, label: '2col' },
                ]}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-label-12 text-[var(--ds-gray-600)] font-medium">Size</span>
              <SegmentedControl
                value={size}
                onChange={setSize}
                size="xs"
                options={[
                  { value: 0.88, label: 'S' },
                  { value: 1, label: 'M' },
                  { value: 1.14, label: 'L' },
                ]}
              />
            </div>
          </div>
        )}

        {/* Chord diagram strip */}
        {showDiagrams && uniqueChords.length > 0 && (
          <div className="flex gap-2 flex-nowrap pt-2 pb-1 border-t border-[var(--ds-gray-300)] mt-1 overflow-x-auto hide-scrollbar">
            {uniqueChords.map(chord => (
              <ChordDiagram key={chord} chord={chord} size={80} />
            ))}
          </div>
        )}
      </div>

      {/* Chart body */}
      <div
        className={cols === 'auto' ? 'chart-auto-cols' : undefined}
        style={{
          ...(cols !== 'auto' && {
            display: isExplicit2Col ? 'grid' : 'block',
            gridTemplateColumns: isExplicit2Col ? '1fr 1fr' : '1fr',
          }),
          gap: 10, padding: '14px 16px 50px',
          transform: `scale(${size})`, transformOrigin: 'top left',
          width: size !== 1 ? `${100 / size}%` : '100%',
        }}
      >
        <div>
          {song.sections.slice(0, mid).map((sec, i) => (
            <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[i]} />
          ))}
        </div>
        {(isExplicit2Col || cols === 'auto') && (
          <div>
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[mid + i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[mid + i]} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Close Button */}
      {!compact && (
        <button
          onClick={onBack}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-800)] text-[var(--ds-background-100)] p-3 pr-2 pl-3 rounded-l-full shadow-lg transition-transform hover:-translate-x-1 active:scale-95 z-50 flex items-center justify-center border-y border-l border-[var(--ds-gray-800)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      )}
    </div>
  );
}
