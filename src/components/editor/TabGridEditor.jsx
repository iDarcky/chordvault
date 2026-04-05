import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
const TECHNIQUES = ['h', 'p', 's', 'b', 'x'];

function slotsPerMeasure(timeSig) {
  const [num, den] = (timeSig || '4/4').split('/').map(Number);
  if (den === 8) return num * 2;
  return num * 4;
}

const DURATIONS = [
  { id: 'w',  label: '𝅝',  slots: 16, title: 'Whole' },
  { id: 'h',  label: '𝅗𝅥',  slots: 8,  title: 'Half' },
  { id: 'q',  label: '♩',  slots: 4,  title: 'Quarter' },
  { id: 'e',  label: '♪',  slots: 2,  title: '8th' },
  { id: 's',  label: '𝅘𝅥𝅯',  slots: 1,  title: '16th' },
  { id: 'dq', label: '♩.',  slots: 6,  title: 'Dotted Quarter' },
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
  const [measures, setMeasures] = useState(2);
  const [duration, setDuration] = useState('q');
  const [grid, setGrid] = useState(() => makeGrid(2, timeSig));
  const [cursor, setCursor] = useState({ string: 0, pos: 0 });
  const [chordMode, setChordMode] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [lastPlaced, setLastPlaced] = useState(null);
  const inputRef = useRef(null);

  const spm = slotsPerMeasure(timeSig);
  const totalSlots = spm * measures;
  const labels = beatLabels(timeSig);

  useEffect(() => {
    if (activeInput && inputRef.current) inputRef.current.focus();
  }, [activeInput]);

  useEffect(() => {
    if (!initialTab || !initialTab.strings || initialTab.strings.length === 0) return;
    const maxMeasures = Math.max(2, initialTab.strings[0]?.content?.split('|').length || 2);
    const newGrid = makeGrid(maxMeasures, timeSig);
    setMeasures(maxMeasures);

    initialTab.strings.forEach((str, si) => {
      if (si >= STRING_NAMES.length) return;
      const content = str.content;
      let slot = 0;
      let i = 0;
      while (i < content.length && slot < spm * maxMeasures) {
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
    setGrid(newGrid);
  }, []);

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

  const cellW = 34;
  const cellH = 28;
  const labelW = 28;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
      <div
        className="bg-[var(--geist-background)] border border-[var(--geist-border)] rounded-geist-card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleGridKeyDown}
        tabIndex={-1}
      >
        <div className="p-6 border-b border-[var(--geist-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--geist-foreground)]">Tab Editor</h2>
            <span className="text-[10px] font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20 uppercase">{timeSig}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>&times;</Button>
        </div>

        <div className="p-6 overflow-auto">
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <div className="flex bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-button p-0.5">
              {DURATIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  title={d.title}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-sm transition-all",
                    duration === d.id ? "bg-[var(--geist-background)] text-brand shadow-sm" : "text-[var(--accents-4)] hover:text-[var(--accents-8)]"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-[var(--geist-border)]" />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChordMode(!chordMode)}
              className={cn(chordMode && "border-brand text-brand bg-brand/5")}
            >
              Chord Mode
            </Button>

            <div className="h-6 w-[1px] bg-[var(--geist-border)]" />

            <div className="flex gap-1">
              {TECHNIQUES.map(t => (
                <button
                  key={t}
                  onClick={() => applyTechnique(t)}
                  disabled={!lastPlaced}
                  className="w-8 h-8 rounded-geist-button border border-[var(--geist-border)] bg-[var(--accents-1)] text-[10px] font-bold font-mono hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-[var(--accents-4)] uppercase tracking-tight">{measures} BAR{measures !== 1 ? 'S' : ''}</span>
               <div className="flex border border-[var(--geist-border)] rounded-geist-button p-0.5">
                 <button onClick={removeMeasure} disabled={measures <= 1} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--accents-1)] rounded">-</button>
                 <button onClick={addMeasure} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--accents-1)] rounded">+</button>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-4 no-scrollbar">
            <div className="inline-block min-w-full">
              <div className="flex mb-1" style={{ marginLeft: labelW }}>
                {Array.from({ length: totalSlots }, (_, pos) => (
                  <div key={pos} style={{ width: cellW }} className={cn(
                    "text-[8px] text-center font-mono font-bold",
                    pos % 4 === 0 ? "text-[var(--accents-8)]" : "text-[var(--accents-3)]",
                    pos > 0 && pos % spm === 0 && "border-l-2 border-[var(--geist-border)]"
                  )}>
                    {labels[pos % labels.length]}
                  </div>
                ))}
              </div>

              {STRING_NAMES.map((name, si) => (
                <div key={si} className="flex items-center mb-1">
                  <div style={{ width: labelW }} className="text-[10px] font-mono font-black text-[var(--accents-5)] text-right pr-2">{name}</div>
                  {Array.from({ length: totalSlots }, (_, pos) => {
                    const cell = grid[si][pos];
                    const isCursor = cursor.string === si && cursor.pos === pos && !activeInput;
                    const isActive = activeInput?.string === si && activeInput?.pos === pos;
                    const fret = cell === null ? null : (typeof cell === 'object' ? cell.fret : cell);
                    const tech = cell !== null && typeof cell === 'object' ? cell.technique : null;

                    return (
                      <div
                        key={pos}
                        style={{ width: cellW, height: cellH }}
                        onClick={() => { if (!isActive) openInput(si, pos); }}
                        className={cn(
                          "relative flex items-center justify-center border-l border-[var(--geist-border)] transition-all cursor-pointer",
                          pos > 0 && pos % spm === 0 && "border-l-2 border-[var(--accents-5)]",
                          isCursor ? "bg-brand/10 ring-1 ring-inset ring-brand z-10" : "hover:bg-[var(--accents-1)]"
                        )}
                      >
                        <div className="absolute inset-x-0 h-[1px] bg-[var(--geist-border)] pointer-events-none" />

                        {isActive ? (
                          <input
                            ref={inputRef}
                            value={inputVal}
                            onChange={e => {
                              const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                              setInputVal(v);
                              if (v.length === 2) commitInput(si, pos, v);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitInput(si, pos, inputVal);
                              if (e.key === 'Escape') setActiveInput(null);
                            }}
                            onBlur={() => inputVal ? commitInput(si, pos, inputVal) : setActiveInput(null)}
                            className="absolute inset-1 w-[calc(100%-8px)] bg-brand text-white text-[10px] font-mono font-bold text-center border-none outline-none rounded-sm z-20"
                          />
                        ) : (
                          fret !== null && (
                            <div className="relative z-10 flex items-center gap-0.5">
                              <span className="text-xs font-mono font-bold text-brand bg-[var(--geist-background)] px-0.5">{fret}</span>
                              {tech && <span className="text-[8px] font-mono font-bold text-[var(--accents-4)]">{tech}</span>}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--geist-border)] flex items-center justify-between">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Click cell for fret · Arrow keys to move · Del to clear</div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="brand" onClick={handleInsert}>{initialTab ? 'Update Tab' : 'Insert Tab'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
