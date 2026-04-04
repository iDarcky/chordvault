import { useState, useMemo } from 'react';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import { sectionStyle } from '../music';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export default function Library({ songs, onSelectSong, onNewSong, onImportSong }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title'); // 'title' | 'artist' | 'newest' | 'key'

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
    else if (sort === 'newest') res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return res;
  }, [songs, search, sort]);

  const handleFileImport = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => onImportSong(ev.target.result);
      reader.readAsText(file);
    });
    e.target.value = null; // reset for next time
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Library">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => document.getElementById('import-input').click()}>
            Import
          </Button>
          <input
            id="import-input"
            type="file"
            accept=".md"
            multiple
            hidden
            onChange={handleFileImport}
          />
          <Button size="sm" onClick={onNewSong}>
            + New
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-24">
        {/* Search & Sort */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 text-accents-4" size={16} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search songs, artists, keys..."
              className="pl-10 bg-accents-1 border-accents-2 focus-visible:bg-background transition-colors h-11"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['title', 'artist', 'newest', 'key'].map((s) => (
              <Badge
                key={s}
                variant={sort === s ? 'default' : 'outline'}
                onClick={() => setSort(s)}
                className="cursor-pointer capitalize px-3 py-1 text-[11px] font-bold tracking-tight h-7 border-accents-2"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Song List */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-24 text-accents-4 text-sm border-2 border-dashed border-accents-2 rounded-geist">
            {songs.length === 0 ? "No songs in library yet." : "No songs match your search."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSongs.map((song) => {
              const s = song.sections?.length
                ? sectionStyle(song.sections[0].type)
                : { b: '#6b7280', d: '#9ca3af' };
              return (
                <Card
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accents-1 transition-colors border-accents-2 group"
                >
                  <div
                    className="w-12 h-12 rounded-geist flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-accents-2 transition-transform group-hover:scale-105"
                    style={{ background: `${s.b}15`, color: s.d }}
                  >
                    {song.key}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold truncate group-hover:text-foreground">
                      {song.title}
                    </div>
                    <div className="text-xs text-accents-5 mt-0.5 truncate">
                      {song.artist}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {song.tempo && (
                      <span className="text-[10px] font-mono text-accents-4 bg-accents-1 px-1.5 py-0.5 rounded-geist border border-accents-2">
                        {song.tempo}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-accents-3 tracking-tighter uppercase">
                      {song.sections?.length || 0} SEC
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-accents-3 font-mono uppercase tracking-widest">
          {filteredSongs.length} SONG{filteredSongs.length !== 1 ? 'S' : ''} TOTAL
        </div>
      </div>
    </div>
  );
}
