import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export function DesktopLibraryTable({ songs, onSelectSong, sortMode, sortAsc, onSortToggle, selectedIds, onSelectIds, onEditSongTitle, onEditSongArtist, onEditSongKey, hideCheckboxes = false }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Track editing state
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const toggleAll = () => {
    if (selectedIds.length === songs.length) {
      onSelectIds([]);
    } else {
      onSelectIds(songs.map(s => s.id));
    }
  };

  const toggleOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(i => i !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  const renderSortIcon = (key) => {
    if (sortMode !== key) return null;
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`ml-1 transition-transform duration-200 ${sortAsc ? '' : 'rotate-180'}`}>
        <path d="m18 15-6-6-6 6" />
      </svg>
    );
  };

  const handleEditStart = (song, field, currentValue, e) => {
    e.stopPropagation();
    setEditingId(song.id);
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const handleEditSave = (song) => {
    if (editingId !== song.id) return;

    if (editingField === 'title' && onEditSongTitle) {
      onEditSongTitle(song, editValue);
    } else if (editingField === 'artist' && onEditSongArtist) {
      onEditSongArtist(song, editValue);
    } else if (editingField === 'key' && onEditSongKey) {
      onEditSongKey(song, editValue);
    }

    setEditingId(null);
    setEditingField(null);
  };

  const handleEditKeyDown = (e, song) => {
    if (e.key === 'Enter') {
      handleEditSave(song);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingField(null);
    }
  };

  const renderCell = (song, field, currentValue, fallback, onEdit) => {
    const isEditing = editingId === song.id && editingField === field;

    if (isEditing) {
      return (
        <input
          type="text"
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleEditSave(song)}
          onKeyDown={(e) => handleEditKeyDown(e, song)}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[var(--notion-bg)] text-[var(--notion-text-main)] border border-[var(--color-brand)] rounded px-1 py-0.5 outline-none text-copy-14"
        />
      );
    }

    return (
      <div
        className={cn("w-full truncate text-copy-14", field === 'title' ? "text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)]")}
        onClick={(e) => {
            // we want to open the side peek if they click here normally
            // but if they shift+click or double click we could edit it... lets just use a double click
        }}
        onDoubleClick={(e) => handleEditStart(song, field, currentValue, e)}
      >
        {currentValue || fallback}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className={cn(
        "grid gap-4 px-4 py-2 border-b",
        hideCheckboxes ? "grid-cols-[minmax(200px,2fr)_minmax(150px,1.5fr)_80px_minmax(150px,1fr)]" : "grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1.5fr)_80px_minmax(150px,1fr)]"
      )} style={{ borderColor: 'var(--notion-border)' }}>
        {!hideCheckboxes && (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={songs.length > 0 && selectedIds.length === songs.length}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-[var(--notion-border)] cursor-pointer accent-[var(--color-brand)]"
            />
          </div>
        )}
        <button className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)] bg-transparent border-none cursor-pointer hover:text-[var(--notion-text-main)] transition-colors text-left" onClick={() => onSortToggle('title')}>
          Title {renderSortIcon('title')}
        </button>
        <button className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)] bg-transparent border-none cursor-pointer hover:text-[var(--notion-text-main)] transition-colors text-left" onClick={() => onSortToggle('artist')}>
          Artist {renderSortIcon('artist')}
        </button>
        <button className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)] bg-transparent border-none cursor-pointer hover:text-[var(--notion-text-main)] transition-colors text-left" onClick={() => onSortToggle('key')}>
          Key {renderSortIcon('key')}
        </button>
        <div className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)] text-left">
          Tags
        </div>
      </div>

      <div className="flex flex-col">
        {songs.map(song => {
          const isSelected = selectedIds.includes(song.id);
          const isHovered = hoveredId === song.id;

          return (
            <div
              key={song.id}
              onMouseEnter={() => setHoveredId(song.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectSong(song)}
              className={cn(
                "grid gap-4 px-4 py-2.5 border-b cursor-pointer transition-colors group",
                hideCheckboxes ? "grid-cols-[minmax(200px,2fr)_minmax(150px,1.5fr)_80px_minmax(150px,1fr)]" : "grid-cols-[40px_minmax(200px,2fr)_minmax(150px,1.5fr)_80px_minmax(150px,1fr)]",
                isSelected ? "bg-[var(--notion-bg-hover)]" : "hover:bg-[var(--notion-bg-hover)]"
              )}
              style={{ borderColor: 'var(--notion-border)' }}
            >
              {!hideCheckboxes && (
                <div className="flex items-center justify-center h-full" onClick={(e) => e.stopPropagation()}>
                  <div className={cn("transition-opacity duration-150", (isHovered || isSelected) ? "opacity-100" : "opacity-0")}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(song.id)}
                      className="w-4 h-4 rounded border-[var(--notion-border)] cursor-pointer accent-[var(--color-brand)]"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center overflow-hidden" title="Double click to edit">
                {renderCell(song, 'title', song.title, 'Untitled', onEditSongTitle)}
              </div>
              <div className="flex items-center overflow-hidden" title="Double click to edit">
                {renderCell(song, 'artist', song.artist, '', onEditSongArtist)}
              </div>
              <div className="flex items-center overflow-hidden" title="Double click to edit">
                {renderCell(song, 'key', song.key, '', onEditSongKey)}
              </div>
              <div className="flex items-center gap-1 flex-wrap overflow-hidden">
                {song.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--notion-bg-hover)] text-[11px] text-[var(--notion-text-dim)] border" style={{ borderColor: 'var(--notion-border)' }}>
                    {tag}
                  </span>
                ))}
                {song.tags?.length > 3 && (
                  <span className="text-[11px] text-[var(--notion-text-dim)]">+{song.tags.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
