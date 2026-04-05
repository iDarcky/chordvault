import { useState, useMemo, useRef } from 'react';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import { cn } from '../lib/utils';

export default function Library({
  songs, onSelectSong, onNewSong, onImportSong,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const [tagFilter, setTagFilter] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fileRef = useRef(null);

  const allTags = useMemo(() => {
    const tags = new Set();
    songs.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [songs]);

  const filtered = useMemo(() => {
    let list = songs;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }
    if (tagFilter.length > 0) {
      list = list.filter(s =>
        tagFilter.some(t => (s.tags || []).includes(t))
      );
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sort === 'key') sorted.sort((a, b) => a.key.localeCompare(b.key));
    return sorted;
  }, [songs, query, sort, tagFilter]);

  const grouped = useMemo(() => {
    const groups = [];
    let currentLabel = null;
    for (const song of filtered) {
      let label;
      if (sort === 'title') {
        label = (song.title[0] || '#').toUpperCase();
      } else if (sort === 'artist') {
        label = song.artist || 'Unknown';
      } else {
        label = song.key || '?';
      }
      if (label !== currentLabel) {
        groups.push({ label, songs: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].songs.push(song);
    }
    return groups;
  }, [filtered, sort]);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  const toggleTag = (tag) => {
    setTagFilter(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Library" />

      <div className="px-6 py-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 h-10"
            />
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accents-4)]" />
          </div>

          {allTags.length > 0 && (
            <div className="relative">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowTagDropdown(v => !v)}
                className={cn(
                  "gap-2",
                  tagFilter.length > 0 && "border-brand text-brand"
                )}
              >
                {tagFilter.length > 0 && (
                  <span className="flex -space-x-1.5 overflow-hidden">
                    {tagFilter.slice(0, 3).map(t => (
                      <span key={t} className="w-2 h-2 rounded-full bg-brand ring-2 ring-[var(--geist-background)]" />
                    ))}
                  </span>
                )}
                <span className="text-sm">Tags</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={cn("transition-transform", showTagDropdown && "rotate-180")}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>

              {showTagDropdown && (
                <>
                  <div onClick={() => setShowTagDropdown(false)} className="fixed inset-0 z-49" />
                  <div className="absolute right-0 mt-2 bg-[var(--geist-background)] border border-[var(--geist-border)] rounded-geist-card py-2 z-50 min-w-[200px] shadow-2xl animate-in slide-in-from-top-2 fade-in">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--accents-1)] transition-colors text-left text-sm"
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                          tagFilter.includes(tag) ? "bg-brand border-brand" : "border-[var(--geist-border)]"
                        )}>
                          {tagFilter.includes(tag) && <span className="text-[10px] text-white font-bold">&#10003;</span>}
                        </div>
                        <span className={cn(tagFilter.includes(tag) ? "text-brand font-medium" : "text-[var(--geist-foreground)]")}>{tag}</span>
                      </button>
                    ))}
                    {tagFilter.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--geist-border)] px-2">
                        <Button variant="ghost" size="sm" className="w-full text-[var(--accents-5)]" onClick={() => setTagFilter([])}>Clear all</Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'title', label: 'Title' },
            { id: 'artist', label: 'Artist' },
            { id: 'key', label: 'Key' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                "px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-all border",
                sort === s.id
                  ? "bg-[var(--geist-foreground)] text-[var(--geist-background)] border-[var(--geist-foreground)]"
                  : "bg-transparent text-[var(--accents-5)] border-transparent hover:border-[var(--geist-border)]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-32 max-w-4xl mx-auto">
        {filtered.length === 0 && (
          <div className="text-center py-32 bg-[var(--accents-1)] border border-dashed border-[var(--geist-border)] rounded-geist-card">
            <p className="text-[var(--accents-5)] text-sm italic">
              {songs.length === 0
                ? 'No songs yet. Tap + to create or import.'
                : 'No songs match your search.'}
            </p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.label} className="mb-10">
            <h3 className={cn(
              "sticky top-[72px] z-20 py-2 bg-[var(--geist-background)]/80 backdrop-blur-sm text-xs font-bold uppercase tracking-[0.2em] text-[var(--accents-4)] mb-4",
              sort === 'key' && "font-mono"
            )}>
              {group.label}
            </h3>
            <div className="space-y-3">
              {group.songs.map((song) => (
                <Card key={song.id} onClick={() => onSelectSong(song)} className="p-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold group-hover:text-brand transition-colors truncate">
                        {song.title}
                      </div>
                      <div className="text-xs text-[var(--accents-5)] mt-1 flex items-center gap-2 flex-wrap">
                        <span>{song.artist}</span>
                        <span className="opacity-30">&middot;</span>
                        <span className="font-mono text-[10px] font-bold text-brand">{song.key}</span>
                        {song.tempo && (
                          <>
                            <span className="opacity-30">&middot;</span>
                            <span className="font-mono text-[10px]">{song.tempo} BPM</span>
                          </>
                        )}
                        {(song.tags || []).length > 0 && (
                          <>
                            <span className="opacity-30">&middot;</span>
                            <div className="flex gap-1.5">
                              {song.tags.map(t => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accents-1)] border border-[var(--geist-border)] font-medium text-[var(--accents-5)]">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--accents-4)] opacity-0 group-hover:opacity-100 transition-opacity">
                      VIEW &rarr;
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB - Vercel Style */}
      <div className="fixed bottom-24 right-6 z-90 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-in slide-in-from-bottom-4 fade-in">
            <Button variant="secondary" size="md" className="shadow-xl border-[var(--accents-2)]" onClick={() => { setFabOpen(false); onNewSong(); }}>
              New Song
            </Button>
            <Button variant="secondary" size="md" className="shadow-xl border-[var(--accents-2)]" onClick={() => { setFabOpen(false); fileRef.current?.click(); }}>
              Import .md
            </Button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          className={cn(
            "w-14 h-14 rounded-full bg-brand text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-100",
            fabOpen ? "rotate-45" : "rotate-0"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} className="hidden" />
    </div>
  );
}
