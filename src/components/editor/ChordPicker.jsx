import { useState, useEffect, useRef } from 'react';

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

  // Position popup
  const style = {
    position: 'fixed',
    top: anchorRect ? anchorRect.bottom + 4 : '50%',
    left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 310) : '50%',
    ...(anchorRect ? {} : { transform: 'translate(-50%, -50%)' }),
    zIndex: 100,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    width: 290,
  };

  return (
    <div ref={ref} style={style}>
      {/* Root row */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {ROOTS.map(r => (
          <button key={r} onClick={() => setRoot(r)} style={{
            ...pillBtn,
            flex: 1,
            background: root === r ? 'var(--accent)' : 'var(--surface)',
            color: root === r ? '#fff' : 'var(--text)',
            border: root === r ? '1px solid var(--accent)' : '1px solid var(--border)',
          }}>
            {r}
          </button>
        ))}
        {/* Accidental toggle */}
        <button onClick={() => setAccidental(a => a === '#' ? '' : '#')} style={{
          ...pillBtn, width: 32,
          background: accidental === '#' ? 'var(--accent-soft)' : 'var(--surface)',
          color: accidental === '#' ? 'var(--accent-text)' : 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}>
          #
        </button>
        <button onClick={() => setAccidental(a => a === 'b' ? '' : 'b')} style={{
          ...pillBtn, width: 32,
          background: accidental === 'b' ? 'var(--accent-soft)' : 'var(--surface)',
          color: accidental === 'b' ? 'var(--accent-text)' : 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}>
          b
        </button>
      </div>

      {/* Selected root preview */}
      {root && (
        <div style={{
          textAlign: 'center', fontSize: 11, color: 'var(--text-muted)',
          marginBottom: 4, fontFamily: 'var(--fm)',
        }}>
          {root}{accidental} + suffix:
        </div>
      )}

      {/* Suffix row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {SUFFIXES.map(s => (
          <button key={s.label} onClick={() => handleSuffix(s.value)} style={{
            ...pillBtn,
            padding: '5px 8px', fontSize: 11,
            background: 'var(--surface)',
            color: root ? 'var(--text)' : 'var(--text-dim)',
            border: '1px solid var(--border)',
            opacity: root ? 1 : 0.4,
            cursor: root ? 'pointer' : 'not-allowed',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Slash chord option */}
      {root && (
        <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', alignSelf: 'center' }}>Slash:</span>
          {ROOTS.map(r => (
            <button key={r} onClick={() => {
              onSelect(root + accidental + '/' + r);
              setRoot(null); setAccidental('');
            }} style={{
              ...pillBtn, padding: '3px 6px', fontSize: 10,
              background: 'var(--surface)', color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              /{r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const pillBtn = {
  borderRadius: 6, padding: '6px 0', fontSize: 13,
  fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--fm)',
  textAlign: 'center',
};
