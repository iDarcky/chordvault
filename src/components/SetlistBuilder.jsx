import { useState, useMemo } from 'react';
import { generateId } from '../parser';
import { Button } from './ui/Button';
import SetlistMetaForm from './setlist/SetlistMetaForm';
import SetlistItemRow from './setlist/SetlistItemRow';
import SetlistSongPicker from './setlist/SetlistSongPicker';

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  const [service, setService] = useState(setlist?.service || 'Morning');
  const [items, setItems] = useState(setlist?.items || []);
  const [adding, setAdding] = useState(false);

  const addSong = (song) => {
    setItems(p => [...p, { songId: song.id, note: '', transpose: 0, capo: 0 }]);
    setAdding(false);
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
    <div className="min-h-screen bg-[var(--ds-background-200)]">
      {/* Header */}
      <div className="material-header flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="xs" onClick={onBack}>← Back</Button>
          <span className="text-heading-16 text-[var(--ds-gray-1000)]">
            {setlist ? 'Edit Setlist' : 'New Setlist'}
          </span>
        </div>
        <div className="flex gap-2">
          {setlist && onDelete && (
            <Button
              variant="error"
              size="xs"
              onClick={() => { if (confirm('Delete this setlist?')) onDelete(setlist.id); }}
            >
              Delete
            </Button>
          )}
          <Button variant="brand" size="xs" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {/* Meta fields */}
      <SetlistMetaForm
        name={name}
        date={date}
        service={service}
        onNameChange={setName}
        onDateChange={setDate}
        onServiceChange={setService}
      />

      {/* Items list */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-label-13 font-semibold text-[var(--ds-gray-600)]">
            Items ({items.length})
            {breakCount > 0 && (
              <span className="font-normal text-[var(--ds-gray-500)]">
                {' '}({songCount} songs + {breakCount} breaks)
              </span>
            )}
            {totalDuration > 0 && (
              <span className="font-normal text-[var(--ds-gray-500)]">
                {' '}· ~{totalDuration} min est.
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <SetlistItemRow
              key={idx}
              item={item}
              idx={idx}
              totalItems={items.length}
              song={item.type !== 'break' ? getSong(item.songId) : null}
              onMove={moveItem}
              onRemove={removeItem}
              onUpdateNote={updateNote}
              onUpdateTranspose={updateTranspose}
              onUpdateCapo={updateCapo}
              onUpdateBreakField={updateBreakField}
            />
          ))}
        </div>

        {/* Add song / break */}
        {adding ? (
          <SetlistSongPicker
            songs={songs}
            onAddSong={addSong}
            onClose={() => setAdding(false)}
          />
        ) : (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setAdding(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-lg bg-[var(--ds-gray-100)] border border-dashed border-[var(--ds-gray-400)] text-label-12 font-semibold text-[var(--ds-gray-600)] cursor-pointer hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-500)] transition-colors"
            >
              + Add Song
            </button>
            <button
              onClick={addBreak}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-lg bg-[var(--ds-gray-100)] border border-dashed border-[var(--ds-gray-400)] text-label-12 font-semibold text-[var(--ds-gray-600)] cursor-pointer hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-500)] transition-colors"
            >
              + Add Break
            </button>
          </div>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
}
