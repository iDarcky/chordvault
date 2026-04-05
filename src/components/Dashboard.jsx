import { useState, useMemo } from 'react';
import { sectionStyle } from '../music';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
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
    <div className="min-h-screen">
      <PageHeader title="Setlists MD">
        <Button variant="secondary" size="sm" onClick={() => setShowSearch(true)} className="gap-2 text-[var(--accents-5)]">
          <SearchIcon size={14} />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </PageHeader>

      <div className="px-6 pb-20 max-w-4xl mx-auto space-y-8">
        {/* Upcoming Setlists */}
        {upcomingSetlists.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">
              Upcoming Setlists
            </h2>
            <div className="space-y-3">
              {upcomingSetlists.map((sl) => {
                const dateStr = new Date(sl.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                return (
                  <Card key={sl.id} onClick={() => onViewSetlist(sl)} className="p-4 flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--geist-foreground)] truncate group-hover:text-brand transition-colors">
                        {sl.name || 'Untitled'}
                      </div>
                      <div className="text-xs text-[var(--accents-5)] mt-1 flex items-center gap-2">
                        <span>{dateStr}</span>
                        {sl.service && (
                          <>
                            <span className="opacity-30">&middot;</span>
                            <span>{sl.service}</span>
                          </>
                        )}
                        <span className="opacity-30">&middot;</span>
                        <span className="font-mono text-[10px] opacity-80">
                          {sl.items?.length || 0} songs
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={e => { e.stopPropagation(); onPlaySetlist(sl); }}
                      className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Live
                    </Button>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Songs */}
        {recentSongs.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">
              Recently Edited
            </h2>
            <div className="space-y-3">
              {recentSongs.map((song) => (
                <Card key={song.id} onClick={() => onSelectSong(song)} className="p-4 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--geist-foreground)] truncate group-hover:text-brand transition-colors">
                      {song.title}
                    </div>
                    <div className="text-xs text-[var(--accents-5)] mt-1 flex items-center gap-2">
                      <span>{song.artist}</span>
                      <span className="opacity-30">&middot;</span>
                      <span className="font-mono text-[10px] font-bold text-[var(--chord)] bg-[var(--accents-1)] px-1.5 py-0.5 rounded border border-[var(--geist-border)]">
                        {song.key}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--accents-4)] opacity-0 group-hover:opacity-100 transition-opacity">
                    VIEW &rarr;
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" className="h-20 flex-col gap-2 rounded-geist-card" onClick={onGoLibrary}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span className="text-xs font-semibold uppercase tracking-tight">Full Library</span>
          </Button>
          <Button variant="secondary" className="h-20 flex-col gap-2 rounded-geist-card" onClick={onGoSetlists}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            <span className="text-xs font-semibold uppercase tracking-tight">All Setlists</span>
          </Button>
        </div>
      </div>

      {/* FAB - Vercel Style */}
      <div className="fixed bottom-24 right-6 z-90 flex flex-col items-end gap-3">
        {fabOpen && (
          <div className="flex flex-col items-end gap-2 mb-2 animate-in slide-in-from-bottom-4 fade-in">
            <Button variant="secondary" size="md" className="shadow-xl border-[var(--accents-2)]" onClick={() => { setFabOpen(false); onNewSong(); }}>
              New Song
            </Button>
            <Button variant="secondary" size="md" className="shadow-xl border-[var(--accents-2)]" onClick={() => { setFabOpen(false); onNewSetlist(); }}>
              New Setlist
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

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[200] bg-[var(--geist-background)] flex flex-col animate-in fade-in zoom-in-95">
          <div className="px-6 py-4 flex gap-4 items-center border-b border-[var(--geist-border)] bg-[var(--geist-background)]/80 backdrop-blur-md">
            <button onClick={closeSearch} className="text-[var(--accents-5)] hover:text-[var(--geist-foreground)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div className="relative flex-1">
              <Input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search songs, setlists..."
                className="pl-10 h-11 bg-transparent border-none focus:ring-0 text-base"
              />
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accents-4)]" />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-8">
            {!searchQuery.trim() && (
              <div className="text-center py-20 text-[var(--accents-4)] text-sm italic">
                Search across all songs and setlists
              </div>
            )}

            {searchQuery.trim() && searchResults.songs.length === 0 && searchResults.setlists.length === 0 && (
              <div className="text-center py-20 text-[var(--accents-4)] text-sm">
                No results found
              </div>
            )}

            {searchResults.songs.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4">Songs</h3>
                <div className="space-y-2">
                  {searchResults.songs.map(song => (
                    <Card key={song.id} onClick={() => { closeSearch(); onSelectSong(song); }} className="p-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-geist-button bg-[var(--accents-1)] flex items-center justify-center font-mono text-xs font-bold text-brand border border-[var(--geist-border)]">
                        {song.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{song.title}</div>
                        <div className="text-[10px] text-[var(--accents-5)]">{song.artist}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResults.setlists.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4">Setlists</h3>
                <div className="space-y-2">
                  {searchResults.setlists.map(sl => (
                    <Card key={sl.id} onClick={() => { closeSearch(); onViewSetlist(sl); }} className="p-3">
                      <div className="text-sm font-semibold truncate">{sl.name || 'Untitled'}</div>
                      <div className="text-[10px] text-[var(--accents-5)] mt-1">
                        {sl.date} {sl.service ? ` \u00B7 ${sl.service}` : ''} · {sl.items?.length || 0} songs
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
