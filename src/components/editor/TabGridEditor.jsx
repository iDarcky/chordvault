import { useState, useCallback, useEffect, useRef } from 'react';

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
const TECHNIQUES = ['h', 'p', 's', 'b', 'x'];

// Slots per measure at 16th-note resolution
function slotsPerMeasure(timeSig) {
  const [num, den] = (timeSig || '4/4').split('/').map(Number);
  if (den === 8) return num * 2;   // 6/8 → 12, 3/8 → 6
  return num * 4;                  // 4/4 → 16, 3/4 → 12
}

// Duration in slots (at 16th-note resolution)
const DURATIONS = [
  { id: 'w',  label: '𝅝',  slots: 16, title: 'Whole' },
  { id: 'h',  label: '𝅗𝅥',  slots: 8,  title: 'Half' },
  { id: 'q',  label: '♩',  slots: 4,  title: 'Quarter' },
  { id: 'e',  label: '♪',  slots: 2,  title: '8th' },
  { id: 's',  label: '𝅘𝅥𝅯',  slots: 1,  title: '16th' },
  { id: 'dq', label: '♩.',  slots: 6,  title: 'Dotted Quarter' },
];

// Beat header labels for 4/4 at 16th resolution
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
          // Pad with dashes: fret takes 1 or 2 chars + 1 for technique
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
  const [activeInput, setActiveInput] = useState(null); // { string, pos }
  const [inputVal, setInputVal] = useState('');
  const [lastPlaced, setLastPlaced] = useState(null); // { string, pos }
  const inputRef = useRef(null);

  const spm = slotsPerMeasure(timeSig);
  const totalSlots = spm * measures;
  const labels = beatLabels(timeSig);

  // Focus input when it appears
  useEffect(() => {
    if (activeInput && inputRef.current) inputRef.current.focus();
  }, [activeInput]);

  // Load existing tab into grid
  useEffect(() => {
    if (!initialTab || !initialTab.strings || initialTab.strings.length === 0) return;
    // Simple load: parse fret numbers from existing tab content into a new grid
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleKeyDown = (e, si, pos) => {
    if (e.key === 'Escape') { setActiveInput(null); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      clearCell(si, pos);
      setActiveInput(null);
    }
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
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={handleGridKeyDown}
        tabIndex={-1}
        style={{
          background: 'var(--bg)', borderRadius: 14,
          border: '1px solid var(--border)',
          padding: 18, width: '95%', maxWidth: 860,
          maxHeight: '90vh', overflow: 'auto',
          outline: 'none',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-bright)', flex: 1 }}>
            Tab Editor
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>
            {timeSig}
          </span>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* Toolbar: Durations + chord mode + techniques */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          {/* Duration picker */}
          <div style={{ display: 'flex', gap: 3 }}>
            {DURATIONS.map(d => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                title={d.title}
                style={{
                  ...toolBtnStyle,
                  borderColor: duration === d.id ? 'var(--accent)' : 'var(--border)',
                  color: duration === d.id ? 'var(--accent-text)' : 'var(--text-muted)',
                  background: duration === d.id ? 'var(--accent-soft)' : 'var(--surface)',
                  fontSize: 16, padding: '3px 8px',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Chord mode */}
          <button
            onClick={() => setChordMode(v => !v)}
            title="Chord mode — stack notes without advancing"
            style={{
              ...toolBtnStyle,
              borderColor: chordMode ? 'var(--accent)' : 'var(--border)',
              color: chordMode ? 'var(--accent-text)' : 'var(--text-muted)',
              background: chordMode ? 'var(--accent-soft)' : 'var(--surface)',
              fontSize: 11,
            }}
          >
            Chord
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Technique buttons */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', marginRight: 2 }}>Technique:</span>
            {TECHNIQUES.map(t => (
              <button
                key={t}
                onClick={() => applyTechnique(t)}
                disabled={!lastPlaced}
                title={{ h: 'Hammer-on', p: 'Pull-off', s: 'Slide', b: 'Bend', x: 'Mute' }[t]}
                style={{
                  ...toolBtnStyle,
                  opacity: lastPlaced ? 1 : 0.4,
                  fontSize: 12, padding: '3px 8px',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Measure controls */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{measures} bar{measures !== 1 ? 's' : ''}</span>
            <button onClick={removeMeasure} disabled={measures <= 1} style={{ ...toolBtnStyle, padding: '3px 9px' }}>−</button>
            <button onClick={addMeasure} style={{ ...toolBtnStyle, padding: '3px 9px' }}>+</button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          {/* Beat header */}
          <div style={{ display: 'flex', marginBottom: 2, marginLeft: labelW }}>
            {Array.from({ length: totalSlots }, (_, pos) => {
              const isBarLine = pos > 0 && pos % spm === 0;
              const beatLabel = labels[pos % labels.length];
              const isBeat = pos % 4 === 0;
              return (
                <div
                  key={pos}
                  style={{
                    width: cellW, textAlign: 'center', flexShrink: 0,
                    fontSize: isBeat ? 10 : 8,
                    color: isBeat ? 'var(--text-muted)' : 'var(--text-dim)',
                    fontFamily: 'var(--fm)',
                    borderLeft: isBarLine ? '2px solid var(--border)' : 'none',
                    fontWeight: isBeat ? 700 : 400,
                  }}
                >
                  {beatLabel}
                </div>
              );
            })}
          </div>

          {/* String rows */}
          {STRING_NAMES.map((name, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              {/* String label */}
              <div style={{
                width: labelW, textAlign: 'right', paddingRight: 6,
                fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                fontFamily: 'var(--fm)', flexShrink: 0,
              }}>
                {name}
              </div>

              {/* Cells */}
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
                    style={{
                      width: cellW, height: cellH, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                      borderLeft: isBarLine ? '2px solid var(--text-dim)' : '1px solid var(--border)',
                      background: isCursor
                        ? 'var(--accent-soft)'
                        : cell !== null ? 'rgba(226,168,50,0.06)' : 'transparent',
                      cursor: 'pointer',
                      outline: isCursor ? '1px solid var(--accent)' : 'none',
                      borderRadius: isCursor ? 3 : 0,
                    }}
                    onClick={() => {
                      if (isActive) return;
                      setCursor({ string: si, pos });
                      openInput(si, pos);
                    }}
                    onContextMenu={e => { e.preventDefault(); clearCell(si, pos); }}
                  >
                    {/* String line */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      top: '50%', height: 1,
                      background: 'var(--border)',
                      pointerEvents: 'none',
                    }} />

                    {isActive ? (
                      <input
                        ref={inputRef}
                        value={inputVal}
                        onChange={e => {
                          const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                          setInputVal(v);
                          if (v.length === 2 || (v.length === 1 && parseInt(v) <= 9)) {
                            // Auto-commit on 2 digits or single digit followed by delay
                            if (v.length === 2) commitInput(si, pos, v);
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            e.preventDefault();
                            commitInput(si, pos, inputVal);
                          }
                          if (e.key === 'Escape') {
                            setActiveInput(null);
                            setInputVal('');
                          }
                        }}
                        onBlur={() => {
                          if (inputVal) commitInput(si, pos, inputVal);
                          else setActiveInput(null);
                        }}
                        style={{
                          width: cellW - 4, height: cellH - 4,
                          background: 'var(--accent-soft)',
                          border: '1px solid var(--accent)',
                          borderRadius: 3, textAlign: 'center',
                          color: 'var(--accent-text)', fontFamily: 'var(--fm)',
                          fontSize: 13, fontWeight: 700, outline: 'none',
                          zIndex: 1, position: 'relative',
                        }}
                      />
                    ) : (
                      fret !== null && (
                        <div style={{
                          position: 'relative', zIndex: 1,
                          display: 'flex', alignItems: 'center', gap: 1,
                        }}>
                          <span style={{
                            fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 700,
                            color: 'var(--chord)', lineHeight: 1,
                          }}>
                            {fret}
                          </span>
                          {tech && (
                            <span style={{
                              fontFamily: 'var(--fm)', fontSize: 9,
                              color: 'var(--text-muted)', lineHeight: 1,
                            }}>
                              {tech}
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hint */}
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8, marginBottom: 14, fontFamily: 'var(--fm)' }}>
          Click a cell to enter fret (0–24) · Enter/Tab to confirm · Right-click to clear · Arrow keys to navigate
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleInsert} style={insertBtnStyle}>{initialTab ? 'Save Tab' : 'Insert Tab'}</button>
        </div>
      </div>
    </div>
  );
}

const toolBtnStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 12, fontWeight: 600,
  fontFamily: 'var(--fm)',
};

const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-dim)', fontSize: 16, padding: '2px 6px',
};

const cancelBtnStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '8px 18px',
  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const insertBtnStyle = {
  background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
  borderRadius: 8, padding: '8px 22px',
  color: 'var(--accent-text)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
