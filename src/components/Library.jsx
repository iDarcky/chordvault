import { useState, useMemo } from 'react';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import { sectionStyle } from '../music';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

export default function Library({ songs, onSelectSong, onNewSong, onImportSong }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title');

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase();
    let res = songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
    );

    if (sort === 'title') res.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') res.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sort === 'key') res.sort((a, b) => a.key.localeCompare(b.key));
    else if (sort === 'newest') res.sort((a, b) => (b.updatedAt || 0) - (a.createdAt || 0));

    return res;
  }, [songs, search, sort]);

  const handleFileImport = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => onImportSong(ev.target.result);
      reader.readAsText(file);
    });
    e.target.value = null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Song Library">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => document.getElementById('import-input').click()} className="h-9 px-4">
            IMPORT
          </Button>
          <input
            id="import-input"
            type="file"
            accept=".md"
            multiple
            className="hidden"
            onChange={handleFileImport}
          />
          <Button size="sm" onClick={onNewSong} className="h-9 px-5 rounded-full font-black">
            + NEW SONG
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-32 max-w-4xl mx-auto mt-8">
        {/* Search & Sort */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="relative group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-accents-3 group-focus-within:text-foreground transition-colors" size={18} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, artist, or key..."
              className="pl-14 bg-accents-1/50 border-accents-2 h-14 text-base font-bold rounded-2xl focus-visible:bg-background focus-visible:shadow-geist transition-all placeholder:text-accents-3"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-1">
             <span className="text-[10px] font-black text-accents-4 uppercase tracking-[0.2em] mr-4 font-mono">Sort By</span>
            {['title', 'artist', 'newest', 'key'].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border-none cursor-pointer",
                  sort === s
                    ? "bg-foreground text-background shadow-md"
                    : "bg-accents-1 text-accents-4 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Song List */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-accents-2 rounded-3xl bg-accents-1/10">
             <div className="text-4xl mb-4 opacity-20">🎼</div>
            <div className="text-sm font-black text-accents-3 uppercase tracking-widest">
              {songs.length === 0 ? "Your library is empty" : "No matching songs found"}
            </div>
            <Button variant="ghost" onClick={() => setSearch('')} className="mt-4 text-[10px] font-black">CLEAR SEARCH</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSongs.map((song) => {
              const s = song.sections?.length
                ? sectionStyle(song.sections[0].type)
                : { b: '#666', d: '#999' };
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="p-5 flex items-center gap-6 cursor-pointer hover:bg-accents-1 transition-all border border-transparent hover:border-accents-2 rounded-2xl group active:scale-[0.99]"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-base font-black shrink-0 border-2 border-accents-2 transition-all group-hover:scale-110 group-hover:shadow-geist group-hover:border-foreground"
                    style={{ background: `${s.b}15`, color: s.d }}
                  >
                    {song.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-black tracking-tight text-foreground group-hover:text-geist-link transition-colors truncate">
                      {song.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-accents-5 font-bold uppercase tracking-wide">{song.artist}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {song.tempo && (
                      <Badge variant="outline" className="font-mono text-[9px] font-black tracking-tighter text-accents-4 bg-accents-1 border-accents-2 h-5 px-1.5">
                        {song.tempo} BPM
                      </Badge>
                    )}
                    <span className="text-[10px] font-black text-accents-3 tracking-[0.1em] uppercase font-mono">
                      {song.sections?.length || 0} SECS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-accents-2 text-center text-[10px] font-black text-accents-3 font-mono uppercase tracking-[0.4em]">
          End of Library &middot; {filteredSongs.length} SONGS TOTAL
        </div>
      </div>
    </div>
  );
}
