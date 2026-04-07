import { useState } from 'react';
import { Input } from '../ui/Input';

const MAX_TAGS = 3;

/**
 * Setlist metadata form — name, date, freeform tags.
 */
export default function SetlistMetaForm({ name, date, tags, onNameChange, onDateChange, onTagsChange }) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const value = tagInput.trim().slice(0, 10);
    if (!value) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.some(t => t.toLowerCase() === value.toLowerCase())) return;
    onTagsChange([...tags, value]);
    setTagInput('');
  };

  const removeTag = (idx) => {
    onTagsChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="section-title px-0.5">Setlist Title</label>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Sunday Morning Service"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="section-title px-0.5">Date</label>
        <Input
          type="date"
          value={date}
          onChange={e => onDateChange(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="section-title px-0.5">
          Tags {tags.length > 0 && <span className="font-normal text-[var(--ds-gray-600)]">({tags.length}/{MAX_TAGS})</span>}
        </label>
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] min-h-[42px] focus-within:border-[var(--ds-gray-600)] transition-colors">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--ds-gray-200)] text-label-12 text-[var(--ds-gray-1000)] select-none"
            >
              {tag}
              <span
                role="button"
                tabIndex={0}
                onClick={() => removeTag(idx)}
                onKeyDown={(e) => e.key === 'Enter' && removeTag(idx)}
                className="text-[var(--ds-gray-600)] hover:text-[var(--ds-error-600)] cursor-pointer text-[10px] leading-none ml-0.5"
              >
                ✕
              </span>
            </span>
          ))}
          {tags.length < MAX_TAGS && (
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value.slice(0, 10))}
              onKeyDown={handleKeyDown}
              onBlur={addTag}
              maxLength={10}
              placeholder={tags.length === 0 ? 'Type and press Enter…' : ''}
              className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-copy-14 text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-600)]"
              style={{ minHeight: 'auto', padding: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
