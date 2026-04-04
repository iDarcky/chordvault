import { useState, useMemo, useRef } from 'react';
import { transposeKey } from '../music';
import PageHeader from './PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist,
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const fileRef = useRef(null);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [setlists]);

  const all = useMemo(() => {
    return [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [setlists]);

  const formatDate = (date) =>
    new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  const renderSetlistRow = (sl, i, arr) => {
    const songCount = sl.items?.length || 0;
    return (
      <div
        key={sl.id}
        onClick={() => onViewSetlist(sl)}
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer hover:bg-accents-1 transition-colors group",
          i < arr.length - 1 ? "border-b border-accents-2" : ""
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate group-hover:text-foreground">
            {sl.name || 'Untitled Setlist'}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-accents-5">
            <span className="font-medium text-foreground">{formatDate(sl.date)}</span>
            {sl.service && (
              <>
                <span className="text-accents-3">&middot;</span>
                <span className="bg-accents-1 px-1.5 py-0.5 rounded border border-accents-2 text-[10px] font-bold uppercase">{sl.service}</span>
              </>
            )}
            <span className="text-accents-3">&middot;</span>
            <span className="font-mono">
              {songCount} song{songCount !== 1 ? 's' : ''}
            </span>
          </div>
          {songCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {sl.items.slice(0, 5).map((it, idx) => {
                if (it.type === 'break') {
                  return (
                    <Badge key={idx} variant="outline" className="text-[10px] h-5 bg-accents-1/50 border-accents-2 italic font-normal">
                      {it.label || 'Break'}
                    </Badge>
                  );
                }
                const song = songs.find(s => s.id === it.songId);
                if (!song) return null;
                return (
                  <Badge key={idx} variant="outline" className="text-[10px] h-5 gap-1.5 bg-background border-accents-2 group-hover:border-accents-3 transition-colors">
                    <span className="font-mono font-bold text-geist-link">
                      {transposeKey(song.key, it.transpose)}
                    </span>
                    <span className="max-w-[80px] truncate">{song.title}</span>
                  </Badge>
                );
              })}
              {sl.items.length > 5 && (
                <span className="text-[10px] text-accents-3 font-bold flex items-center px-1">
                  +{sl.items.length - 5} MORE
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
          className="shrink-0 ml-4 h-8 px-3 text-[11px] font-bold tracking-tight"
        >
          LIVE
        </Button>
      </div>
    );
  };

  const renderSection = (label, items) => (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1 font-mono">
        {label}
      </h2>
      <div className="border border-accents-2 rounded-geist bg-background overflow-hidden shadow-sm">
        {items.map((sl, i) => renderSetlistRow(sl, i, items))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Setlists" />

      <div className="px-6 pb-24">
        {setlists.length === 0 ? (
          <div className="text-center py-24 text-accents-4 text-sm border-2 border-dashed border-accents-2 rounded-geist">
            No setlists yet. Tap + to create one.
          </div>
        ) : (
          <>
            {upcoming.length > 0 && renderSection('Upcoming', upcoming)}
            {all.length > 0 && renderSection('All', all)}
          </>
        )}
      </div>

      {/* FAB */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-[90] bg-background/50 backdrop-blur-sm"
        />
      )}
      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-[100]">
        {fabOpen && (
          <div className="flex flex-col items-end gap-3 animate-in slide-in-from-bottom-2 fade-in">
            <Button onClick={() => { setFabOpen(false); onNewSetlist(); }} className="rounded-full shadow-lg border border-accents-2 px-6">
              New Setlist
            </Button>
            <Button onClick={() => { setFabOpen(false); fileRef.current?.click(); }} variant="secondary" className="rounded-full shadow-lg border border-accents-2 px-6 bg-background">
              Import .zip
            </Button>
          </div>
        )}
        <Button
          onClick={() => setFabOpen(prev => !prev)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl transition-transform duration-200",
            fabOpen ? "rotate-45" : "rotate-0"
          )}
        >
          <span className="text-2xl leading-none">+</span>
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".zip"
        onChange={e => {
          if (e.target.files[0]) onImportSetlist(e.target.files[0]);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}
