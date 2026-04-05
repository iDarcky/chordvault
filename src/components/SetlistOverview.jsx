import { cn } from '../lib/utils';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import Card from './ui/Card';

export default function SetlistOverview({
  setlist, songs, onBack, onEdit, onExport, onPlay, onDeleteSetlist
}) {
  const setlistSongs = (setlist.items || [])
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="min-h-screen">
      <PageHeader title={setlist.name || 'Untitled'}>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="brand" size="sm" onClick={onPlay}>Play</Button>
          <Button variant="secondary" size="sm" onClick={onBack}>&times;</Button>
        </div>
      </PageHeader>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-12">
        <div className="space-y-2 border-b border-[var(--geist-border)] pb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--accents-4)]">Service Date</h2>
          <div className="text-2xl font-black text-[var(--geist-foreground)] tracking-tight">{dateStr}</div>
          <div className="text-xs font-mono font-bold text-brand uppercase tracking-widest py-1 px-3 bg-brand/10 border border-brand/20 rounded inline-block mt-2">
            {setlist.service || 'Main Service'}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] flex items-center gap-3">
            Set Order <span className="h-[1px] flex-1 bg-[var(--geist-border)]" />
          </h3>

          <div className="space-y-3">
            {setlistSongs.map((song, i) => (
              <Card key={song.id + i} className="p-4 flex items-center gap-6 group">
                <div className="text-2xl font-black font-mono text-[var(--accents-2)] group-hover:text-brand transition-colors">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-[var(--geist-foreground)] truncate tracking-tight">{song.title}</div>
                  <div className="text-xs text-[var(--accents-5)] mt-0.5">{song.artist}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="font-mono text-xs font-bold text-brand">{song.key}</div>
                  <div className="font-mono text-[9px] text-[var(--accents-4)] uppercase tracking-widest">{song.tempo} BPM</div>
                </div>
              </Card>
            ))}

            {setlistSongs.length === 0 && (
              <div className="text-center py-20 bg-[var(--accents-1)] border border-dashed border-[var(--geist-border)] rounded-geist-card text-[var(--accents-5)] text-sm italic">
                No songs added to this setlist yet.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50" onClick={() => {
            if (confirm('Delete this setlist?')) {
              onDeleteSetlist && onDeleteSetlist(setlist.id);
            }
          }}>Delete Setlist</Button>
        </div>
      </div>
    </div>
  );
}
