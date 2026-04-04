import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
const TECHNIQUES = ['h', 'p', 's', 'b', 'x'];

function slotsPerMeasure(timeSig) {
  const [num, den] = (timeSig || '4/4').split('/').map(Number);
  if (den === 8) return num * 2;
  return num * 4;
}

const DURATIONS = [
  { id: 'w',  label: 'WHOLE',  slots: 16 },
  { id: 'h',  label: 'HALF',   slots: 8 },
  { id: 'q',  label: 'QUARTER', slots: 4 },
  { id: 'e',  label: '8TH',    slots: 2 },
  { id: 's',  label: '16TH',   slots: 1 },
];

function beatLabels(timeSig) {
  const [num] = (timeSig || '4/4').split('/').map(Number);
  const labels = [];
  for (let b = 1; b <= num; b++) {
    labels.push(String(b), 'e', '&', 'a');
  }
  return labels;
}

function makeGrid(measures, timeSig) {
  const slots = slotsPerMeasure(timeSig) * measures;
  return STRING_NAMES.map(() => Array(slots).fill(null));
}

function gridToAscii(grid, measures, timeSig) {
  const spm = slotsPerMeasure(timeSig);
  return STRING_NAMES.map((name, si) => {
    let line = name + '|';
    for (let m = 0; m < measures; m++) {
      for (let pos = 0; pos < spm; pos++) {
        const slot = m * spm + pos;
        const cell = grid[si][slot];
        if (cell !== null) {
          const fret = typeof cell === 'object' ? cell.fret : cell;
          const tech = typeof cell === 'object' ? (cell.technique || '') : '';
          line += String(fret) + tech;
          const used = String(fret).length + (tech ? 1 : 0);
          line += '-'.repeat(Math.max(0, 2 - used));
        } else {
          line += '---';
        }
      }
      if (m < measures - 1) line += '|';
    }
    return line;
  }).join('\n');
}

export default function TabGridEditor({ initialTab, time, onSave, onClose }) {
  const timeSig = time || '4/4';
  const spm = slotsPerMeasure(timeSig);
  const labels = beatLabels(timeSig);

  const [measures, setMeasures] = useState(() => {
    if (!initialTab || !initialTab.strings || initialTab.strings.length === 0) return 2;
    return Math.max(2, initialTab.strings[0]?.content?.split('|').length || 2);
  });

  const [duration, setDuration] = useState('q');

  const [grid, setGrid] = useState(() => {
    if (!initialTab || !initialTab.strings || initialTab.strings.length === 0) return makeGrid(2, timeSig);
    const m = Math.max(2, initialTab.strings[0]?.content?.split('|').length || 2);
    const newGrid = makeGrid(m, timeSig);
    initialTab.strings.forEach((str, si) => {
      if (si >= STRING_NAMES.length) return;
      const content = str.content;
      let slot = 0;
      let i = 0;
      while (i < content.length && slot < spm * m) {
        const ch = content[i];
        if (ch === '|') { i++; continue; }
        if (ch >= '0' && ch <= '9') {
          let fretStr = ch;
          if (i + 1 < content.length && content[i + 1] >= '0' && content[i + 1] <= '9') {
            fretStr += content[i + 1];
            i++;
          }
          let tech = null;
          if (i + 1 < content.length && 'hpsbx~'.includes(content[i + 1])) {
            tech = content[i + 1];
            i++;
          }
          const fret = parseInt(fretStr, 10);
          newGrid[si][slot] = tech ? { fret, technique: tech } : fret;
          slot++;
        } else if (ch === '-') {
          slot++;
        }
        i++;
      }
    });
    return newGrid;
  });

  const [cursor, setCursor] = useState({ string: 0, pos: 0 });
  const [chordMode, setChordMode] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [lastPlaced, setLastPlaced] = useState(null);
  const inputRef = useRef(null);

  const totalSlots = spm * measures;

  useEffect(() => {
    if (activeInput && inputRef.current) inputRef.current.focus();
  }, [activeInput]);

  const durSlots = DURATIONS.find(d => d.id === duration)?.slots || 4;

  const openInput = useCallback((si, pos) => {
    setActiveInput({ string: si, pos });
    setInputVal('');
    setCursor({ string: si, pos });
  }, []);

  const commitInput = useCallback((si, pos, val) => {
    const fret = parseInt(val, 10);
    if (!isNaN(fret) && fret >= 0 && fret <= 24) {
      setGrid(prev => {
        const next = prev.map(r => [...r]);
        next[si][pos] = fret;
        return next;
      });
      setLastPlaced({ string: si, pos });
      if (!chordMode) {
        const nextPos = pos + durSlots;
        if (nextPos < totalSlots) {
          setCursor({ string: si, pos: nextPos });
        }
      }
    }
    setActiveInput(null);
    setInputVal('');
  }, [chordMode, durSlots, totalSlots]);

  const clearCell = useCallback((si, pos) => {
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      next[si][pos] = null;
      return next;
    });
  }, []);

  const applyTechnique = useCallback((tech) => {
    if (!lastPlaced) return;
    const { string: si, pos } = lastPlaced;
    setGrid(prev => {
      const next = prev.map(r => [...r]);
      const cell = next[si][pos];
      if (cell === null) return prev;
      const fret = typeof cell === 'object' ? cell.fret : cell;
      next[si][pos] = { fret, technique: tech };
      return next;
    });
  }, [lastPlaced]);

  const addMeasure = () => {
    setMeasures(m => {
      const next = m + 1;
      setGrid(prev => prev.map(row => [...row, ...Array(spm).fill(null)]));
      return next;
    });
  };

  const removeMeasure = () => {
    if (measures <= 1) return;
    setMeasures(m => {
      const next = m - 1;
      setGrid(prev => prev.map(row => row.slice(0, next * spm)));
      return next;
    });
  };

  const handleInsert = () => {
    const ascii = gridToAscii(grid, measures, timeSig);
    const header = `{tab, time: ${timeSig}}`;
    onSave(`${header}\n${ascii}\n{/tab}`);
  };

  const handleGridKeyDown = useCallback((e) => {
    if (activeInput) return;
    const { string: si, pos } = cursor;
    if (e.key === 'ArrowRight') { e.preventDefault(); setCursor({ string: si, pos: Math.min(pos + 1, totalSlots - 1) }); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setCursor({ string: si, pos: Math.max(pos - 1, 0) }); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setCursor({ string: Math.min(si + 1, 5), pos }); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setCursor({ string: Math.max(si - 1, 0), pos }); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInput(si, pos); }
    if (e.key === 'Delete' || e.key === 'Backspace') { clearCell(si, pos); }
  }, [activeInput, cursor, totalSlots, openInput, clearCell]);

  return (
    <div className="fixed inset-0 z-[500] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <Card className="w-full max-w-5xl h-full max-h-[800px] flex flex-col shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-accents-2 bg-accents-1/30">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl">Interactive Tab Editor</CardTitle>
            <Badge variant="outline" className="font-mono text-xs border-accents-2">{timeSig}</Badge>
          </div>
          <button onClick={onClose} className="p-2 text-accents-4 hover:text-foreground border-none bg-transparent cursor-pointer text-xl">✕</button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          {/* Toolbar */}
          <div className="p-4 border-b border-accents-2 flex flex-wrap items-center gap-6 bg-background">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono">STEP</span>
              <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase rounded transition-all",
                      duration === d.id ? "bg-background shadow-sm text-foreground" : "text-accents-4 hover:text-accents-6"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono">MODE</span>
              <Button
                variant={chordMode ? "primary" : "secondary"}
                size="sm"
                onClick={() => setChordMode(!chordMode)}
                className="h-8 text-[10px] font-bold uppercase"
              >
                {chordMode ? "CHORD MODE" : "SINGLE MODE"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono">TECH</span>
              <div className="flex gap-1">
                {TECHNIQUES.map(t => (
                  <Button
                    key={t}
                    variant="secondary"
                    size="sm"
                    disabled={!lastPlaced}
                    onClick={() => applyTechnique(t)}
                    className="h-8 w-8 p-0 font-mono font-bold"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="text-[10px] font-bold text-accents-4 uppercase font-mono tracking-widest">
                {measures} MEASURES
              </div>
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={removeMeasure} disabled={measures <= 1} className="h-8 w-8 p-0">-</Button>
                <Button variant="secondary" size="sm" onClick={addMeasure} className="h-8 w-8 p-0">+</Button>
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div
            className="flex-1 overflow-auto p-10 bg-accents-1/20 outline-none select-none"
            onKeyDown={handleGridKeyDown}
            tabIndex={0}
          >
            <div className="min-w-max inline-block">
              {/* Labels header */}
              <div className="flex ml-8 mb-2">
                {Array.from({ length: totalSlots }).map((_, i) => (
                  <div key={i} className={cn(
                    "w-9 text-center font-mono text-[9px] font-bold",
                    i % 4 === 0 ? "text-accents-5" : "text-accents-3",
                    i > 0 && i % spm === 0 ? "border-l-2 border-accents-2" : ""
                  )}>
                    {i % 4 === 0 ? labels[i % labels.length] : labels[i % labels.length]}
                  </div>
                ))}
              </div>

              {STRING_NAMES.map((name, si) => (
                <div key={si} className="flex items-center mb-1">
                  <div className="w-8 font-mono text-xs font-black text-accents-4 text-right pr-3">{name}</div>
                  <div className="flex">
                    {Array.from({ length: totalSlots }).map((_, pos) => {
                      const cell = grid[si][pos];
                      const isCursor = cursor.string === si && cursor.pos === pos;
                      const isActive = activeInput?.string === si && activeInput?.pos === pos;
                      const fret = cell === null ? null : (typeof cell === 'object' ? cell.fret : cell);
                      const tech = cell !== null && typeof cell === 'object' ? cell.technique : null;

                      return (
                        <div
                          key={pos}
                          onClick={() => openInput(si, pos)}
                          className={cn(
                            "w-9 h-9 border-r border-b border-accents-2/30 flex items-center justify-center relative cursor-pointer transition-all",
                            pos % spm === 0 ? "border-l-2 border-accents-2" : "",
                            isCursor ? "bg-geist-link/10 ring-1 ring-geist-link ring-inset z-10" : "bg-background hover:bg-accents-1"
                          )}
                        >
                          <div className="absolute left-0 right-0 h-[1px] bg-accents-2 top-1/2 -translate-y-1/2 z-0 pointer-events-none" />

                          {isActive ? (
                            <input
                              ref={inputRef}
                              value={inputVal}
                              onChange={e => {
                                const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                setInputVal(v);
                                if (v.length === 2) commitInput(si, pos, v);
                              }}
                              onBlur={() => inputVal ? commitInput(si, pos, inputVal) : setActiveInput(null)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitInput(si, pos, inputVal);
                                if (e.key === 'Escape') setActiveInput(null);
                              }}
                              className="w-7 h-7 bg-foreground text-background text-center font-mono font-black text-sm rounded shadow-lg z-10 outline-none"
                            />
                          ) : fret !== null ? (
                            <div className="z-10 font-mono font-black text-sm text-geist-link bg-background px-1 flex items-baseline gap-0.5">
                              {fret}
                              {tech && <span className="text-[10px] text-accents-4">{tech}</span>}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardHeader className="p-6 border-t border-accents-2 flex flex-row items-center justify-between bg-accents-1/30">
          <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono">
            Arrow keys to move &middot; Enter to type &middot; Del to clear
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} className="px-6 font-bold uppercase text-[11px] tracking-widest">
              Cancel
            </Button>
            <Button onClick={handleInsert} className="px-8 font-bold uppercase text-[11px] tracking-widest">
              {initialTab ? "Update Tab Block" : "Insert Tab Block"}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
