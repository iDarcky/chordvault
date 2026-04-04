import { useState, useMemo } from 'react';
import { sectionStyle } from '../music';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

export default function Dashboard({
  songs, setlists,
  onSelectSong, onNewSong,
  onNewSetlist, onViewSetlist, onPlaySetlist,
  onGoLibrary, onGoSetlists,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);

  const recentSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      .slice(0, 5);
  }, [songs]);

  const upcomingSetlists = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return setlists
      .filter(sl => sl.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [setlists]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { songs: [], setlists: [] };
    const q = searchQuery.toLowerCase();
    return {
      songs: songs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      ).slice(0, 10),
      setlists: setlists.filter(sl =>
        (sl.name || '').toLowerCase().includes(q) ||
        (sl.service || '').toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [songs, setlists, searchQuery]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Setlists MD">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSearch(true)}
          className="bg-accents-1 text-accents-5 border-accents-2 font-normal"
        >
          <SearchIcon size={14} className="mr-2" /> Search
        </Button>
      </PageHeader>

      <div className="px-6 pb-20 space-y-8">
        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1">
              Upcoming
            </h2>
            <div className="space-y-4">
              {upcomingSetlists.map((sl) => {
                const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                return (
                  <Card key={sl.id} className="cursor-pointer hover:border-foreground transition-colors overflow-hidden group" onClick={() => onViewSetlist(sl)}>
                    <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold group-hover:text-foreground">
                          {sl.name || 'Untitled'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-accents-5">
                          <span>{dateStr}</span>
                          {sl.service && (
                            <>
                              <span className="text-accents-3">&middot;</span>
                              <span>{sl.service}</span>
                            </>
                          )}
                          <span className="text-accents-3">&middot;</span>
                          <span className="font-mono">
                            {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
                        className="flex-shrink-0"
                      >
                        Live
                      </Button>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1">
              Recent
            </h2>
            <div className="divide-y border border-accents-2 rounded-geist bg-background overflow-hidden">
              {recentSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accents-1 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {song.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-accents-5">
                      <span>{song.artist}</span>
                      <span className="text-accents-3">&middot;</span>
                      <span className="font-mono font-bold text-geist-link">
                        {song.key}
                      </span>
                      {song.tempo && (
                        <>
                          <span className="text-accents-3">&middot;</span>
                          <span className="font-mono">{song.tempo} bpm</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 h-5 bg-accents-1 border-accents-2">
                    {song.sections?.length || 0} SECTIONS
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="secondary" onClick={onGoLibrary} className="h-14 font-semibold text-sm">
            Full Library
          </Button>
          <Button variant="secondary" onClick={onGoSetlists} className="h-14 font-semibold text-sm">
            All Setlists
          </Button>
        </div>
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
            <Button onClick={() => { setFabOpen(false); onNewSong(); }} className="rounded-full shadow-lg border border-accents-2">
              New Song
            </Button>
            <Button onClick={() => { setFabOpen(false); onNewSetlist(); }} className="rounded-full shadow-lg border border-accents-2">
              New Setlist
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

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] bg-background animate-in slide-in-from-right duration-200">
          <div className="flex items-center gap-4 p-4 border-b border-accents-2">
            <button onClick={closeSearch} className="p-2 text-accents-5 hover:text-foreground">
              &#8592;
            </button>
            <Input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search songs, setlists..."
              className="flex-1 bg-accents-1"
            />
          </div>

          <div className="flex-1 overflow-auto p-6">
            {!searchQuery.trim() && (
              <div className="text-center py-20 text-accents-4 text-sm">
                Search across all songs and setlists
              </div>
            )}

            {searchQuery.trim() && searchResults.songs.length === 0 && searchResults.setlists.length === 0 && (
              <div className="text-center py-20 text-accents-4 text-sm">
                No results found
              </div>
            )}

            {searchResults.songs.length > 0 && (
              <div className="mb-8">
                <div className="text-[10px] font-bold text-accents-3 uppercase tracking-widest mb-3 font-mono">
                  Songs
                </div>
                <div className="space-y-2">
                  {searchResults.songs.map(song => {
                    const s = song.sections?.length
                      ? sectionStyle(song.sections[0].type)
                      : { b: '#6b7280', d: '#9ca3af' };
                    return (
                      <div
                        key={song.id}
                        onClick={() => { closeSearch(); onSelectSong(song); }}
                        className="flex items-center gap-3 p-3 rounded-geist border border-accents-2 bg-background hover:bg-accents-1 transition-colors cursor-pointer"
                      >
                        <div
                          className="w-10 h-10 rounded-geist flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-accents-2"
                          style={{ background: `${s.b}15`, color: s.d }}
                        >
                          {song.key}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate text-foreground">
                            {song.title}
                          </div>
                          <div className="text-xs text-accents-4 truncate">
                            {song.artist}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {searchResults.setlists.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-accents-3 uppercase tracking-widest mb-3 font-mono">
                  Setlists
                </div>
                <div className="space-y-2">
                  {searchResults.setlists.map(sl => {
                    const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    });
                    return (
                      <div
                        key={sl.id}
                        onClick={() => { closeSearch(); onViewSetlist(sl); }}
                        className="p-3 rounded-geist border border-accents-2 bg-background hover:bg-accents-1 transition-colors cursor-pointer"
                      >
                        <div className="text-sm font-semibold text-foreground">
                          {sl.name || 'Untitled'}
                        </div>
                        <div className="text-xs text-accents-4 mt-0.5">
                          {dateStr}{sl.service ? ` \u00B7 ${sl.service}` : ''} &middot; {sl.items?.length || 0} song{(sl.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
