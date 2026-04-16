import { useState } from 'react';
import { serializeTabBlock } from '../../parser';
import { sectionStyle } from '../../music';
import { Button } from '../ui/Button';

// Serialize section lines to raw text for editing
function serializeSectionLines(lines) {
  return lines.map(l => {
    if (typeof l === 'string') return l;
    if (l.type === 'tab') return serializeTabBlock(l);
    if (l.type === 'modulate') return `{modulate: ${l.semitones > 0 ? '+' : ''}${l.semitones}}`;
    return '';
  }).join('\n');
}

export default function SectionDrawer({ section, sectionIndex, onSave, onClose }) {
  const [text, setText] = useState(() => serializeSectionLines(section.lines));
  const s = sectionStyle(section.type);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-[var(--ds-background-200)] border-t border-[var(--ds-gray-400)] rounded-t-xl flex flex-col"
        style={{ maxHeight: '70vh', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--ds-gray-300)]">
          <div className="flex items-center gap-2">
            <span
              className="text-label-14 font-black uppercase tracking-[0.15em]"
              style={{ color: s.b }}
            >
              {section.type}
            </span>
            <span className="text-copy-11 text-[var(--ds-gray-500)]">
              Edit lyrics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" onClick={onClose}>Cancel</Button>
            <Button variant="brand" size="xs" onClick={() => onSave(sectionIndex, text)}>
              Save
            </Button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 overflow-auto p-4">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[30vh] bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-lg p-4 text-copy-13 leading-relaxed text-[var(--ds-gray-1000)] resize-y outline-none font-mono"
            style={{ caretColor: 'var(--chord)' }}
          />
        </div>
      </div>
    </div>
  );
}
