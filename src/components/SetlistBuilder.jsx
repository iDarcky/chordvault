import { useState, useRef, useCallback } from 'react';
import { generateId } from '../parser';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import SetlistMetaForm from './setlist/SetlistMetaForm';
import SetlistItemRow from './setlist/SetlistItemRow';
import SetlistSongPicker from './setlist/SetlistSongPicker';

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  // Migrate legacy `service` field → tags
  const [tags, setTags] = useState(() => {
    if (setlist?.tags?.length) return setlist.tags;
    if (setlist?.service) return [setlist.service];
    return [];
  });
  const [items, setItems] = useState(setlist?.items || []);

  // Drag state
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const addSong = (song) => {
    setItems(p => [...p, { songId: song.id, note: '', transpose: 0, capo: 0 }]);
  };
  const addBreak = () => {
    setItems(p => [...p, { type: 'break', label: '', note: '', duration: 0 }]);
  };
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const updateNote = (idx, note) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, note } : it));
  const updateTranspose = (idx, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, transpose: val } : it));
  const updateCapo = (idx, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, capo: val } : it));
  const updateBreakField = (idx, field, value) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  const getSong = (id) => songs.find(s => s.id === id);

  // Drag handlers
  const handleDragStart = useCallback((idx) => {
    setDragIdx(idx);
  }, []);

  const handleDragEnter = useCallback((idx) => {
    setDragOverIdx(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIdx(dragIdx => {
      setDragOverIdx(dragOverIdx => {
        if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
          return null;
        }
        setItems(prev => {
          const next = [...prev];
          const [moved] = next.splice(dragIdx, 1);
          next.splice(dragOverIdx, 0, moved);
          return next;
        });
        return null;
      });
      return null;
    });
  }, []);

  // Touch drag for mobile
  const handleTouchStart = useCallback((idx, e) => {
    setDragIdx(idx);
  }, []);

  const handleTouchMove = useCallback((e) => {
    // Determine the element underneath the pointer
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const row = el.closest('[data-drag-idx]');
      if (row) {
        setDragOverIdx(parseInt(row.dataset.dragIdx, 10));
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a setlist name'); return; }
    onSave({
      id: setlist?.id || generateId(),
      name: name.trim(), date, tags, items,
      // Keep service for backward compat
      service: tags[0] || '',
      createdAt: setlist?.createdAt || Date.now(),
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this setlist? This cannot be undone.')) {
      onDelete(setlist.id);
    }
  };

  return (
    <div className="min-h-screen material-page pb-32">

      {/* ── Sticky header ── */}
      <div className="material-header">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between py-3">
          <h1 className="text-heading-18 text-[var(--ds-gray-1000)] m-0">
            {setlist ? 'Edit Setlist' : 'New Setlist'}
          </h1>
          <div className="flex items-center gap-2">
            {setlist && onDelete && (
              <IconButton variant="error" size="sm" onClick={handleDelete} aria-label="Delete setlist">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </IconButton>
            )}
            <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>
            <Button variant="brand" size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>

      {/* ── Content: responsive two-column layout ── */}
      <div className="max-w-5xl mx-auto px-5 pt-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left column: meta + current set */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* Meta form */}
            <SetlistMetaForm
              name={name}
              date={date}
              tags={tags}
              onNameChange={setName}
              onDateChange={setDate}
              onTagsChange={setTags}
            />

            {/* Divider */}
            <div className="border-t border-[var(--ds-gray-300)]" />

            {/* Current set */}
            <div>
              <p className="section-title m-0 mb-4">Current Set</p>

              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    data-drag-idx={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className={dragIdx === idx ? 'opacity-50' : ''}
                    style={{
                      transform: dragOverIdx !== null && dragIdx !== null && dragOverIdx !== dragIdx
                        ? (
                            (idx === dragOverIdx && dragIdx < dragOverIdx)
                              ? 'translateY(-4px)'
                              : (idx === dragOverIdx && dragIdx > dragOverIdx)
                                ? 'translateY(4px)'
                                : 'none'
                          )
                        : 'none',
                      borderTop: dragOverIdx !== null && dragIdx !== null && dragIdx > dragOverIdx && idx === dragOverIdx ? '2px solid var(--color-brand)' : '',
                      borderBottom: dragOverIdx !== null && dragIdx !== null && dragIdx < dragOverIdx && idx === dragOverIdx ? '2px solid var(--color-brand)' : '',
                      transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                  >
                    <SetlistItemRow
                      item={item}
                      idx={idx}
                      song={item.type !== 'break' ? getSong(item.songId) : null}
                      onRemove={removeItem}
                      onUpdateNote={updateNote}
                      onUpdateTranspose={updateTranspose}
                      onUpdateCapo={updateCapo}
                      onUpdateBreakField={updateBreakField}
                      dragHandleProps={{
                        onTouchStart: (e) => handleTouchStart(idx, e),
                        onTouchMove: handleTouchMove,
                        onTouchEnd: handleTouchEnd,
                        onTouchCancel: handleTouchEnd,
                      }}
                    />
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-[var(--ds-gray-400)] rounded-xl text-copy-14 text-[var(--ds-gray-700)]">
                  Add songs from the library below
                </div>
              )}

              {/* Add buttons */}
              <div className="flex gap-2 mt-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={addBreak}
                  onKeyDown={e => e.key === 'Enter' && addBreak()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[var(--ds-gray-alpha-100)] border border-dashed border-[var(--ds-gray-400)] text-label-12 font-semibold text-[var(--ds-gray-600)] cursor-pointer hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-500)] transition-colors select-none"
                >
                  + Add Break
                </div>
              </div>
            </div>
          </div>

          {/* Right column: song library picker */}
          <div className="lg:w-[320px] shrink-0">
            <SetlistSongPicker
              songs={songs}
              currentItems={items}
              onAddSong={addSong}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
