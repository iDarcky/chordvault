import { useState } from 'react';
import { transposeKey, ALL_KEYS, semitonesBetween } from '../../music';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';

/**
 * A single row in the setlist builder — either a song item or a break.
 * Song rows expand on click to show key/capo/notes controls.
 */
export default function SetlistItemRow({
  item, idx, song,
  onRemove, onUpdateNote, onUpdateTranspose, onUpdateCapo,
  onUpdateBreakField,
  dragHandleProps,
}) {
  const [expanded, setExpanded] = useState(false);
  const num = String(idx + 1).padStart(2, '0');

  /* ── Break row ── */
  if (item.type === 'break') {
    return (
      <div className="material-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Drag handle */}
          <span
            {...dragHandleProps}
            className="text-default-400 cursor-grab active:cursor-grabbing shrink-0 select-none"
            aria-label="Drag to reorder"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          </span>

          <span className="text-label-14 text-default-400 tabular-nums w-7 text-center shrink-0">
            {num}
          </span>

          <div className="flex-1 min-w-0">
            <Input
              value={item.label}
              onChange={e => onUpdateBreakField(idx, 'label', e.target.value)}
              placeholder="e.g. Prayer, Announcements…"
              size="sm"
              variant="ghost"
              className="font-medium italic"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex flex-col items-center">
              <span className="text-label-10 text-default-500">Min</span>
              <input
                type="number"
                min="0"
                value={item.duration || ''}
                onChange={e => onUpdateBreakField(idx, 'duration', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-10 px-1 py-0.5 text-center text-label-12-mono bg-content1 border border-default-300 rounded-md text-foreground outline-none focus:border-default-500 transition-colors"
                style={{ minHeight: 'auto' }}
              />
            </div>
            <IconButton
              size="xs"
              variant="error"
              onClick={() => onRemove(idx)}
              aria-label="Remove break"
            >
              ✕
            </IconButton>
          </div>
        </div>
      </div>
    );
  }

  /* ── Song row ── */
  if (!song) return null;
  const displayKey = transposeKey(song.key, item.transpose);

  return (
    <div className="material-card overflow-hidden">
      {/* Collapsed row — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-default-100 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Drag handle */}
        <span
          {...dragHandleProps}
          className="text-default-400 cursor-grab active:cursor-grabbing shrink-0 select-none"
          aria-label="Drag to reorder"
          onClick={e => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
        </span>

        <span className="text-label-14 text-default-400 tabular-nums w-7 text-center shrink-0">
          {num}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-heading-14 text-foreground m-0 truncate">
            {song.title}
          </p>
          <p className="text-copy-12 text-default-600 m-0 mt-0.5 truncate">
            {song.artist}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-label-14 text-foreground font-semibold">{displayKey}</span>
          <span className="text-label-11 text-default-500 tabular-nums">{song.tempo} BPM</span>
          <span className="text-label-11 text-default-500">{song.time}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className={`text-default-500 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-default-200 px-4 py-3 flex flex-wrap items-end gap-4 bg-default-100">
          {/* Key (transpose) */}
          <div className="flex flex-col gap-0.5">
            <span className="text-label-10 text-default-500 uppercase">Key</span>
            <select
              value={displayKey}
              onChange={e => onUpdateTranspose(idx, semitonesBetween(song.key, e.target.value))}
              className={`px-2 py-1 rounded-md text-label-13-mono font-bold outline-none cursor-pointer bg-content1 border transition-colors ${
                item.transpose
                  ? 'border-[var(--chord)] text-[var(--chord)]'
                  : 'border-default-300 text-foreground'
              }`}
              style={{ minHeight: 'auto' }}
            >
              {ALL_KEYS.map(k => (
                <option key={k} value={k}>{k}{k === song.key ? ' (orig)' : ''}</option>
              ))}
            </select>
          </div>

          {/* Capo */}
          <div className="flex flex-col gap-0.5">
            <span className="text-label-10 text-default-500 uppercase">Capo</span>
            <select
              value={item.capo || 0}
              onChange={e => onUpdateCapo(idx, parseInt(e.target.value))}
              className={`px-2 py-1 rounded-md text-label-13-mono font-bold outline-none cursor-pointer bg-content1 border transition-colors ${
                item.capo
                  ? 'border-[var(--color-primary)] text-[var(--color-primary-700)]'
                  : 'border-default-300 text-foreground'
              }`}
              style={{ minHeight: 'auto' }}
            >
              {[0,1,2,3,4,5,6,7,8,9].map(n => (
                <option key={n} value={n}>{n === 0 ? 'None' : n}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px]">
            <span className="text-label-10 text-default-500 uppercase">Note</span>
            <Input
              value={item.note}
              onChange={e => onUpdateNote(idx, e.target.value)}
              placeholder="Add a note…"
              size="sm"
              variant="ghost"
            />
          </div>

          {/* Remove */}
          <IconButton
            size="sm"
            variant="error"
            onClick={() => onRemove(idx)}
            aria-label="Remove song"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </IconButton>
        </div>
      )}
    </div>
  );
}
