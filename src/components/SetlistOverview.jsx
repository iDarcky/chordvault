import React, { useMemo } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Separator,
  ButtonGroup,
  ScrollShadow
} from "@heroui/react";
import { transposeKey } from '../music';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const getSong = (id) => songs.find(s => s.id === id);

  const { songCount, breakCount, totalDuration } = useMemo(() => {
    let sc = 0, bc = 0, dur = 0;
    for (const it of setlist.items) {
      if (it.type === 'break') {
        bc++;
        dur += it.duration || 0;
      } else {
        sc++;
        const s = getSong(it.songId);
        if (s) {
          const bpm = s.tempo || 120;
          dur += Math.round(240 / bpm * (s.sections?.length || 1));
        }
      }
    }
    return { songCount: sc, breakCount: bc, totalDuration: dur };
  }, [setlist, songs]);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button isIconOnly variant="light" size="sm" onPress={onBack} className="text-default-500">
            <span className="text-xl">←</span>
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-foreground truncate max-w-[150px] sm:max-w-none">
            {setlist.name || 'Untitled Setlist'}
          </h1>
        </div>
        <div className="flex gap-1 sm:gap-2">
          <ButtonGroup size="sm" variant="flat">
            <Button onPress={onExport} className="font-bold">Export</Button>
            <Button onPress={onEdit} className="font-bold">Edit</Button>
          </ButtonGroup>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            className="font-bold px-6"
            onPress={onPlay}
          >
            Live
          </Button>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
        <Chip color="primary" variant="flat" size="sm" className="font-bold uppercase tracking-wider h-6">
          {setlist.service || 'Service'}
        </Chip>
        <span className="text-sm font-semibold text-default-600">{dateStr}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs font-mono text-default-400">
          {songCount} song{songCount !== 1 ? 's' : ''}
          {breakCount > 0 && ` + ${breakCount} break${breakCount !== 1 ? 's' : ''}`}
          {totalDuration > 0 && ` · ~${totalDuration} min`}
        </span>
      </div>

      <div className="px-6 pb-24 space-y-3">
        {setlist.items.map((item, idx) => {
          const isBreak = item.type === 'break';
          const song = !isBreak ? getSong(item.songId) : null;

          if (!isBreak && !song) return null;
          const displayKey = !isBreak ? transposeKey(song.key, item.transpose) : '';

          return (
            <Card key={idx} shadow="sm" className="bg-content1 border-none">
              <CardContent className="p-4 flex flex-row items-center gap-4">
                <span className="font-mono text-lg font-bold text-default-200 w-6 flex-shrink-0">
                  {idx + 1}
                </span>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreak ? 'bg-default-100 text-default-400' : 'bg-warning-50 text-warning'}`}>
                  {isBreak ? (
                    <span className="text-xl">⏸</span>
                  ) : (
                    <span className="font-mono font-bold text-lg">{displayKey}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold truncate ${isBreak ? 'italic text-default-500' : 'text-foreground'}`}>
                      {isBreak ? (item.label || 'Break') : song.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {!isBreak && (
                      <span className="text-xs text-default-400 uppercase font-semibold truncate">
                        {song.artist}
                      </span>
                    )}
                    {isBreak && item.duration > 0 && (
                      <Chip size="sm" variant="flat" className="h-4 px-1 text-[9px] font-mono">
                        {item.duration} MIN
                      </Chip>
                    )}
                    {item.note && (
                      <span className="text-[11px] text-primary italic truncate">
                        {isBreak ? '' : ' · '}{item.note}
                      </span>
                    )}
                  </div>
                </div>

                {!isBreak && (item.transpose !== 0 || (item.capo || 0) > 0) && (
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    {item.transpose !== 0 && (
                      <Chip size="xs" variant="flat" color="warning" className="h-4 text-[9px] font-bold">
                        {song.key} → {displayKey}
                      </Chip>
                    )}
                    {(item.capo || 0) > 0 && (
                      <Chip size="xs" variant="flat" color="primary" className="h-4 text-[9px] font-bold">
                        CAPO {item.capo}
                      </Chip>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
