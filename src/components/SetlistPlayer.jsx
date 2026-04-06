import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  ScrollShadow,
  Card,
  CardContent,
  Chip
} from "@heroui/react";
import { transposeKey } from '../music';
import ChartView from './ChartView';

export default function SetlistPlayer({ setlist, songs, onBack, defaultColumns, defaultFontSize, showInlineNotes, inlineNoteStyle, displayRole, duplicateSections }) {
  const [idx, setIdx] = useState(0);
  const songBarRef = useRef(null);

  const resolved = useMemo(() =>
    setlist.items
      .map(it => {
        if (it.type === 'break') return { ...it, isBreak: true };
        const song = songs.find(s => s.id === it.songId);
        return song ? { ...it, song } : null;
      })
      .filter(Boolean),
    [setlist, songs]
  );

  const goNext = useCallback(() => setIdx(p => Math.min(resolved.length - 1, p + 1)), [resolved.length]);
  const goPrev = useCallback(() => setIdx(p => Math.max(0, p - 1)), []);

  useEffect(() => {
    const container = songBarRef.current;
    if (!container) return;
    const activeBtn = container.children[idx];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [idx]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!resolved.length) {
    return (
      <div className="p-10 text-center text-default-400">
        No items in setlist
      </div>
    );
  }

  const cur = resolved[idx];

  const nav = (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs font-bold text-default-400">
        {idx + 1}/{resolved.length}
      </span>
      <ButtonGroup size="sm" variant="flat">
        <Button isIconOnly isDisabled={idx === 0} onPress={goPrev}>
          <span className="text-lg">◀</span>
        </Button>
        <Button isIconOnly isDisabled={idx === resolved.length - 1} onPress={goNext}>
          <span className="text-lg">▶</span>
        </Button>
      </ButtonGroup>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-divider">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button isIconOnly variant="light" size="sm" onPress={onBack} className="text-default-500">
            <span className="text-xl">←</span>
          </Button>
          <h1 className="text-sm font-bold truncate text-default-600">
            {setlist.name}
          </h1>
        </div>

        <div className="px-4 flex gap-1 h-1.5 mb-1">
          {resolved.map((r, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-1 rounded-full cursor-pointer transition-all ${
                i === idx ? 'bg-primary h-1.5' : i < idx ? 'bg-primary/30 h-1' : 'bg-default-200 h-1'
              }`}
            />
          ))}
        </div>

        <ScrollShadow ref={songBarRef} orientation="horizontal" className="flex gap-2 p-3 hide-scrollbar">
          {resolved.map((r, i) => {
            const active = i === idx;
            const isBreak = r.isBreak;

            return (
              <Button
                key={i}
                onPress={() => setIdx(i)}
                size="sm"
                variant={active ? "flat" : "light"}
                color={active ? "primary" : "default"}
                className={`flex-shrink-0 min-w-unit-20 h-9 ${active ? 'font-bold' : 'font-medium text-default-500'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] opacity-40">{i + 1}</span>
                  <span className={`truncate max-w-[120px] ${isBreak ? 'italic' : ''}`}>
                    {isBreak ? (r.label || 'Break') : r.song.title}
                  </span>
                  {!isBreak && (
                    <span className="font-mono text-[10px] text-warning font-bold">
                      {transposeKey(r.song.key, r.transpose)}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </ScrollShadow>
      </header>

      <main className="pb-24">
        {cur.note && (
          <div className="px-6 pt-4">
            <Chip
              color="warning"
              variant="flat"
              className="w-full h-auto py-2 px-4 text-sm font-medium italic rounded-xl border border-warning/20"
            >
              {cur.note}
            </Chip>
          </div>
        )}

        {cur.isBreak ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 min-h-[60vh]">
            <h2 className="text-4xl font-black tracking-tight text-foreground mb-4 italic opacity-80">
              {cur.label || 'Break'}
            </h2>
            {cur.duration > 0 && (
              <Chip size="lg" variant="flat" color="default" className="font-mono font-bold mb-8">
                {cur.duration} MIN
              </Chip>
            )}
            <div className="mt-8 scale-150 transform">
              {nav}
            </div>
          </div>
        ) : (
          <ChartView
            song={{ ...cur.song, key: transposeKey(cur.song.key, cur.transpose) }}
            onBack={onBack}
            navOverride={nav}
            compact
            forceTranspose={cur.transpose}
            capo={cur.capo || 0}
            defaultColumns={defaultColumns}
            defaultFontSize={defaultFontSize}
            showInlineNotes={showInlineNotes}
            inlineNoteStyle={inlineNoteStyle}
            displayRole={displayRole}
            duplicateSections={duplicateSections}
          />
        )}
      </main>
    </div>
  );
}
