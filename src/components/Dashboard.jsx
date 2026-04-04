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
          className="h-9 px-3 bg-accents-1 text-accents-5 border-accents-2 font-bold tracking-widest text-[10px]"
        >
          <SearchIcon size={14} className="mr-2" /> SEARCH
        </Button>
      </PageHeader>

      <div className="px-6 pb-20 space-y-12 max-w-5xl mx-auto mt-8">
        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <SectionHeader>Upcoming Performance</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSetlists.map((sl) => {
                const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                return (
                  <Card key={sl.id} className="cursor-pointer group hover:shadow-geist transition-all active:scale-[0.99]" onClick={() => onViewSetlist(sl)}>
                    <CardHeader className="p-6 flex-row items-center justify-between space-y-0">
                      <div className="min-w-0">
                        <CardTitle className="text-xl font-black group-hover:text-geist-link transition-colors truncate">
                          {sl.name || 'Untitled'}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                           <Badge variant="outline" className="text-[9px] font-black tracking-widest border-accents-2 bg-accents-1">
                             {dateStr.toUpperCase()}
                           </Badge>
                           <span className="text-[10px] font-bold text-accents-4 uppercase tracking-widest font-mono">
                             {sl.items?.length || 0} ITEMS
                           </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
                        className="flex-shrink-0 rounded-full h-8 px-4 font-black"
                      >
                        LIVE
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
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <SectionHeader>Recently Updated</SectionHeader>
            <div className="grid grid-cols-1 gap-1">
              {recentSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-accents-1 transition-all rounded-xl group border border-transparent hover:border-accents-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold truncate group-hover:translate-x-1 transition-transform tracking-tight">
                      {song.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-accents-4 font-medium">{song.artist}</span>
                      <span className="text-accents-2 font-mono">&middot;</span>
                      <span className="font-mono font-black text-[10px] text-geist-link tracking-tighter uppercase">
                        KEY {song.key}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black px-2 h-5 bg-accents-1 border-accents-2 tracking-tighter">
                    {song.sections?.length || 0} SECTIONS
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-4 pt-4 animate-in fade-in duration-1000">
          <Button variant="secondary" onClick={onGoLibrary} className="h-16 rounded-2xl font-black text-sm tracking-widest border-2">
            LIBRARY
          </Button>
          <Button variant="secondary" onClick={onGoSetlists} className="h-16 rounded-2xl font-black text-sm tracking-widest border-2">
            SETLISTS
          </Button>
        </div>
      </div>

      {/* FAB */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-[90] bg-background/40 backdrop-blur-sm animate-in fade-in duration-300"
        />
      )}
      <div className="fixed bottom-24 right-8 flex flex-col items-end gap-4 z-[100]">
        {fabOpen && (
          <div className="flex flex-col items-end gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <Button onClick={() => { setFabOpen(false); onNewSong(); }} className="rounded-full shadow-2xl h-12 px-8 font-black text-xs">
              NEW SONG
            </Button>
            <Button onClick={() => { setFabOpen(false); onNewSetlist(); }} className="rounded-full shadow-2xl h-12 px-8 font-black text-xs">
              NEW SETLIST
            </Button>
          </div>
        )}
        <Button
          onClick={() => setFabOpen(prev => !prev)}
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform",
            fabOpen ? "rotate-45 scale-90 bg-accents-2 text-foreground" : "rotate-0 hover:scale-110"
          )}
        >
          <span className="text-3xl leading-none font-light">+</span>
        </Button>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 p-4 md:p-20">
          <Card className="w-full max-w-2xl mx-auto h-full flex flex-col shadow-2xl rounded-3xl overflow-hidden border-2">
            <div className="flex items-center gap-4 p-6 border-b border-accents-2 bg-accents-1/30">
              <SearchIcon size={20} className="text-accents-5" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find anything..."
                className="flex-1 bg-transparent border-none p-0 text-xl font-bold focus-visible:ring-0 placeholder:text-accents-3"
              />
              <Button variant="ghost" onClick={closeSearch} className="h-10 w-10 p-0 rounded-full font-black">
                ✕
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-background">
              {!searchQuery.trim() && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <SearchIcon size={64} className="mb-4" />
                  <div className="text-sm font-black tracking-[0.2em] uppercase">Ready to search</div>
                </div>
              )}

              {searchQuery.trim() && searchResults.songs.length === 0 && searchResults.setlists.length === 0 && (
                <div className="text-center py-20 text-accents-4 text-sm font-bold">
                  NO RESULTS FOUND
                </div>
              )}

              {searchResults.songs.length > 0 && (
                <div className="mb-10">
                  <SectionHeader>Songs</SectionHeader>
                  <div className="space-y-1">
                    {searchResults.songs.map(song => {
                      const s = song.sections?.length
                        ? sectionStyle(song.sections[0].type)
                        : { b: '#666', d: '#999' };
                      return (
                        <div
                          key={song.id}
                          onClick={() => { closeSearch(); onSelectSong(song); }}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accents-1 transition-all cursor-pointer border border-transparent hover:border-accents-2"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 border border-accents-2 shadow-sm"
                            style={{ background: `${s.b}15`, color: s.d }}
                          >
                            {song.key}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black text-foreground uppercase tracking-tight">
                              {song.title}
                            </div>
                            <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mt-0.5">
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
                  <SectionHeader>Setlists</SectionHeader>
                  <div className="space-y-1">
                    {searchResults.setlists.map(sl => (
                      <div
                        key={sl.id}
                        onClick={() => { closeSearch(); onViewSetlist(sl); }}
                        className="p-4 rounded-2xl hover:bg-accents-1 transition-all cursor-pointer border border-transparent hover:border-accents-2"
                      >
                        <div className="text-sm font-black text-foreground uppercase tracking-tight">
                          {sl.name || 'Untitled'}
                        </div>
                        <div className="text-[10px] font-bold text-accents-4 mt-1 uppercase tracking-widest">
                          {sl.service} &middot; {sl.items?.length || 0} SONGS
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h2 className="text-[10px] font-black text-accents-4 uppercase tracking-[0.3em] mb-6 px-1 font-mono">
      {children}
    </h2>
  );
}
