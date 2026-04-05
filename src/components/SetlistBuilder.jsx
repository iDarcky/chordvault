import { useState, useMemo } from 'react';
import { generateId } from '../parser';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import { cn } from '../lib/utils';

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  const [service, setService] = useState(setlist?.service || '');
  const [selected, setSelected] = useState(setlist?.items || []);
  const [search, setSearch] = useState('');

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const handleSave = () => {
    const sl = {
      id: setlist?.id || generateId(),
      name: name || 'Untitled Setlist',
      date,
      service,
      items: selected,
      updatedAt: Date.now(),
      createdAt: setlist?.createdAt || Date.now(),
    };
    onSave(sl);
  };

  const toggleSong = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const removeSongAt = (idx) => {
    setSelected(prev => prev.filter((_, i) => i !== idx));
  };

  const selectedSongs = selected
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--geist-background)] overflow-hidden">
      <PageHeader title={setlist ? 'Edit Setlist' : 'New Setlist'}>
        <div className="flex gap-2">
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => confirm('Delete setlist?') && onDelete(setlist.id)} className="text-red-500 hover:bg-red-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onBack}>Cancel</Button>
          <Button variant="brand" size="sm" onClick={handleSave}>Save</Button>
        </div>
      </PageHeader>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full max-w-[1400px] mx-auto">
        {/* Left Side: Selected Songs */}
        <div className="flex-1 flex flex-col border-r border-[var(--geist-border)] overflow-hidden bg-[var(--accents-1)]">
          <div className="p-6 space-y-4 border-b border-[var(--geist-border)] bg-[var(--geist-background)] shadow-sm relative z-20">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accents-4)] block mb-2">Setlist Title</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sunday Morning Worship" className="text-sm h-10" />
              </div>
              <div className="w-full sm:w-40">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accents-4)] block mb-2">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm h-10" />
              </div>
              <div className="w-full sm:w-40">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accents-4)] block mb-2">Service</label>
                <Input value={service} onChange={e => setService(e.target.value)} placeholder="Main Service" className="text-sm h-10" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-2">Current Set</h3>
            {selectedSongs.map((song, i) => (
              <Card key={song.id + i} className="p-4 flex items-center gap-4 group">
                <div className="text-lg font-black font-mono text-[var(--accents-2)]">{(i + 1).toString().padStart(2, '0')}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{song.title}</div>
                  <div className="text-[10px] text-[var(--accents-4)] font-mono uppercase tracking-widest">{song.key}</div>
                </div>
                <button onClick={() => removeSongAt(i)} className="text-[var(--accents-4)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </Card>
            ))}
            {selectedSongs.length === 0 && (
              <div className="text-center py-20 border border-dashed border-[var(--geist-border)] rounded-geist-card text-[var(--accents-4)] text-sm italic">
                Choose songs from the library to add to your set.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Song Library */}
        <div className="w-full md:w-[450px] flex flex-col overflow-hidden bg-[var(--geist-background)] shadow-2xl relative z-30">
          <div className="p-6 border-b border-[var(--geist-border)]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)] mb-4">Song Library</h3>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter library..." className="h-10 text-sm" />
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredSongs.map(song => {
              const isSelected = selected.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => toggleSong(song.id)}
                  className={cn(
                    "p-3 rounded-geist-button border transition-all cursor-pointer flex items-center gap-3",
                    isSelected
                      ? "bg-brand/5 border-brand ring-1 ring-brand/10 shadow-sm shadow-brand/5"
                      : "bg-transparent border-[var(--geist-border)] hover:bg-[var(--accents-1)]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-brand border-brand" : "border-[var(--geist-border)]"
                  )}>
                    {isSelected && <span className="text-[10px] text-white font-bold">&#10003;</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-semibold truncate", isSelected && "text-brand")}>{song.title}</div>
                    <div className="text-[10px] text-[var(--accents-4)]">{song.artist} · <span className="font-mono">{song.key}</span></div>
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
