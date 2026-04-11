import { useState, useEffect, useCallback, useMemo } from 'react';
import { parseSongMd, songToMd, lineToPlacement, placementToLine, extractInlineNotes } from '../../parser';
import { sectionStyle } from '../../music';
import TabBlock from '../TabBlock';
import ChordPalette from './ChordPalette';
 
// Find the closest character position from a pointer event within a line element
function charPosFromPointer(e, lineEl) {
  const chars = lineEl.querySelectorAll('[data-char-pos]');
  if (!chars.length) return 0;
  const clientX = e.clientX;
  const clientY = e.clientY;
  let closest = 0;
  let closestDist = Infinity;
  for (const el of chars) {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.abs(clientX - centerX) + Math.abs(clientY - centerY) * 2;
    if (dist < closestDist) {
      closestDist = dist;
      closest = parseInt(el.dataset.charPos, 10);
    }
  }
  return closest;
}
 
// Parse a line string into placement model, preserving inline notes
function parsePlacementLine(line) {
  const { clean } = extractInlineNotes(line);
  const noteMatch = line.match(/\{!(.*?)\}/);
  const inlineNote = noteMatch ? noteMatch[1] : null;
  const placement = lineToPlacement(clean);
  return { ...placement, inlineNote };
}
 
// ─── InteractiveLine ───────────────────────────────────────────────
 
function InteractiveLine({
  plainText, chords, secIdx, lineIdx,
  activeChord, selectedExisting, guidePos,
  onPlace, onChordTap, onGuideUpdate, onGuideClear,
}) {
  const isSelected = (ci) =>
    selectedExisting &&
    selectedExisting.secIdx === secIdx &&
    selectedExisting.lineIdx === lineIdx &&
    selectedExisting.chordIdx === ci;
 
  const handlePointerMove = (e) => {
    if (!activeChord && !selectedExisting) return;
    const el = e.currentTarget;
    const pos = charPosFromPointer(e, el);
    onGuideUpdate({ secIdx, lineIdx, charPos: pos });
  };
 
  const handlePointerLeave = () => {
    onGuideClear();
  };
 
  const handlePointerDown = (e) => {
    if (!activeChord && !selectedExisting) return;
    const el = e.currentTarget;
    const pos = charPosFromPointer(e, el);
    onPlace(secIdx, lineIdx, pos);
  };

    // Show guide line?
  const showGuide = guidePos &&
    guidePos.secIdx === secIdx &&
    guidePos.lineIdx === lineIdx;
 
  if (!plainText && chords.length === 0) {
    return <div className="min-h-[1.3em]" />;
  }

    // For empty plainText with chords (chord-only lines), show spaces
  const displayText = plainText || ' ';
 
  return (
    <div
      className="relative select-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      style={{
        cursor: activeChord || selectedExisting ? 'crosshair' : 'default',
        lineHeight: 1,
      }}
    >
      <div className="flex flex-wrap items-end font-mono" style={{ fontSize: 16 }}>
        {[...displayText].map((char, i) => {
          const chord = chords.find(c => c.pos === i);
          const chordIdx = chord ? chords.indexOf(chord) : -1;
          const selected = chord && isSelected(chordIdx);
 
          // Check if this chord is too close to the next chord — use dash fill
          const nextChord = chords.find(c => c.pos > i && c.pos <= i + 2);
          const needsDash = chord && nextChord && (nextChord.pos - chord.pos) <= chord.chord.length + 1;
          const isGuided = showGuide && guidePos.charPos === i;

          return (
            <span
              key={i}
              className="inline-flex flex-col justify-end"
              data-char-pos={i}
              style={{
                borderLeft: isGuided ? '2px solid var(--chord)' : '2px solid transparent',
              }}
            >
              {/* Chord slot */}
              <span
                className="leading-none whitespace-nowrap"
                style={{ minHeight: '1.4em', paddingBottom: 2 }}
              >
                {chord ? (
                  <span
                    className="font-bold cursor-pointer transition-all"
                    style={{
                      color: selected ? 'var(--color-brand)' : 'var(--chord)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0,
                      borderBottom: selected ? '2px solid var(--color-brand)' : '2px solid transparent',
                      animation: selected ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onChordTap(secIdx, lineIdx, chordIdx);
                    }}
                  >
                    {chord.chord}
                    {needsDash ? '-' : '\u2003'}
                  </span>
                ) : (
                  '\u00A0'
                )}
              </span>

              {/* Character */}
              <span className="text-[var(--text-1)] whitespace-pre leading-tight">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
 
// ─── PlaceTab ──────────────────────────────────────────────────────
 
export default function PlaceTab({ md, onChange }) {
  const [activeChord, setActiveChord] = useState(null);
  const [selectedExisting, setSelectedExisting] = useState(null);
  const [guidePos, setGuidePos] = useState(null);
  const [recentChords, setRecentChords] = useState([]);
 
  // Derive song and placements from md (pure computation)
  const song = useMemo(() => {
    try { return parseSongMd(md); }
    catch { return null; }
  }, [md]);
 
  const placements = useMemo(() => {
    if (!song) return [];
    return song.sections.map(sec => ({
      type: sec.type,
      note: sec.note,
      lines: sec.lines.map(line => {
        if (typeof line !== 'string') return line;
        return parsePlacementLine(line);
      }),
    }));
  }, [song]);

    // Collect unique chords in the song for recent suggestions
  const songChords = useMemo(() => {
    const set = new Set();
    for (const sec of placements) {
      for (const line of sec.lines) {
        if (line.chords) {
          for (const c of line.chords) set.add(c.chord);
        }
      }
    }
    return [...set];
  }, [placements]);

    // Effective recent chords: user-placed chords first, then song chords
  const effectiveRecent = useMemo(() => {
    const merged = [...recentChords];
    for (const c of songChords) {
      if (!merged.includes(c)) merged.push(c);
    }
    return merged.slice(0, 12);
  }, [recentChords, songChords]);

    // Helper: apply a chord mutation to placements and emit new md
  const applyMutation = useCallback((mutator) => {
    if (!song) return;
    const newPlacements = mutator(placements);
    const updatedSong = {
      ...song,
      sections: newPlacements.map(sec => ({
        type: sec.type,
        note: sec.note,
        lines: sec.lines.map(line => {
          if (typeof line === 'object' && (line.type === 'tab' || line.type === 'modulate')) return line;
          if (line.plainText !== undefined) {
            let mdLine = placementToLine({ plainText: line.plainText, chords: line.chords });
            if (line.inlineNote) mdLine += ` {!${line.inlineNote}}`;
            return mdLine;
          }
          return '';
        }),
      })),
    };
    onChange(songToMd(updatedSong));
  }, [song, placements, onChange]);
 
  // Add chord to recent list
  const addRecent = useCallback((chord) => {
    setRecentChords(prev => {
      const next = [chord, ...prev.filter(c => c !== chord)];
      return next.slice(0, 8);
    });
  }, []);

    // ─── Chord placement ───
  const handlePlace = useCallback((secIdx, lineIdx, charPos) => {
    if (selectedExisting) {
      // Move mode
      const { secIdx: fromSec, lineIdx: fromLine, chordIdx } = selectedExisting;
      applyMutation(prev => prev.map((sec, si) => ({
        ...sec,
        lines: sec.lines.map((line, li) => {
          if (line.plainText === undefined) return line;
 
          if (si === fromSec && li === fromLine) {
            const movedChord = line.chords[chordIdx];
            const newChords = line.chords.filter((_, ci) => ci !== chordIdx);
            if (si === secIdx && li === lineIdx) {
              // Same line: remove + insert
              const filtered = newChords.filter(c => c.pos !== charPos);
              return {
                ...line,
                chords: [...filtered, { chord: movedChord.chord, pos: charPos }]
                  .sort((a, b) => a.pos - b.pos),
              };
            }
            return { ...line, chords: newChords };
          }
          if (si === secIdx && li === lineIdx && !(si === fromSec && li === fromLine)) {
            const movedChord = prev[fromSec].lines[fromLine].chords[chordIdx];
            const filtered = line.chords.filter(c => c.pos !== charPos);
            return {
              ...line,
              chords: [...filtered, { chord: movedChord.chord, pos: charPos }]
                .sort((a, b) => a.pos - b.pos),
            };
          }
          return line;
        }),
      })));
      setSelectedExisting(null);
      setGuidePos(null);
      return;
    }
 
    if (!activeChord) return;

        // Place new chord
    applyMutation(prev => prev.map((sec, si) => ({
      ...sec,
      lines: sec.lines.map((line, li) => {
        if (si !== secIdx || li !== lineIdx) return line;
        if (line.plainText === undefined) return line;
        const filtered = line.chords.filter(c => c.pos !== charPos);
        return {
          ...line,
          chords: [...filtered, { chord: activeChord, pos: charPos }]
            .sort((a, b) => a.pos - b.pos),
        };
      }),
    })));
    addRecent(activeChord);
    setGuidePos(null);
  }, [activeChord, selectedExisting, applyMutation, addRecent]);

    // ─── Chord tap (select for move, or remove) ───
  const handleChordTap = useCallback((secIdx, lineIdx, chordIdx, action) => {
    if (action === 'remove') {
      applyMutation(prev => prev.map((sec, si) => ({
        ...sec,
        lines: sec.lines.map((line, li) => {
          if (si !== secIdx || li !== lineIdx) return line;
          if (line.plainText === undefined) return line;
          return {
            ...line,
            chords: line.chords.filter((_, ci) => ci !== chordIdx),
          };
        }),
      })));
      setSelectedExisting(null);
      return;
    }
 
        // Toggle selection
    if (
      selectedExisting &&
      selectedExisting.secIdx === secIdx &&
      selectedExisting.lineIdx === lineIdx &&
      selectedExisting.chordIdx === chordIdx
    ) {
      setSelectedExisting(null);
    } else {
      setSelectedExisting({ secIdx, lineIdx, chordIdx });
      setActiveChord(null);
    }
  }, [selectedExisting, applyMutation]);

    // Escape to deselect
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSelectedExisting(null);
        setActiveChord(null);
        setGuidePos(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
 
  if (!song) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--ds-gray-600)]">
        Start typing in another tab to use Place mode
      </div>
    );
  }
 
  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Chord Palette — top */}
      <ChordPalette
        activeChord={activeChord}
        onSelect={(chord) => {
          setActiveChord(chord);
          setSelectedExisting(null);
        }}
        onClear={() => {
          setActiveChord(null);
          setSelectedExisting(null);
        }}
        songKey={song.key}
        recentChords={effectiveRecent}
        selectedChord={selectedExisting ? (() => {
          const sec = placements[selectedExisting.secIdx];
          const line = sec?.lines[selectedExisting.lineIdx];
          return line?.chords?.[selectedExisting.chordIdx]?.chord || null;
        })() : null}
        onRemoveSelected={selectedExisting ? () => {
          const { secIdx, lineIdx, chordIdx } = selectedExisting;
          handleChordTap(secIdx, lineIdx, chordIdx, 'remove');
        } : null}
      />

      {/* Scrollable sections */}
      <div className="flex-1 overflow-auto px-4 pt-2 pb-8">
        {placements.map((sec, secIdx) => {
          const s = sectionStyle(sec.type);
          const sectionLabel = sec.type.replace(/:+$/, '');
 
          return (
            <div key={secIdx} className="mb-6 md:mb-8">
              {/* Section header */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex flex-col">
                  <span
                    className="text-label-14 font-black uppercase tracking-[0.15em]"
                    style={{ color: s.b }}
                  >
                    {sectionLabel}:
                  </span>
                  {sec.note && (
                    <span
                      className="text-label-11 italic text-[var(--text-2)] mt-1 px-1 ml-0.5 border-l-2"
                      style={{ borderColor: s.br }}
                    >
                      {sec.note}
                    </span>
                  )}
                </div>
                <div className="h-[1px] flex-1 bg-[var(--border-1)] opacity-20" />
              </div>
 
              {/* Lines */}
              <div>
                {sec.lines.map((line, lineIdx) => {
                  // Tab block — read-only
                  if (typeof line === 'object' && line.type === 'tab') {
                    return <TabBlock key={lineIdx} data={line} />;
                  }
                  // Modulate marker — read-only
                  if (typeof line === 'object' && line.type === 'modulate') {
                    return (
                      <div key={lineIdx} className="my-4 flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-[var(--color-brand-border)]" />
                        <span className="text-label-10 font-black uppercase tracking-[0.2em] px-3 py-1 bg-[var(--color-brand)] text-white rounded-full shadow-sm">
                          Key Change: {line.semitones > 0 ? '+' : ''}{line.semitones}
                        </span>
                        <div className="h-[1px] flex-1 bg-[var(--color-brand-border)]" />
                      </div>
                    );
                  }
                  // Interactive lyric line
                  if (line.plainText !== undefined) {
                    return (
                      <div key={lineIdx} className="mb-2 last:mb-0">
                        <InteractiveLine
                          plainText={line.plainText}
                          chords={line.chords}
                          secIdx={secIdx}
                          lineIdx={lineIdx}
                          activeChord={activeChord}
                          selectedExisting={selectedExisting}
                          guidePos={guidePos}
                          onPlace={handlePlace}
                          onChordTap={handleChordTap}
                          onGuideUpdate={setGuidePos}
                          onGuideClear={() => setGuidePos(null)}
                        />
                        {line.inlineNote && (
                          <span className="text-[var(--text-2)] italic text-[0.8em]">
                            {' ---- '}{line.inlineNote}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>
 
    </div>
  );
}