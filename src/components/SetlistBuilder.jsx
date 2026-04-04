import { useState, useMemo } from 'react';
import { transposeKey, sectionStyle, ALL_KEYS, semitonesBetween } from '../music';
import { generateId } from '../parser';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import { cn } from '../lib/utils';

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  const [service, setService] = useState(setlist?.service || 'Morning');
  const [items, setItems] = useState(setlist?.items || []);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const addSong = (song) => {
    setItems(p => [...p, { songId: song.id, note: '', transpose: 0, capo: 0 }]);
    setAdding(false);
    setSearch('');
  };
  const addBreak = () => {
    setItems(p => [...p, { type: 'break', label: '', note: '', duration: 0 }]);
  };
  const updateBreakField = (idx, field, value) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const moveItem = (idx, dir) => {
    setItems(p => {
      const n = [...p];
      const t = n[idx];
      n[idx] = n[idx + dir];
      n[idx + dir] = t;
      return n;
    });
  };
  const updateNote = (idx, note) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, note } : it));
  const updateTranspose = (idx, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, transpose: val } : it));
  const updateCapo = (idx, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, capo: val } : it));
  const getSong = (id) => songs.find(s => s.id === id);

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a setlist name'); return; }
    onSave({
      id: setlist?.id || generateId(),
      name: name.trim(), date, service, items,
      createdAt: setlist?.createdAt || Date.now(),
    });
  };

  const songCount = items.filter(it => it.type !== 'break').length;
  const breakCount = items.filter(it => it.type === 'break').length;
  const totalDuration = items.reduce((sum, it) => {
    if (it.type === 'break') return sum + (it.duration || 0);
    const s = getSong(it.songId);
    if (!s) return sum;
    const bpm = s.tempo || 120;
    return sum + Math.round(240 / bpm * s.sections.length);
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title={setlist ? 'Edit Setlist' : 'New Setlist'}>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onBack} className="md:flex hidden">
            Back
          </Button>
          {setlist && onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { if (confirm('Delete this setlist?')) onDelete(setlist.id); }}
              className="text-geist-error hover:bg-geist-error/10 border-geist-error/20 h-9"
            >
              Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave} className="px-6 font-bold uppercase tracking-widest text-[11px] h-9">
            Save
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-24 space-y-8 mt-6">
        {/* Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-1.5 block font-mono">Setlist Name</label>
            <Input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Sunday Morning Service"
              className="bg-accents-1 border-accents-2 h-11"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-1.5 block font-mono">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-accents-1 border-accents-2 h-11" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-1.5 block font-mono">Service</label>
            <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2 h-11">
              {['Morning', 'Evening', 'Special'].map(s => (
                <button
                  key={s}
                  onClick={() => setService(s)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase rounded transition-all",
                    service === s ? "bg-background shadow-sm text-foreground" : "text-accents-4 hover:text-accents-6"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between border-b border-accents-2 pb-2">
          <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">
            Order of Service
          </h2>
          <div className="text-[10px] font-bold text-accents-4 font-mono">
            {songCount} SONGS &middot; {breakCount} BREAKS &middot; ~{totalDuration} MIN
          </div>
        </div>

        {/* Draggable Items List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isBreak = item.type === 'break';
            const song = !isBreak ? getSong(item.songId) : null;
            const s = song ? sectionStyle(song.sections?.[0]?.type || 'Verse') : null;

            return (
              <div key={idx} className="flex items-stretch bg-background border border-accents-2 rounded-geist overflow-hidden group">
                {/* Reorder controls */}
                <div className="w-10 bg-accents-1/50 border-r border-accents-2 flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => idx > 0 && moveItem(idx, -1)} className="p-1 hover:text-foreground border-none bg-transparent cursor-pointer disabled:opacity-20" disabled={idx === 0}>
                    &#9650;
                  </button>
                  <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                  <button onClick={() => idx < items.length - 1 && moveItem(idx, 1)} className="p-1 hover:text-foreground border-none bg-transparent cursor-pointer disabled:opacity-20" disabled={idx === items.length - 1}>
                    &#9660;
                  </button>
                </div>

                <div className="flex-1 p-4 flex items-center gap-4 min-w-0">
                  {isBreak ? (
                    <>
                      <div className="w-10 h-10 rounded-geist bg-accents-2 flex items-center justify-center text-accents-4 text-xl">
                        &middot;
                      </div>
                      <Input
                        value={item.label}
                        onChange={e => updateBreakField(idx, 'label', e.target.value)}
                        placeholder="Label (e.g. Prayer)"
                        className="h-9 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0 italic"
                      />
                    </>
                  ) : song ? (
                    <>
                      <div
                        className="w-10 h-10 rounded-geist flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-accents-2"
                        style={{ background: `${s.b}15`, color: s.d }}
                      >
                        {transposeKey(song.key, item.transpose)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate text-foreground">{song.title}</div>
                        <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest truncate">{song.artist}</div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 p-3 bg-accents-1/20 border-l border-accents-2 shrink-0">
                  {!isBreak && song && (
                    <>
                      <select
                        value={transposeKey(song.key, item.transpose)}
                        onChange={e => updateTranspose(idx, semitonesBetween(song.key, e.target.value))}
                        className="h-8 px-2 bg-background border border-accents-2 rounded text-[10px] font-bold font-mono focus:border-geist-link outline-none"
                      >
                        {ALL_KEYS.map(k => (
                          <option key={k} value={k}>{k}{k === song.key ? ' (ORIG)' : ''}</option>
                        ))}
                      </select>
                      <select
                        value={item.capo || 0}
                        onChange={e => updateCapo(idx, parseInt(e.target.value))}
                        className="h-8 px-2 bg-background border border-accents-2 rounded text-[10px] font-bold font-mono focus:border-geist-link outline-none"
                      >
                        {[0,1,2,3,4,5,6,7,8,9].map(n => (
                          <option key={n} value={n}>C\u00B7{n}</option>
                        ))}
                      </select>
                    </>
                  )}
                  {isBreak && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        value={item.duration || ''}
                        onChange={e => updateBreakField(idx, 'duration', parseInt(e.target.value) || 0)}
                        placeholder="MIN"
                        className="h-8 w-12 text-center text-[10px] font-bold font-mono p-1 bg-background"
                      />
                    </div>
                  )}
                  <Input
                    value={item.note}
                    onChange={e => isBreak ? updateBreakField(idx, 'note', e.target.value) : updateNote(idx, e.target.value)}
                    placeholder="Note..."
                    className="h-8 w-24 text-[10px] bg-background border-accents-2"
                  />
                  <button onClick={() => removeItem(idx)} className="p-2 text-accents-3 hover:text-geist-error border-none bg-transparent cursor-pointer">
                    &#10005;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Controls */}
        <div className="pt-4">
          {adding ? (
            <Card className="border-geist-link/30 shadow-xl animate-in zoom-in-95">
              <CardHeader className="p-4 border-b border-accents-2 flex-row items-center gap-3 space-y-0 bg-accents-1/50">
                <SearchIcon size={16} className="text-accents-4" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  placeholder="Search your library..."
                  className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-sm font-bold"
                />
              </CardHeader>
              <div className="max-h-[300px] overflow-auto divide-y divide-accents-1">
                {available.map(song => {
                  const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
                  return (
                    <button
                      key={song.id}
                      onClick={() => addSong(song)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accents-1 transition-colors text-left border-none bg-transparent cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-accents-1 border border-accents-2 flex items-center justify-center font-mono text-[10px] font-bold" style={{ color: s.d }}>
                        {song.key}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-foreground">{song.title}</div>
                        <div className="text-[10px] text-accents-4 uppercase font-bold tracking-tight">{song.artist}</div>
                      </div>
                    </button>
                  );
                })}
                {available.length === 0 && (
                  <div className="p-10 text-center text-accents-4 text-xs font-bold uppercase tracking-widest font-mono">
                    No songs found
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-accents-2 bg-accents-1/30">
                <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="w-full text-accents-4 font-bold uppercase tracking-widest text-[10px]">
                  CANCEL
                </Button>
              </div>
            </Card>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setAdding(true)}
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-geist border-2 border-dashed border-accents-2 text-accents-4 hover:border-accents-3 hover:text-accents-5 transition-all font-bold uppercase tracking-widest text-[11px] bg-transparent cursor-pointer"
              >
                + ADD SONG
              </button>
              <button
                onClick={addBreak}
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-geist border-2 border-dashed border-accents-2 text-accents-4 hover:border-accents-3 hover:text-accents-5 transition-all font-bold uppercase tracking-widest text-[11px] bg-transparent cursor-pointer"
              >
                + ADD BREAK
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}
