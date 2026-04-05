import { useState, useEffect, useRef, useMemo } from 'react';
import ChartView from './ChartView';
import Button from './ui/Button';
import { cn } from '../lib/utils';

export default function SetlistPlayer({
  setlist, songs, onBack,
  defaultColumns = 1, defaultFontSize = 14,
  showInlineNotes = true, inlineNoteStyle = 'dashes',
  displayRole = 'leader', duplicateSections = 'full'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const setlistSongs = (setlist.items || [])
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean);

  const currentSong = setlistSongs[currentIndex];

  const goNext = () => setCurrentIndex(prev => Math.min(prev + 1, setlistSongs.length - 1));
  const goPrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setlistSongs.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--geist-background)] overflow-hidden">
      {/* Setlist Progress Strip */}
      <div className="h-16 flex items-stretch border-b border-[var(--geist-border)] bg-[var(--geist-background)]/80 backdrop-blur-md sticky top-0 z-[110] px-4 overflow-x-auto no-scrollbar gap-1 shadow-sm">
        {setlistSongs.map((song, i) => (
          <button
            key={song.id + i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "flex-shrink-0 min-w-[140px] px-4 flex items-center gap-3 transition-all border-b-2",
              currentIndex === i
                ? "border-brand bg-brand/5"
                : "border-transparent text-[var(--accents-4)] hover:text-[var(--accents-8)] hover:bg-[var(--accents-1)]"
            )}
          >
            <span className={cn(
              "font-mono text-[10px] font-black",
              currentIndex === i ? "text-brand" : "opacity-30"
            )}>
              {(i + 1).toString().padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0 text-left">
              <div className={cn(
                "text-[10px] font-black uppercase tracking-tight truncate",
                currentIndex === i ? "text-[var(--geist-foreground)]" : ""
              )}>
                {song.title}
              </div>
              <div className="text-[9px] font-mono text-brand opacity-60 font-bold">{song.key}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto pb-40 relative scroll-smooth">
        {currentSong ? (
          <ChartView
            key={currentSong.id + currentIndex}
            song={currentSong}
            onBack={onBack}
            onEdit={() => {}}
            isPreview={false}
            defaultColumns={defaultColumns}
            defaultFontSize={defaultFontSize}
            showInlineNotes={showInlineNotes}
            inlineNoteStyle={inlineNoteStyle}
            displayRole={displayRole}
            duplicateSections={duplicateSections}
          />
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center text-[var(--accents-5)] italic text-sm">
            Setlist is empty or songs are missing.
          </div>
        )}
      </div>

      {/* Floating Controls - Vercel Dark Style */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[120] animate-in slide-in-from-bottom-8">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 disabled:opacity-20 transition-all active:scale-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div className="h-6 w-[1px] bg-white/10" />

        <div className="flex flex-col items-center min-w-[90px]">
          <div className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">SONG</div>
          <div className="text-sm font-black text-white font-mono flex items-baseline gap-1">
            {currentIndex + 1} <span className="opacity-30 text-[10px]">/ {setlistSongs.length}</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/10" />

        <button
          onClick={goNext}
          disabled={currentIndex === setlistSongs.length - 1}
          className="w-10 h-10 flex items-center justify-center text-white hover:opacity-70 disabled:opacity-20 transition-all active:scale-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        <button
          onClick={onBack}
          className="ml-2 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-all hover:bg-white/10 rounded-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
}
