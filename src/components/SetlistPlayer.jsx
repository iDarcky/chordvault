import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { transposeKey, sectionStyle } from '../music';
import ChartView from './ChartView';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

export default function SetlistPlayer({
  setlist, songs, onBack, defaultColumns, defaultFontSize,
  showInlineNotes, inlineNoteStyle, displayRole, duplicateSections
}) {
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

  // Auto-scroll song strip
  useEffect(() => {
    const container = songBarRef.current;
    if (!container) return;
    const activeBtn = container.children[idx];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [idx]);

  // Keyboard / Bluetooth pedal navigation
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
      <div className="p-10 text-center text-accents-4 text-sm font-sans">
        No items in setlist
      </div>
    );
  }

  const cur = resolved[idx];

  const nav = (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-accents-4 font-mono uppercase tracking-widest mr-1">
        {idx + 1} / {resolved.length}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={goPrev}
        disabled={idx === 0}
        className="w-8 h-8 p-0 min-h-0"
      >
        &#9664;
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={goNext}
        disabled={idx === resolved.length - 1}
        className="w-8 h-8 p-0 min-h-0"
      >
        &#9654;
      </Button>
    </div>
  );

  const progress = (
    <div className="flex gap-1 px-6 pt-2 pb-1 bg-background">
      {resolved.map((r, i) => {
        const color = r.isBreak
          ? '#666666'
          : sectionStyle(r.song.sections?.[0]?.type || 'Verse').b;
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              "flex-1 h-1 rounded-full transition-all duration-200 cursor-pointer border-none",
              i === idx ? "h-1.5 opacity-100" : i < idx ? "opacity-40" : "opacity-10"
            )}
            style={{ backgroundColor: i === idx ? color : (i < idx ? color : '#888888') }}
          />
        );
      })}
    </div>
  );

  const songBar = (
    <div
      ref={songBarRef}
      className="flex gap-2 px-6 py-2 bg-background border-b border-accents-2 overflow-x-auto hide-scrollbar scroll-smooth"
    >
      {resolved.map((r, i) => {
        const active = i === idx;
        if (r.isBreak) {
          return (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-geist border transition-all cursor-pointer min-h-0",
                active ? "bg-accents-1 border-accents-3" : "bg-transparent border-transparent text-accents-4"
              )}
            >
              <span className="font-mono text-[10px] font-bold opacity-50">{i + 1}</span>
              <span className={cn(
                "text-xs font-bold uppercase tracking-tight italic",
                active ? "text-foreground" : "text-accents-4"
              )}>
                {r.label || 'Break'}
              </span>
            </button>
          );
        }
        const s = sectionStyle(r.song.sections?.[0]?.type || 'Verse');
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-geist border transition-all cursor-pointer min-h-0",
              active ? "bg-accents-1 border-accents-3" : "bg-transparent border-transparent"
            )}
            style={active ? { borderColor: `${s.b}44`, backgroundColor: `${s.b}10` } : {}}
          >
            <span className="font-mono text-[10px] font-bold" style={{ color: active ? s.d : '#999' }}>
              {i + 1}
            </span>
            <span className={cn(
              "text-xs font-bold truncate max-w-[120px] tracking-tight uppercase",
              active ? "text-foreground" : "text-accents-4"
            )}>
              {r.song.title}
            </span>
            <Badge variant="outline" className={cn(
              "font-mono text-[9px] h-4 px-1 border-none bg-transparent",
              active ? "text-geist-link" : "text-accents-3"
            )}>
              {transposeKey(r.song.key, r.transpose)}
            </Badge>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-background min-h-screen font-sans pt-[env(safe-area-inset-top,0px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 bg-background">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="p-2 -ml-2 text-accents-4 hover:text-foreground">
            &#8592;
          </button>
          <span className="text-xs font-bold text-accents-5 uppercase tracking-widest truncate">
            {setlist.name}
          </span>
        </div>
        {nav}
      </div>

      {progress}
      {songBar}

      {cur.note && (
        <div className="px-6 mt-2">
          <div className="p-3 rounded-geist bg-geist-warning/10 border border-geist-warning/20 text-geist-warning text-[11px] font-bold uppercase tracking-wider leading-relaxed">
            {cur.note}
          </div>
        </div>
      )}

      {cur.isBreak ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 min-h-[50vh] animate-in fade-in zoom-in-95 duration-300">
          <Badge variant="outline" className="mb-4 font-mono tracking-[0.2em] px-4 py-1 border-accents-3 text-accents-4">
            INTERVAL
          </Badge>
          <div className="text-4xl font-black text-foreground tracking-tighter mb-4 text-center italic">
            {cur.label || 'Break'}
          </div>
          {cur.duration > 0 && (
            <div className="text-xl font-mono text-accents-4 mb-10">
              {cur.duration} MIN
            </div>
          )}
          <div className="mt-6">
            <Button size="lg" onClick={goNext} className="h-14 px-10 rounded-full font-bold tracking-widest">
              NEXT ITEM &rarr;
            </Button>
          </div>
        </div>
      ) : (
        <ChartView
          song={{ ...cur.song, key: transposeKey(cur.song.key, cur.transpose) }}
          onBack={onBack}
          navOverride={null} // Nav is already in the player header
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
    </div>
  );
}
