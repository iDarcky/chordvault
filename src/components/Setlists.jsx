import { useState, useMemo, useRef } from 'react';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import { cn } from '../lib/utils';

export default function Setlists({
  songs, setlists,
  onViewSetlist, onPlaySetlist,
  onNewSetlist, onImportSetlist
}) {
  const [query, setQuery] = useState('');
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return setlists;
    const q = query.toLowerCase();
    return setlists.filter(sl =>
      (sl.name || '').toLowerCase().includes(q) ||
      (sl.service || '').toLowerCase().includes(q)
    );
  }, [setlists, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  return (
    <div className="min-h-screen">
      <PageHeader title="Setlists" />

      <div className="px-6 py-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex gap-2 items-center">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search setlists..."
            className="flex-1"
          />
          <Button variant="secondary" onClick={() => onNewSetlist()} className="whitespace-nowrap">New Setlist</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
          {sorted.map(sl => {
            const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
            return (
              <Card key={sl.id} onClick={() => onViewSetlist(sl)} className="p-6 group relative overflow-hidden">
                <div className="flex flex-col h-full justify-between gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accents-4)]">
                        {dateStr}
                      </span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--accents-1)] border border-[var(--geist-border)] text-[var(--accents-5)] uppercase">
                        {sl.service || 'Default'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--geist-foreground)] truncate group-hover:text-brand transition-colors">
                      {sl.name || 'Untitled'}
                    </h3>
                    <p className="text-xs text-[var(--accents-4)] mt-1">
                      {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="brand" className="flex-1 text-xs py-1.5" onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}>
                      Play Live
                    </Button>
                    <Button variant="secondary" className="flex-1 text-xs py-1.5" onClick={e => { e.stopPropagation(); onViewSetlist(sl); }}>
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {sorted.length === 0 && (
            <div className="md:col-span-2 text-center py-32 bg-[var(--accents-1)] border border-dashed border-[var(--geist-border)] rounded-geist-card">
              <p className="text-[var(--accents-5)] text-sm italic">
                {setlists.length === 0
                  ? 'No setlists yet. Create one to get started.'
                  : 'No setlists match your search.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-24 right-6">
        <Button variant="secondary" size="md" className="shadow-2xl rounded-full px-6 py-3 border-[var(--accents-2)]" onClick={() => fileRef.current?.click()}>
          Import .zip
        </Button>
      </div>
      <input ref={fileRef} type="file" accept=".zip" onChange={e => onImportSetlist(e.target.files[0])} className="hidden" />
    </div>
  );
}
