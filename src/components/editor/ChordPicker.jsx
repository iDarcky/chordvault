import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

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

  const style = {
    position: 'fixed',
    top: anchorRect ? anchorRect.bottom + 8 : '50%',
    left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 310) : '50%',
    ...(anchorRect ? {} : { transform: 'translate(-50%, -50%)' }),
  };

  return (
    <div
      ref={ref}
      style={style}
      className="z-[200] w-[300px] bg-[var(--geist-background)] border border-[var(--geist-border)] rounded-geist-card p-3 shadow-2xl animate-in fade-in zoom-in-95"
    >
      <div className="flex gap-1 mb-2">
        {ROOTS.map(r => (
          <button
            key={r}
            onClick={() => setRoot(r)}
            className={cn(
              "flex-1 h-9 rounded-geist-button font-mono font-bold text-sm transition-colors",
              root === r
                ? "bg-brand text-white"
                : "bg-[var(--accents-1)] text-[var(--geist-foreground)] border border-[var(--geist-border)] hover:bg-[var(--accents-2)]"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setAccidental(a => a === '#' ? '' : '#')}
          className={cn(
            "flex-1 h-8 rounded-geist-button text-xs font-bold transition-colors border",
            accidental === '#' ? "bg-brand/10 border-brand text-brand" : "bg-[var(--accents-1)] border-[var(--geist-border)] text-[var(--accents-5)]"
          )}
        >
          # (Sharp)
        </button>
        <button
          onClick={() => setAccidental(a => a === 'b' ? '' : 'b')}
          className={cn(
            "flex-1 h-8 rounded-geist-button text-xs font-bold transition-colors border",
            accidental === 'b' ? "bg-brand/10 border-brand text-brand" : "bg-[var(--accents-1)] border-[var(--geist-border)] text-[var(--accents-5)]"
          )}
        >
          b (Flat)
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {SUFFIXES.map(s => (
          <button
            key={s.label}
            onClick={() => handleSuffix(s.value)}
            disabled={!root}
            className={cn(
              "h-8 rounded-geist-button text-[10px] font-bold uppercase tracking-widest border transition-all",
              root
                ? "bg-[var(--accents-1)] border-[var(--geist-border)] text-[var(--geist-foreground)] hover:border-brand hover:text-brand"
                : "bg-[var(--accents-1)] border-transparent text-[var(--accents-3)] cursor-not-allowed"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {root && (
        <div className="mt-3 pt-3 border-t border-[var(--geist-border)]">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--accents-4)] mb-2 px-1">Slash Chords</div>
          <div className="flex flex-wrap gap-1">
            {ROOTS.map(r => (
              <button
                key={r}
                onClick={() => { onSelect(root + accidental + '/' + r); setRoot(null); setAccidental(''); }}
                className="px-2 py-1 bg-[var(--accents-1)] border border-[var(--geist-border)] rounded text-[10px] font-mono font-bold text-[var(--accents-5)] hover:text-brand hover:border-brand transition-colors"
              >
                /{r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
