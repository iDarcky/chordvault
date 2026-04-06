import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonGroup, Card, CardContent } from "@heroui/react";

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
    top: anchorRect ? anchorRect.bottom + 4 : '50%',
    left: anchorRect ? Math.min(anchorRect.left, window.innerWidth - 310) : '50%',
    ...(anchorRect ? {} : { transform: 'translate(-50%, -50%)' }),
    zIndex: 100,
    width: 300,
  };

  return (
    <Card ref={ref} style={style} shadow="lg" className="bg-content1 border border-divider">
      <CardContent className="p-3 space-y-3">
        {/* Root row */}
        <div className="flex gap-1.5 flex-wrap">
          {ROOTS.map(r => (
            <Button
              key={r}
              onPress={() => setRoot(r)}
              size="sm"
              variant={root === r ? "solid" : "flat"}
              color={root === r ? "primary" : "default"}
              className="min-w-0 flex-1 font-bold font-mono"
            >
              {r}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <ButtonGroup size="sm" variant="flat" className="flex-1">
            <Button
              onPress={() => setAccidental(a => a === '#' ? '' : '#')}
              color={accidental === '#' ? "warning" : "default"}
              className="font-bold font-mono"
            >#</Button>
            <Button
              onPress={() => setAccidental(a => a === 'b' ? '' : 'b')}
              color={accidental === 'b' ? "warning" : "default"}
              className="font-bold font-mono"
            >b</Button>
          </ButtonGroup>
          {root && (
            <div className="flex-1 flex items-center justify-center bg-content2 rounded-lg font-mono font-black text-warning">
              {root}{accidental}
            </div>
          )}
        </div>

        <Separator className="my-1" />

        {/* Suffixes */}
        <div className="flex flex-wrap gap-1.5">
          {SUFFIXES.map(s => (
            <Button
              key={s.label}
              onPress={() => handleSuffix(s.value)}
              size="sm"
              variant="flat"
              isDisabled={!root}
              className="min-w-0 px-2 h-7 text-[11px] font-bold"
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Slash chords */}
        {root && (
          <>
            <Separator className="my-1" />
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] font-bold text-default-400 uppercase self-center mr-1">Slash:</span>
              {ROOTS.map(r => (
                <Button
                  key={r}
                  onPress={() => {
                    onSelect(root + accidental + '/' + r);
                    setRoot(null); setAccidental('');
                  }}
                  size="sm"
                  variant="light"
                  className="min-w-0 px-1 h-6 text-xs font-mono font-bold text-default-500"
                >
                  /{r}
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Separator({ className }) {
  return <div className={`h-px bg-divider ${className}`} />;
}
