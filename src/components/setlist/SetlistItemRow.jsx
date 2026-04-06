import { transposeKey, sectionStyle, ALL_KEYS, semitonesBetween } from '../../music';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';

/**
 * A single row in the setlist builder — either a song item or a break.
 */
export default function SetlistItemRow({
  item, idx, totalItems, song,
  onMove, onRemove, onUpdateNote, onUpdateTranspose, onUpdateCapo,
  onUpdateBreakField
}) {
  // Shared reorder column
  const orderCol = (
    <div className="flex flex-col items-center justify-center w-11 bg-[var(--ds-gray-100)] border-r border-[var(--ds-gray-300)] gap-0.5 py-1">
      <IconButton
        size="xs"
        variant="ghost"
        onClick={() => idx > 0 && onMove(idx, -1)}
        disabled={idx === 0}
        aria-label="Move up"
      >
        &#9650;
      </IconButton>
      <span className="text-label-14-mono font-bold text-[var(--ds-gray-500)]">
        {idx + 1}
      </span>
      <IconButton
        size="xs"
        variant="ghost"
        onClick={() => idx < totalItems - 1 && onMove(idx, 1)}
        disabled={idx === totalItems - 1}
        aria-label="Move down"
      >
        &#9660;
      </IconButton>
    </div>
  );

  // Break item
  if (item.type === 'break') {
    return (
      <div className="flex items-stretch rounded-xl border border-[var(--ds-gray-300)] overflow-hidden bg-[var(--ds-gray-100)]">
        {orderCol}
        <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5">
          <div className="w-10 h-10 rounded-lg shrink-0 bg-[var(--ds-gray-200)] border border-[var(--ds-gray-400)] flex items-center justify-center text-base text-[var(--ds-gray-600)]">
            &#9646;
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={item.label}
              onChange={e => onUpdateBreakField(idx, 'label', e.target.value)}
              placeholder="e.g. Prayer, Announcements..."
              size="sm"
              variant="ghost"
              className="font-semibold"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 border-l border-[var(--ds-gray-300)]">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-label-10 text-[var(--ds-gray-500)]">Min</span>
            <input
              type="number"
              min="0"
              value={item.duration || ''}
              onChange={e => onUpdateBreakField(idx, 'duration', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-9 px-1 py-0.5 text-center text-label-11-mono bg-[var(--ds-background-100)] border border-[var(--ds-gray-300)] rounded-md text-[var(--ds-gray-1000)] outline-none"
            />
          </div>
          <Input
            value={item.note}
            onChange={e => onUpdateBreakField(idx, 'note', e.target.value)}
            placeholder="Note..."
            size="sm"
            variant="ghost"
            className="w-24"
          />
          <IconButton
            size="xs"
            variant="ghost"
            onClick={() => onRemove(idx)}
            aria-label="Remove item"
            className="text-[var(--ds-gray-500)] hover:text-[var(--ds-error-900)]"
          >
            &#10005;
          </IconButton>
        </div>
      </div>
    );
  }

  // Song item
  if (!song) return null;
  const s = sectionStyle(song.sections?.[0]?.type || 'Verse');

  return (
    <div className="flex items-stretch rounded-xl border border-[var(--ds-gray-300)] overflow-hidden bg-[var(--ds-gray-100)]">
      {orderCol}
      <div className="flex-1 flex items-center gap-3 px-3.5 py-2.5">
        <div
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-mono text-label-13 font-bold border"
          style={{
            background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
            borderColor: `${s.b}44`,
            color: s.d,
          }}
        >
          {transposeKey(song.key, item.transpose)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-heading-14 text-[var(--ds-gray-1000)] truncate">
            {song.title}
          </div>
          <div className="text-copy-11 text-[var(--ds-gray-600)] mt-0.5">
            {song.artist} · {song.tempo} bpm · {song.time}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 border-l border-[var(--ds-gray-300)]">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-label-10 text-[var(--ds-gray-500)]">Key</span>
          <select
            value={transposeKey(song.key, item.transpose)}
            onChange={e => onUpdateTranspose(idx, semitonesBetween(song.key, e.target.value))}
            className={`px-1 py-0.5 rounded-md text-label-12-mono font-bold outline-none cursor-pointer bg-[var(--ds-background-100)] border ${
              item.transpose
                ? 'border-[var(--chord)] text-[var(--chord)]'
                : 'border-[var(--ds-gray-300)] text-[var(--ds-gray-1000)]'
            }`}
          >
            {ALL_KEYS.map(k => (
              <option key={k} value={k}>{k}{k === song.key ? ' (orig)' : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-label-10 text-[var(--ds-gray-500)]">Capo</span>
          <select
            value={item.capo || 0}
            onChange={e => onUpdateCapo(idx, parseInt(e.target.value))}
            className={`px-1 py-0.5 rounded-md text-label-12-mono font-bold outline-none cursor-pointer bg-[var(--ds-background-100)] border ${
              item.capo
                ? 'border-[var(--color-brand)] text-[var(--color-brand-text)]'
                : 'border-[var(--ds-gray-300)] text-[var(--ds-gray-1000)]'
            }`}
          >
            {[0,1,2,3,4,5,6,7,8,9].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <Input
          value={item.note}
          onChange={e => onUpdateNote(idx, e.target.value)}
          placeholder="Note..."
          size="sm"
          variant="ghost"
          className="w-24"
        />
        <IconButton
          size="xs"
          variant="ghost"
          onClick={() => onRemove(idx)}
          aria-label="Remove item"
          className="text-[var(--ds-gray-500)] hover:text-[var(--ds-error-900)]"
        >
          &#10005;
        </IconButton>
      </div>
    </div>
  );
}
