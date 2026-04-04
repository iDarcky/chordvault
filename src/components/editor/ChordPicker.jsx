import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const ROOTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const SUFFIXES = [
  { label: 'maj', value: '' },
  { label: 'm', value: 'm' },
  { label: '7', value: '7' },
  { label: 'm7', value: 'm7' },
  { label: 'sus4', value: 'sus4' },
  { label: 'add9', value: 'add9' },
  { label: 'maj7', value: 'maj7' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
];

export default function ChordPicker({ onSelect, onClose, anchorRect }) {
  const [root, setRoot] = useState(null);
  const [accidental, setAccidental] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSuffix = (suffix) => {
    if (!root) return;
    onSelect(root + accidental + suffix);
    setRoot(null);
    setAccidental('');
  };

  return (
    <div
      ref={ref}
      className="fixed z-[300] bg-background border border-accents-2 rounded-geist p-3 shadow-2xl animate-in fade-in slide-in-from-top-1 w-[310px]"
      style={{
        top: anchorRect ? anchorRect.bottom + 8 : '50%',
        left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 320) : '50%',
        ...(anchorRect ? {} : { transform: 'translate(-50%, -50%)' }),
      }}
    >
      {/* Root row */}
      <div className="flex gap-1 mb-3">
        {ROOTS.map(r => (
          <button
            key={r}
            onClick={() => setRoot(r)}
            className={cn(
              "flex-1 h-9 rounded-geist font-mono font-bold text-xs transition-all border-none cursor-pointer",
              root === r ? "bg-foreground text-background" : "bg-accents-1 text-accents-5 hover:bg-accents-2"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Accidentals */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setAccidental(a => a === '#' ? '' : '#')}
          className={cn(
            "flex-1 h-8 rounded-geist font-mono font-bold text-xs transition-all border border-accents-2 cursor-pointer",
            accidental === '#' ? "bg-geist-link/10 text-geist-link border-geist-link/30" : "bg-background text-accents-4 hover:border-accents-4"
          )}
        >
          # (Sharp)
        </button>
        <button
          onClick={() => setAccidental(a => a === 'b' ? '' : 'b')}
          className={cn(
            "flex-1 h-8 rounded-geist font-mono font-bold text-xs transition-all border border-accents-2 cursor-pointer",
            accidental === 'b' ? "bg-geist-link/10 text-geist-link border-geist-link/30" : "bg-background text-accents-4 hover:border-accents-4"
          )}
        >
          b (Flat)
        </button>
      </div>

      {/* Suffix grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {SUFFIXES.map(s => (
          <button
            key={s.label}
            onClick={() => handleSuffix(s.value)}
            disabled={!root}
            className={cn(
              "h-8 rounded-geist font-mono text-[10px] font-bold uppercase tracking-tight transition-all border border-accents-2 cursor-pointer",
              root ? "bg-background text-foreground hover:border-foreground" : "bg-accents-1 text-accents-3 cursor-not-allowed opacity-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Slash chords */}
      {root && (
        <div className="mt-4 pt-3 border-t border-accents-2">
          <div className="text-[9px] font-bold text-accents-4 uppercase tracking-[0.2em] mb-2 text-center font-mono">
            Slash Chord / Bass
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {ROOTS.map(r => (
              <button
                key={r}
                onClick={() => {
                  onSelect(root + accidental + '/' + r);
                  setRoot(null); setAccidental('');
                }}
                className="w-8 h-7 rounded border border-accents-2 bg-accents-1 text-[10px] font-mono font-bold text-accents-5 hover:border-foreground hover:text-foreground transition-all cursor-pointer"
              >
                /{r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview indicator */}
      {!root && (
        <div className="mt-2 text-center text-[10px] font-bold text-accents-3 uppercase tracking-widest font-mono italic animate-pulse">
          Select a root note...
        </div>
      )}
    </div>
  );
}
