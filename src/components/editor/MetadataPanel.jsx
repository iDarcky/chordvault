import { useState, useEffect, useRef, useCallback } from 'react';
import { splitMd, replaceFrontmatter, parseFrontmatterFields, serializeFrontmatterFields } from '../../parser';
import SongInfoDrawer from './SongInfoDrawer';
import { ALL_KEYS } from '../../music';

const PRIMARY_FIELDS = [
  { key: 'title', label: 'Title', placeholder: 'Song title', span: 2 },
  { key: 'key', label: 'Key', placeholder: 'C', span: 1 },
  { key: 'tempo', label: 'Tempo', placeholder: '120', span: 1 },
  { key: 'time', label: 'Time', placeholder: '4/4', span: 1 },
];

const TIME_OPTIONS = ['4/4', '3/4', '6/8', '7/8', '12/8', '2/4', '5/4'];

export default function MetadataPanel({ md, onChange, isInfoOpen, onInfoClose }) {
  const isInternalUpdate = useRef(false);

  const [fields, setFields] = useState(() => parseFrontmatterFields(splitMd(md).frontmatter));

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setFields(parseFrontmatterFields(splitMd(md).frontmatter));
  }, [md]);

  const handleChange = useCallback((key, value) => {
    setFields(prev => {
      const updated = { ...prev, [key]: value };
      isInternalUpdate.current = true;
      onChange(replaceFrontmatter(md, serializeFrontmatterFields(updated)));
      return updated;
    });
  }, [md, onChange]);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-3 pt-1">
        <label className="block sm:col-span-2">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)] block mb-0.5">
              Title
            </span>
            <input
              value={fields.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Song title"
              className="w-full px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-gray-500)] transition-colors font-mono"
            />
        </label>

        <label className="block">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)] block mb-0.5">
              Key
            </span>
            <select
                value={fields.key || ''}
                onChange={e => handleChange('key', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-gray-500)] transition-colors font-mono cursor-pointer"
            >
                <option value=""></option>
                {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
        </label>

        <label className="block">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)] block mb-0.5">
              Tempo
            </span>
            <input
              type="number"
              value={fields.tempo || ''}
              onChange={e => handleChange('tempo', e.target.value)}
              placeholder="120"
              min="30" max="300"
              className="w-full px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-gray-500)] transition-colors font-mono"
            />
        </label>

        <label className="block">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)] block mb-0.5">
              Time
            </span>
            <select
                value={fields.time || '4/4'}
                onChange={e => handleChange('time', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none focus:border-[var(--ds-gray-500)] transition-colors font-mono cursor-pointer"
            >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </label>
      </div>

      <SongInfoDrawer
        open={isInfoOpen}
        onClose={onInfoClose}
        fields={fields}
        onChangeField={handleChange}
      />
    </div>
  );
}
