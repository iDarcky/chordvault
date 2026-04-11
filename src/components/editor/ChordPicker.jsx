import { useState, useEffect, useRef } from 'react';
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

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
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
      className="fixed z-[100] bg-background border border-default-300 rounded-xl p-2.5 w-[290px]"
      style={{
        top: anchorRect ? anchorRect.bottom + 4 : '50%',
        left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 310) : '50%',
        ...(anchorRect ? {} : { transform: 'translate(-50%, -50%)' }),
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Root row */}
      <div className="flex gap-1 mb-1.5">
        {ROOTS.map(r => (
          <button
            key={r}
            onClick={() => setRoot(r)}
            className={`flex-1 rounded-md py-1.5 text-label-13 font-semibold font-mono text-center cursor-pointer border transition-colors ${
              root === r
                ? 'bg-primary text-white border-[var(--color-primary)]'
                : 'bg-default-100 text-foreground border-default-300 hover:bg-default-200'
            }`}
          >
            {r}
          </button>
        ))}
        {/* Accidental toggles */}
        <button
          onClick={() => setAccidental(a => a === '#' ? '' : '#')}
          className={`w-8 rounded-md py-1.5 text-label-13 font-semibold font-mono text-center cursor-pointer border transition-colors ${
            accidental === '#'
              ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border-[var(--color-primary-300)]'
              : 'bg-default-100 text-default-500 border-default-300'
          }`}
        >
          #
        </button>
        <button
          onClick={() => setAccidental(a => a === 'b' ? '' : 'b')}
          className={`w-8 rounded-md py-1.5 text-label-13 font-semibold font-mono text-center cursor-pointer border transition-colors ${
            accidental === 'b'
              ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border-[var(--color-primary-300)]'
              : 'bg-default-100 text-default-500 border-default-300'
          }`}
        >
          b
        </button>
      </div>

      {/* Selected root preview */}
      {root && (
        <div className="text-center text-copy-11 text-default-500 mb-1 font-mono">
          {root}{accidental} + suffix:
        </div>
      )}

      {/* Suffix row */}
      <div className="flex flex-wrap gap-1">
        {SUFFIXES.map(s => (
          <button
            key={s.label}
            onClick={() => handleSuffix(s.value)}
            className={`rounded-md px-2 py-1.5 text-label-11 font-semibold font-mono text-center border transition-colors ${
              root
                ? 'bg-default-100 text-foreground border-default-300 cursor-pointer hover:bg-default-200'
                : 'bg-default-100 text-default-400 border-default-200 cursor-not-allowed opacity-40'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Slash chord option */}
      {root && (
        <div className="mt-1.5 flex gap-1 items-center">
          <span className="text-label-10 text-default-400">Slash:</span>
          {ROOTS.map(r => (
            <button
              key={r}
              onClick={() => {
                onSelect(root + accidental + '/' + r);
                setRoot(null); setAccidental('');
              }}
              className="rounded-md px-1.5 py-1 text-label-10 font-semibold font-mono bg-default-100 text-default-500 border border-default-300 cursor-pointer hover:bg-default-200 transition-colors"
            >
              /{r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
