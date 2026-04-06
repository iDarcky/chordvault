import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Button,
  Select,
  ListBoxItem,
  ButtonGroup,
  ScrollShadow,
  Card,
  CardContent,
  Separator,
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@heroui/react";
import { transposeKey, transposeChord, ALL_KEYS, semitonesBetween } from '../music';
import SectionBlock from './SectionBlock';
import { StructureRibbon, MetaPill } from './StructureRibbon';
import ChordDiagram from './ChordDiagram';
import { parseLine } from '../parser';

const SIZE_MAP = { S: 0.88, M: 1, L: 1.14 };

export default function ChartView({ song, onBack, onEdit, navOverride, compact, forceTranspose, capo = 0, defaultColumns, defaultFontSize, showInlineNotes = true, inlineNoteStyle = 'dashes', displayRole = 'leader', duplicateSections = 'full' }) {
  const [localTranspose, setLocalTranspose] = useState(0);
  const [cols, setCols] = useState(defaultColumns || 'auto');
  const [size, setSize] = useState(SIZE_MAP[defaultFontSize] || 1);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  const transpose = forceTranspose != null ? forceTranspose : localTranspose;
  const chordTranspose = capo ? (transpose - capo + 12) % 12 : transpose;
  const currentKey = transposeKey(song.key, transpose);

  useEffect(() => {
    if (compact) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [compact]);
 
  const sectionModOffsets = useMemo(() => {
    const offsets = [];
    const acc = { total: 0 };
    for (const sec of song.sections) {
      offsets.push(acc.total);
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          acc.total += line.semitones;
        }
      }
    }
    return offsets;
  }, [song.sections]);

  const collapsedSections = useMemo(() => {
    if (duplicateSections !== 'first') return [];
    const seen = new Set();
    return song.sections.map(sec => {
      const baseType = sec.type.replace(/\s*\d+$/, '').trim();
      if (seen.has(baseType)) return true;
      seen.add(baseType);
      return false;
    });
  }, [song.sections, duplicateSections]);

  const uniqueChords = useMemo(() => {
    if (!showDiagrams) return [];
    const seen = new Set();
    for (let si = 0; si < song.sections.length; si++) {
      const sec = song.sections[si];
      let runningMod = sectionModOffsets[si] || 0;
      for (const line of sec.lines) {
        if (typeof line === 'object' && line.type === 'modulate') {
          runningMod += line.semitones;
          continue;
        }
        if (typeof line !== 'string') continue;
        const parts = parseLine(line);
        for (const p of parts) {
          if (p.chord) {
            const transposed = transposeChord(p.chord, chordTranspose + runningMod);
            seen.add(transposed);
          }
        }
      }
    }
    return [...seen];
  }, [showDiagrams, song.sections, chordTranspose, sectionModOffsets]);

  const isExplicit2Col = cols === 2;
  const mid = (isExplicit2Col || cols === 'auto')
    ? Math.ceil(song.sections.length / 2)
    : song.sections.length;

  const handleKeyChange = (newKey) => {
    const semitones = semitonesBetween(song.key, newKey);
    setLocalTranspose(semitones);
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider transition-all ${compact ? 'px-4 py-2' : scrolled ? 'px-4 py-2' : 'px-6 pt-6 pb-3'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {!compact && (
              <Button isIconOnly variant="light" size="sm" onPress={onBack} className="text-default-500">
                <span className="text-xl">←</span>
              </Button>
            )}
            <div className="min-w-0">
              <h1 className={`font-bold tracking-tight text-foreground truncate transition-all ${compact ? 'text-lg' : scrolled ? 'text-md' : 'text-xl'}`}>
                {song.title}
              </h1>
              {!compact && !scrolled && (
                <div className="text-[11px] text-default-400 mt-0.5 truncate uppercase font-semibold tracking-wider">
                  {song.artist}{song.tempo ? ` · ${song.tempo} bpm` : ''}{song.time ? ` · ${song.time}` : ''}
                </div>
              )}
            </div>
          </div>

          {!compact && (
            <div className="flex gap-1 items-center flex-shrink-0">
              <Select
                size="sm"
                selectedKeys={[currentKey]}
                onSelectionChange={(keys) => handleKeyChange(Array.from(keys)[0])}
                className="w-24"
                disallowEmptySelection
                variant="flat"
                classNames={{
                  trigger: "h-8 bg-default-100 min-h-unit-8",
                  value: `font-mono font-bold text-xs ${transpose !== 0 ? 'text-warning' : ''}`
                }}
                renderValue={(items) => items.map(item => (
                  <span key={item.key}>{item.key}</span>
                ))}
              >
                {ALL_KEYS.map(k => (
                  <ListBoxItem key={k} value={k} textValue={k} className="font-mono">
                    {k}{k === song.key ? ' (orig)' : ''}
                  </ListBoxItem>
                ))}
              </Select>

              <Button
                size="sm"
                variant={showDiagrams ? "flat" : "light"}
                color={showDiagrams ? "primary" : "default"}
                onPress={() => setShowDiagrams(!showDiagrams)}
                className="h-8 min-w-unit-8 px-2 font-bold text-xs"
              >
                Chords
              </Button>

              <Popover placement="bottom-end" backdrop="blur">
                <PopoverTrigger>
                  <Button isIconOnly size="sm" variant="light" className="h-8 w-8 text-lg font-serif">Aa</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2 w-64 space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-default-400 uppercase tracking-widest px-1">Layout</span>
                      <ButtonGroup size="sm" variant="flat" fullWidth>
                        <Button
                          className={cols === 'auto' ? "bg-primary text-primary-foreground font-bold" : ""}
                          onPress={() => setCols('auto')}
                        >Auto</Button>
                        <Button
                          className={cols === 1 ? "bg-primary text-primary-foreground font-bold" : ""}
                          onPress={() => setCols(1)}
                        >1 col</Button>
                        <Button
                          className={cols === 2 ? "bg-primary text-primary-foreground font-bold" : ""}
                          onPress={() => setCols(2)}
                        >2 col</Button>
                      </ButtonGroup>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-default-400 uppercase tracking-widest px-1">Size</span>
                      <ButtonGroup size="sm" variant="flat" fullWidth>
                        {[{ l: 'S', v: 0.88 }, { l: 'M', v: 1 }, { l: 'L', v: 1.14 }].map(({ l, v }) => (
                          <Button
                            key={l}
                            className={size === v ? "bg-primary text-primary-foreground font-bold" : ""}
                            onPress={() => setSize(v)}
                          >{l}</Button>
                        ))}
                      </ButtonGroup>
                    </div>
                    {onEdit && (
                      <>
                        <Separator />
                        <Button size="sm" variant="flat" fullWidth onPress={onEdit} className="font-bold">Edit Song</Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          {compact && navOverride && <div>{navOverride}</div>}
        </div>
         
        <div className="mt-2">
          <StructureRibbon structure={song.structure || []} compact />
        </div>

        {!compact && !scrolled && capo > 0 && (
          <div className="mt-2">
            <MetaPill label="Capo" value={`${capo} → ${transposeKey(song.key, chordTranspose)} shapes`} highlight />
          </div>
        )}

        {!compact && navOverride && !scrolled && (
          <div className="mt-2">
            {navOverride}
          </div>
        )}

        {showDiagrams && uniqueChords.length > 0 && (
          <ScrollShadow orientation="horizontal" className="flex gap-4 py-2 mt-2 border-t border-divider hide-scrollbar">
            {uniqueChords.map(chord => (
              <div key={chord} className="bg-content2/50 rounded-lg p-1 border border-divider">
                <ChordDiagram chord={chord} size={70} />
                <div className="text-[10px] font-mono font-bold text-center mt-0.5 text-warning">{chord}</div>
              </div>
            ))}
          </ScrollShadow>
        )}
      </header>

      <main
        className={`p-6 ${cols === 'auto' ? 'chart-auto-cols' : ''}`}
        style={{
          ...(cols !== 'auto' && {
            display: isExplicit2Col ? 'grid' : 'block',
            gridTemplateColumns: isExplicit2Col ? '1fr 1fr' : '1fr',
          }),
          gap: 20,
          transform: `scale(${size})`, transformOrigin: 'top left',
          width: size !== 1 ? `${100 / size}%` : '100%',
        }}
      >
        <div className="space-y-6">
          {song.sections.slice(0, mid).map((sec, i) => (
            <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[i]} />
          ))}
        </div>
        {(isExplicit2Col || cols === 'auto') && (
          <div className="space-y-6">
            {song.sections.slice(mid).map((sec, i) => (
              <SectionBlock key={i} section={sec} transpose={chordTranspose} modulateOffset={sectionModOffsets[mid + i] || 0} showInlineNotes={showInlineNotes} inlineNoteStyle={inlineNoteStyle} displayRole={displayRole} collapsed={collapsedSections[mid + i]} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
