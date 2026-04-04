import { useMemo, useRef } from 'react';
import { transposeKey } from '../music';
import PageHeader from './PageHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist,
}) {
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
          "flex items-center justify-between p-6 cursor-pointer hover:bg-accents-1 transition-all group",
          i < arr.length - 1 ? "border-b border-accents-2" : ""
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-lg font-black tracking-tight text-foreground uppercase group-hover:text-geist-link transition-colors truncate">
            {sl.name || 'Untitled Setlist'}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-accents-4">
            <Badge variant="outline" className="font-black text-[9px] tracking-widest bg-accents-1 border-accents-2 h-5 px-2">
              {formatDate(sl.date).toUpperCase()}
            </Badge>
            {sl.service && (
              <span className="font-bold text-accents-3 uppercase tracking-widest">{sl.service}</span>
            )}
            <span className="text-accents-2">&middot;</span>
            <span className="font-mono font-bold tracking-tighter">
              {songCount} ITEMS
            </span>
          </div>
          {songCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {sl.items.slice(0, 4).map((it, idx) => {
                if (it.type === 'break') {
                  return (
                    <Badge key={idx} variant="outline" className="text-[9px] h-6 px-3 bg-accents-1 border-accents-2 italic font-medium text-accents-4 rounded-full">
                      {it.label || 'Break'}
                    </Badge>
                  );
                }
                const song = songs.find(s => s.id === it.songId);
                if (!song) return null;
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-accents-2 shadow-sm transition-all group-hover:border-accents-4">
                    <span className="font-mono font-black text-[10px] text-geist-link">
                      {transposeKey(song.key, it.transpose)}
                    </span>
                    <span className="text-[10px] font-bold text-accents-5 truncate max-w-[100px] uppercase tracking-tight">{song.title}</span>
                  </div>
                );
              })}
              {sl.items.length > 4 && (
                <div className="flex items-center justify-center w-8 h-6 rounded-full bg-accents-1 text-[9px] font-black text-accents-3 border border-accents-2">
                  +{sl.items.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
          className="shrink-0 ml-6 rounded-full h-10 px-6 font-black border-2 transition-all group-hover:scale-105 shadow-geist-sm"
        >
          LIVE
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Setlists">
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} className="h-9 px-4">
            IMPORT
          </Button>
          <Button size="sm" onClick={onNewSetlist} className="h-9 px-5 rounded-full font-black">
            + NEW SETLIST
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-32 max-w-4xl mx-auto mt-8">
        {setlists.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-accents-2 rounded-3xl bg-accents-1/10 flex flex-col items-center">
            <div className="text-5xl mb-6 opacity-20">📋</div>
            <div className="text-sm font-black text-accents-3 uppercase tracking-[0.2em] mb-4">No setlists discovered</div>
            <Button size="sm" onClick={onNewSetlist} className="rounded-full px-8">CREATE YOUR FIRST</Button>
          </div>
        ) : (
          <div className="space-y-12">
            {upcoming.length > 0 && (
               <section>
                 <SectionHeader>Upcoming Performance</SectionHeader>
                 <Card className="overflow-hidden bg-background/50 backdrop-blur-sm shadow-none">
                    {upcoming.map((sl, i) => renderSetlistRow(sl, i, upcoming))}
                 </Card>
               </section>
            )}
            {all.length > 0 && (
               <section>
                 <SectionHeader>Performance History</SectionHeader>
                 <Card className="overflow-hidden bg-background/50 backdrop-blur-sm shadow-none opacity-80">
                    {all.map((sl, i) => renderSetlistRow(sl, i, all))}
                 </Card>
               </section>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={e => {
          if (e.target.files[0]) onImportSetlist(e.target.files[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h2 className="text-[10px] font-black text-accents-4 uppercase tracking-[0.3em] mb-6 px-1 font-mono italic">
      {children}
    </h2>
  );
}
