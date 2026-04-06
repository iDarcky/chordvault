import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Tooltip,
  Separator,
  Input,
  ScrollShadow,
  Chip
} from "@heroui/react";

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
  }, [initialTab, timeSig, spm]);

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl bg-background border border-divider shadow-2xl" onClick={e => e.stopPropagation()}>
        <CardContent className="p-6 space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black tracking-tight text-foreground">Tab Editor</h2>
              <Chip size="sm" variant="flat" color="primary" className="font-mono font-bold tracking-widest uppercase">{timeSig}</Chip>
            </div>
            <Button isIconOnly variant="light" size="sm" onPress={onClose} className="text-default-400">
              <span className="text-xl">×</span>
            </Button>
          </header>

          <div className="flex flex-wrap items-center gap-4 bg-content2/40 p-3 rounded-xl border border-divider">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Duration</span>
              <ButtonGroup size="sm" variant="flat">
                {DURATIONS.map(d => (
                  <Button
                    key={d.id}
                    onPress={() => setDuration(d.id)}
                    className={`font-serif text-lg ${duration === d.id ? "bg-primary text-primary-foreground font-bold" : ""}`}
                  >{d.label}</Button>
                ))}
              </ButtonGroup>
            </div>

            <Separator orientation="vertical" className="h-8 mx-1" />

            <Button
              size="sm"
              variant="flat"
              color={chordMode ? "primary" : "default"}
              onPress={() => setChordMode(!chordMode)}
              className="font-bold"
            >
              Chord Mode
            </Button>

            <Separator orientation="vertical" className="h-8 mx-1" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Technique</span>
              <ButtonGroup size="sm" variant="flat">
                {TECHNIQUES.map(t => (
                  <Button
                    key={t}
                    onPress={() => applyTechnique(t)}
                    isDisabled={!lastPlaced}
                    className="font-mono font-bold uppercase"
                  >{t}</Button>
                ))}
              </ButtonGroup>
            </div>

            <div className="flex-1 min-w-[100px]" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Measures</span>
              <ButtonGroup size="sm" variant="flat">
                <Button onPress={() => measures > 1 && setMeasures(measures - 1)} isDisabled={measures <= 1}>−</Button>
                <div className="w-8 flex items-center justify-center font-mono font-bold text-sm text-foreground">{measures}</div>
                <Button onPress={() => setMeasures(measures + 1)}>+</Button>
              </ButtonGroup>
            </div>
          </div>

          <ScrollShadow orientation="horizontal" className="pb-4">
            <div
              onKeyDown={handleGridKeyDown}
              tabIndex={-1}
              className="outline-none min-w-max"
            >
              <div className="flex mb-1 ml-8">
                {Array.from({ length: totalSlots }, (_, pos) => (
                  <div
                    key={pos}
                    className={`w-8 text-center text-[10px] font-mono font-bold ${
                      pos % 4 === 0 ? "text-primary" : "text-default-300"
                    } ${pos > 0 && pos % spm === 0 ? "border-l-2 border-divider" : ""}`}
                  >
                    {labels[pos % labels.length]}
                  </div>
                ))}
              </div>

              {STRING_NAMES.map((name, si) => (
                <div key={si} className="flex items-center group h-8">
                  <div className="w-8 text-right pr-3 font-mono font-bold text-default-400 text-sm">{name}</div>
                  {Array.from({ length: totalSlots }, (_, pos) => {
                    const isBarLine = pos > 0 && pos % spm === 0;
                    const cell = grid[si][pos];
                    const isActive = activeInput?.string === si && activeInput?.pos === pos;
                    const isCursor = cursor.string === si && cursor.pos === pos && !activeInput;
                    const fret = cell === null ? null : (typeof cell === 'object' ? cell.fret : cell);
                    const tech = cell !== null && typeof cell === 'object' ? cell.technique : null;

                    return (
                      <div
                        key={pos}
                        onClick={() => openInput(si, pos)}
                        className={`w-8 h-8 flex items-center justify-center relative cursor-pointer border-r border-divider/50 ${
                          isBarLine ? "border-l-2 border-divider" : ""
                        } ${isCursor ? "bg-primary/20 ring-1 ring-primary ring-inset rounded-sm" : cell !== null ? "bg-warning/5" : ""}`}
                      >
                        <div className="absolute inset-x-0 h-px bg-divider pointer-events-none" />

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
                            onBlur={() => inputVal && commitInput(si, pos, inputVal)}
                            className="w-full h-full bg-primary/40 text-primary font-mono font-bold text-center outline-none relative z-10"
                          />
                        ) : fret !== null ? (
                          <div className="relative z-10 flex items-baseline gap-0.5">
                            <span className="font-mono font-bold text-warning">{fret}</span>
                            {tech && <span className="text-[10px] text-default-400 font-bold uppercase">{tech}</span>}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollShadow>

          <footer className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-default-400 italic">
              Arrows to move · Space/Enter to edit · Del to clear · Right-click to clear
            </p>
            <div className="flex gap-3">
              <Button variant="flat" onPress={onClose}>Cancel</Button>
              <Button color="primary" className="font-bold px-8" onPress={() => {
                const ascii = gridToAscii(grid, measures, timeSig);
                onSave(`{tab, time: ${timeSig}}\n${ascii}\n{/tab}`);
              }}>
                {initialTab ? 'Update Tab' : 'Insert Tab'}
              </Button>
            </div>
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
