import { useMemo } from 'react';
import { transposeKey, sectionStyle } from '../music';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import PageHeader from './PageHeader';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const getSong = (id) => songs.find(s => s.id === id);

  const { songCount, totalDuration } = useMemo(() => {
    let sc = 0, dur = 0;
    for (const it of setlist.items) {
      if (it.type === 'break') {
        dur += it.duration || 0;
      } else {
        sc++;
        const s = songs.find(s => s.id === it.songId);
        if (s) {
          const bpm = s.tempo || 120;
          dur += Math.round(240 / bpm * s.sections.length);
        }
      }
    }
    return { songCount: sc, totalDuration: dur };
  }, [setlist, songs]);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title={setlist.name || 'Untitled Setlist'}>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onBack} className="h-9 px-4 hidden md:flex">
            BACK
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport} className="h-9 px-4">
            EXPORT
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit} className="h-9 px-4">
            EDIT
          </Button>
          <Button size="sm" onClick={onPlay} className="h-9 px-6 font-black rounded-full shadow-geist active:scale-95">
            INITIATE LIVE
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-32 max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Master Identification Card */}
        <Card className="mb-12 bg-foreground text-background border-none shadow-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-background/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-background/10 backdrop-blur-md flex items-center justify-center font-black text-4xl shadow-inner border border-background/20">
               {songCount}
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-background text-foreground mb-4 font-black tracking-[0.2em] h-6 px-4 rounded-full border-none">
                {setlist.service?.toUpperCase() || 'SERVICE'} PERFORMANCE
              </Badge>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-tight">
                {setlist.name || 'PERFORMANCE REPOSITORY'}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 opacity-60">
                <span className="text-sm font-bold tracking-widest">{dateStr.toUpperCase()}</span>
                <span className="font-mono text-xs">&middot;</span>
                <span className="text-sm font-black font-mono">{totalDuration} MIN TOTAL</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sequencing Engine List */}
        <div className="space-y-4">
          <SectionHeader>Order of Execution</SectionHeader>

          <div className="space-y-2">
            {setlist.items.map((item, idx) => {
              if (item.type === 'break') {
                return (
                  <div key={idx} className="flex items-center gap-6 p-6 rounded-2xl border border-accents-2 bg-accents-1/20 transition-all hover:bg-accents-1 group">
                    <div className="w-8 font-mono text-xs font-black text-accents-3 tracking-tighter">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accents-2 flex items-center justify-center text-accents-4 text-2xl font-black shadow-inner">
                      &middot;
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-black text-accents-5 uppercase tracking-tight italic">
                        {item.label || 'TRANSITION BREAK'}
                      </div>
                      {item.duration > 0 && (
                        <div className="text-[10px] font-black text-accents-3 uppercase tracking-[0.2em] font-mono mt-1">
                          ALLOCATION: {item.duration} MIN
                        </div>
                      )}
                    </div>
                    {item.note && (
                      <div className="text-xs text-accents-4 opacity-70 font-bold uppercase tracking-widest bg-accents-1 px-3 py-1 rounded-full border border-accents-2">
                        {item.note}
                      </div>
                    )}
                  </div>
                );
              }

              const song = getSong(item.songId);
              if (!song) return null;
              const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
              const displayKey = transposeKey(song.key, item.transpose);

              return (
                <div key={idx} className="flex items-center gap-6 p-6 rounded-2xl border border-accents-2 bg-background transition-all hover:border-foreground hover:shadow-geist group active:scale-[0.995]">
                  <div className="w-8 font-mono text-xs font-black text-accents-3 tracking-tighter">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-black shrink-0 border-2 border-accents-2 shadow-sm transition-all group-hover:rotate-3 group-hover:scale-110"
                    style={{ background: `${s.b}15`, color: s.d, borderColor: `${s.b}30` }}
                  >
                    {displayKey}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-geist-link transition-colors truncate">
                      {song.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-accents-4 uppercase tracking-widest">{song.artist}</span>
                      <span className="text-accents-2 font-mono">&middot;</span>
                      <span className="text-[10px] font-black text-accents-4 font-mono">{song.tempo} BPM</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.transpose !== 0 && (
                      <Badge variant="outline" className="font-mono text-[9px] font-black border-geist-link/20 text-geist-link bg-geist-link/5 rounded-full h-6 px-3">
                        {song.key} &rarr; {displayKey}
                      </Badge>
                    )}
                    {(item.capo || 0) > 0 && (
                      <Badge variant="outline" className="font-mono text-[9px] font-black border-foreground text-background bg-foreground rounded-full h-6 px-3">
                        CAPO {item.capo}
                      </Badge>
                    )}
                    {item.note && (
                      <div className="text-[10px] font-black text-accents-3 uppercase tracking-tighter italic border-l border-accents-2 pl-4 py-1 ml-2 hidden md:block">
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h2 className="text-[10px] font-black text-accents-4 uppercase tracking-[0.4em] mb-6 px-1 font-mono italic">
      {children}
    </h2>
  );
}
