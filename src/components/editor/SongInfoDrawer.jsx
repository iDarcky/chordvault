import { X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

const SECONDARY_FIELDS = [
  { key: 'artist', label: 'Artist', placeholder: 'Artist / band' },
  { key: 'capo', label: 'Capo', placeholder: '0' },
  { key: 'ccli', label: 'CCLI', placeholder: 'CCLI number' },
  { key: 'tags', label: 'Tags', placeholder: 'worship, hymn, fast' },
  { key: 'spotify', label: 'Spotify', placeholder: 'https://…' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://…' },
  { key: 'notes', label: 'Notes', placeholder: 'Performance notes' },
];

export default function SongInfoDrawer({ open, onClose, fields, onChangeField }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)] shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ds-gray-200)]">
          <h2 className="text-label-14 font-semibold text-[var(--ds-gray-1000)]">Song Info</h2>
          <IconButton onClick={onClose} aria-label="Close song info">
            <X className="w-5 h-5 text-[var(--ds-gray-600)]" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {SECONDARY_FIELDS.map(f => (
            <label key={f.key} className="block">
              <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)] block mb-1">
                {f.label}
              </span>
              <input
                value={fields[f.key] || ''}
                onChange={e => onChangeField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-gray-500)] focus:ring-1 focus:ring-[var(--ds-gray-500)] transition-shadow font-sans"
              />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
