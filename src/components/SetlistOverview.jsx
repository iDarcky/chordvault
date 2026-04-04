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
          <Button variant="secondary" size="sm" onClick={onBack} className="md:flex hidden">
            Back
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport} className="h-9 px-3">
            Export
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit} className="h-9 px-3">
            Edit
          </Button>
          <Button size="sm" onClick={onPlay} className="h-9 px-4 font-bold tracking-tight">
            LIVE
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-24">
        {/* Meta Section */}
        <Card className="mb-8 bg-accents-1 border-none shadow-none">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <Badge variant="default" className="bg-foreground text-background border-none px-3 py-1 text-[11px] font-bold tracking-widest h-7">
              {setlist.service || 'SERVICE'}
            </Badge>
            <div className="text-sm font-semibold text-foreground">{dateStr}</div>
            <div className="text-xs font-bold text-accents-4 uppercase tracking-widest font-mono">
              {songCount} SONGS &middot; {totalDuration} MIN
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-accents-3 uppercase tracking-widest font-mono ml-1 mb-2">
            Order of Service
          </h2>
          {setlist.items.map((item, idx) => {
            if (item.type === 'break') {
              return (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-geist border border-accents-2 bg-accents-1/30 italic group transition-colors hover:border-accents-3">
                  <div className="w-6 text-center font-mono text-xs font-bold text-accents-3">
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-geist bg-accents-2 flex items-center justify-center text-accents-4 text-xl font-bold">
                    &middot;
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-accents-5">
                      {item.label || 'Break'}
                    </div>
                    {item.duration > 0 && (
                      <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono mt-1">
                        {item.duration} MIN
                      </div>
                    )}
                  </div>
                  {item.note && (
                    <div className="text-xs text-accents-4 opacity-70 truncate max-w-[200px]">
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
              <div key={idx} className="flex items-center gap-4 p-4 rounded-geist border border-accents-2 bg-background group transition-colors hover:border-foreground">
                <div className="w-6 text-center font-mono text-xs font-bold text-accents-3">
                  {idx + 1}
                </div>
                <div
                  className="w-10 h-10 rounded-geist flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-accents-2 group-hover:scale-105 transition-transform"
                  style={{ background: `${s.b}15`, color: s.d }}
                >
                  {displayKey}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">
                    {song.title}
                  </div>
                  <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono mt-1">
                    {song.artist} &middot; {song.tempo} BPM &middot; {song.time}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.transpose !== 0 && (
                    <Badge variant="outline" className="font-mono text-[10px] border-geist-link/20 text-geist-link bg-geist-link/5">
                      {song.key} &rarr; {displayKey}
                    </Badge>
                  )}
                  {(item.capo || 0) > 0 && (
                    <Badge variant="outline" className="font-mono text-[10px] border-accents-3 text-foreground bg-accents-1">
                      CAPO {item.capo}
                    </Badge>
                  )}
                  {item.note && (
                    <div className="text-xs text-accents-4 italic truncate max-w-[120px] ml-2">
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
  );
}
