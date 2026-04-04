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
    if (!name.trim()) { alert('Please enter a repository name'); return; }
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
      <PageHeader title={setlist ? 'Configure Setlist' : 'Initialize Setlist'}>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onBack} className="h-9 px-4 hidden md:flex">
            CANCEL
          </Button>
          {setlist && onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { if (confirm('Purge this performance record?')) onDelete(setlist.id); }}
              className="text-geist-error hover:bg-geist-error/5 border-geist-error/20 h-9 px-4"
            >
              PURGE
            </Button>
          )}
          <Button size="sm" onClick={handleSave} className="px-6 font-black rounded-full h-9 shadow-geist">
            COMMIT
          </Button>
        </div>
      </PageHeader>

      <div className="px-6 pb-32 max-w-5xl mx-auto mt-8 space-y-12">
        {/* Identity Engine */}
        <section>
          <SectionHeader>Repository Metadata</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <FieldLabel>PERFORMANCE IDENTIFIER</FieldLabel>
              <Input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="E.G. SUNDAY SERVICE"
                className="bg-accents-1 border-accents-2 h-12 text-sm font-black uppercase tracking-tight"
              />
            </div>
            <div>
              <FieldLabel>EXECUTION DATE</FieldLabel>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-accents-1 border-accents-2 h-12 font-mono font-bold" />
            </div>
            <div>
              <FieldLabel>SERVICE COMPONENT</FieldLabel>
              <div className="flex bg-accents-1 p-1 rounded-2xl border border-accents-2 h-12 shadow-inner">
                {['Morning', 'Evening', 'Special'].map(s => (
                  <button
                    key={s}
                    onClick={() => setService(s)}
                    className={cn(
                      "flex-1 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-none cursor-pointer",
                      service === s ? "bg-background shadow-geist text-foreground" : "bg-transparent text-accents-4 hover:text-accents-6"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sequencing Engine */}
        <section>
          <div className="flex items-center justify-between border-b border-accents-2 pb-4 mb-8">
            <SectionHeader className="mb-0">Component Sequence</SectionHeader>
            <div className="text-[10px] font-black text-accents-4 font-mono uppercase tracking-[0.2em] bg-accents-1 px-4 py-1.5 rounded-full border border-accents-2">
              {songCount} SONGS &middot; {breakCount} BREAKS &middot; ~{totalDuration} MIN
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const isBreak = item.type === 'break';
              const song = !isBreak ? getSong(item.songId) : null;
              const s = song ? sectionStyle(song.sections?.[0]?.type || 'Verse') : null;

              return (
                <div key={idx} className="flex items-stretch bg-background border border-accents-2 rounded-2xl overflow-hidden group shadow-geist-sm transition-all hover:shadow-geist">
                  <div className="w-12 bg-accents-1/30 border-r border-accents-2 flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => idx > 0 && moveItem(idx, -1)} className="p-1.5 hover:text-foreground border-none bg-transparent cursor-pointer disabled:opacity-10" disabled={idx === 0}>
                      &#9650;
                    </button>
                    <span className="text-xs font-black font-mono tracking-tighter">{String(idx + 1).padStart(2, '0')}</span>
                    <button onClick={() => idx < items.length - 1 && moveItem(idx, 1)} className="p-1.5 hover:text-foreground border-none bg-transparent cursor-pointer disabled:opacity-10" disabled={idx === items.length - 1}>
                      &#9660;
                    </button>
                  </div>

                  <div className="flex-1 p-6 flex items-center gap-6 min-w-0 bg-background/50">
                    {isBreak ? (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-accents-2 flex items-center justify-center text-accents-4 text-2xl font-black">
                          &middot;
                        </div>
                        <Input
                          value={item.label}
                          onChange={e => updateBreakField(idx, 'label', e.target.value)}
                          placeholder="IDENTIFY BREAK (E.G. PRAYER)"
                          className="h-10 text-base font-black bg-transparent border-none p-0 focus-visible:ring-0 italic placeholder:text-accents-2"
                        />
                      </>
                    ) : song ? (
                      <>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-black shrink-0 border-2 border-accents-2 transition-transform group-hover:scale-110"
                          style={{ background: `${s.b}15`, color: s.d, borderColor: `${s.b}30` }}
                        >
                          {transposeKey(song.key, item.transpose)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-black truncate text-foreground uppercase tracking-tight">{song.title}</div>
                          <div className="text-[10px] font-bold text-accents-4 uppercase tracking-[0.2em] truncate mt-1">{song.artist}</div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3 px-6 bg-accents-1/10 border-l border-accents-2 shrink-0">
                    {!isBreak && song && (
                      <>
                        <div className="flex flex-col items-center">
                           <span className="text-[8px] font-black text-accents-3 mb-1 font-mono tracking-widest">KEY</span>
                           <select
                             value={transposeKey(song.key, item.transpose)}
                             onChange={e => updateTranspose(idx, semitonesBetween(song.key, e.target.value))}
                             className="h-8 px-2 bg-background border border-accents-2 rounded-lg text-[11px] font-black font-mono focus:border-foreground outline-none cursor-pointer"
                           >
                             {ALL_KEYS.map(k => (
                               <option key={k} value={k}>{k}{k === song.key ? '*' : ''}</option>
                             ))}
                           </select>
                        </div>
                        <div className="flex flex-col items-center">
                           <span className="text-[8px] font-black text-accents-3 mb-1 font-mono tracking-widest">CAPO</span>
                           <select
                             value={item.capo || 0}
                             onChange={e => updateCapo(idx, parseInt(e.target.value))}
                             className="h-8 px-2 bg-background border border-accents-2 rounded-lg text-[11px] font-black font-mono focus:border-foreground outline-none cursor-pointer"
                           >
                             {[0,1,2,3,4,5,6,7,8,9].map(n => (
                               <option key={n} value={n}>{n}</option>
                             ))}
                           </select>
                        </div>
                      </>
                    )}
                    {isBreak && (
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-accents-3 mb-1 font-mono tracking-widest">MIN</span>
                        <Input
                          type="number"
                          min="0"
                          value={item.duration || ''}
                          onChange={e => updateBreakField(idx, 'duration', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="h-8 w-14 text-center text-[11px] font-black font-mono p-1 bg-background"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-accents-3 mb-1 font-mono tracking-widest px-1">NOTES</span>
                       <Input
                         value={item.note}
                         onChange={e => isBreak ? updateBreakField(idx, 'note', e.target.value) : updateNote(idx, e.target.value)}
                         placeholder="..."
                         className="h-8 w-28 text-[10px] bg-background border-accents-2 font-bold"
                       />
                    </div>
                    <button onClick={() => removeItem(idx)} className="p-2 ml-2 text-accents-3 hover:text-geist-error border-none bg-transparent cursor-pointer transition-colors active:scale-90">
                      &#10005;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acquisition Module */}
          <div className="pt-10">
            {adding ? (
              <Card className="border-foreground/30 shadow-2xl animate-in zoom-in-95 rounded-3xl overflow-hidden border-2">
                <CardHeader className="p-6 border-b border-accents-2 flex-row items-center gap-4 space-y-0 bg-accents-1/50">
                  <SearchIcon size={20} className="text-accents-4" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                    placeholder="LOCATE SONG IN LIBRARY..."
                    className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-lg font-black uppercase tracking-tight placeholder:text-accents-2"
                  />
                </CardHeader>
                <div className="max-h-[400px] overflow-auto divide-y divide-accents-1 bg-background">
                  {available.map(song => {
                    const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
                    return (
                      <button
                        key={song.id}
                        onClick={() => addSong(song)}
                        className="w-full flex items-center gap-4 p-5 hover:bg-accents-1 transition-all text-left border-none bg-transparent cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-accents-1 border border-accents-2 flex items-center justify-center font-mono text-xs font-black" style={{ color: s.d }}>
                          {song.key}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black truncate text-foreground uppercase tracking-tight">{song.title}</div>
                          <div className="text-[10px] text-accents-4 uppercase font-black tracking-widest mt-0.5">{song.artist}</div>
                        </div>
                      </button>
                    );
                  })}
                  {available.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center opacity-30">
                       <SearchIcon size={48} className="mb-4" />
                       <div className="text-xs font-black uppercase tracking-widest">Repository result negative</div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-accents-2 bg-accents-1/30">
                  <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="w-full h-10 text-accents-4 font-black uppercase tracking-[0.2em] text-[10px]">
                    ABORT SELECTION
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => setAdding(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-3 h-24 rounded-3xl border-2 border-dashed border-accents-2 text-accents-3 hover:border-foreground hover:text-foreground transition-all font-black uppercase tracking-[0.2em] text-[10px] bg-accents-1/10 hover:bg-accents-1/20 cursor-pointer shadow-inner"
                >
                  <span className="text-2xl opacity-40">+</span>
                  ADD SONG COMPONENT
                </button>
                <button
                  onClick={addBreak}
                  className="flex-1 flex flex-col items-center justify-center gap-3 h-24 rounded-3xl border-2 border-dashed border-accents-2 text-accents-3 hover:border-foreground hover:text-foreground transition-all font-black uppercase tracking-[0.2em] text-[10px] bg-accents-1/10 hover:bg-accents-1/20 cursor-pointer shadow-inner"
                >
                  <span className="text-2xl opacity-40">&middot;</span>
                  ADD TRANSITION BREAK
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="h-32" />
    </div>
  );
}

function SectionHeader({ children, className }) {
  return (
    <h2 className={cn("text-[10px] font-black text-accents-4 uppercase tracking-[0.4em] mb-8 px-1 font-mono italic", className)}>
      {children}
    </h2>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="text-[9px] font-black text-accents-3 uppercase tracking-[0.3em] mb-2 block font-mono px-1">
      {children}
    </label>
  );
}
