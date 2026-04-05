import { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';

export default function VisualTab({ song, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [tabEditorOpen, setTabEditorOpen] = useState(false);
  const [activeTabBlock, setActiveTabBlock] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const addSection = (type) => {
    const newSection = {
      type,
      id: Math.random().toString(36).substr(2, 9),
      lines: [],
      note: ''
    };
    onChange({ ...song, sections: [...song.sections, newSection] });
  };

  const updateSection = (id, patch) => {
    onChange({
      ...song,
      sections: song.sections.map(s => s.id === id ? { ...s, ...patch } : s)
    });
  };

  const removeSection = (id) => {
    onChange({
      ...song,
      sections: song.sections.filter(s => s.id !== id)
    });
  };

  const insertChord = (chord) => {
    const section = song.sections.find(s => s.id === activeSectionId);
    if (!section) return;

    // Add chord to the last line for now or logic to insert at cursor
    const lastIdx = section.lines.length - 1;
    const newLines = [...section.lines];
    if (lastIdx >= 0 && typeof newLines[lastIdx] === 'string') {
      newLines[lastIdx] += `[${chord}]`;
    } else {
      newLines.push(`[${chord}]`);
    }

    updateSection(activeSectionId, { lines: newLines });
    setPickerOpen(false);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-wrap gap-2 p-4 bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-card sticky top-0 z-40 shadow-sm">
        <div className="flex gap-1 border-r border-[var(--geist-border)] pr-3 mr-1">
          {['Verse', 'Chorus', 'Bridge', 'Outro'].map(type => (
            <Button key={type} variant="secondary" size="sm" onClick={() => addSection(type)} className="text-[10px] uppercase font-black">
              + {type}
            </Button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
             const newSection = { type: 'Instrumental', id: Math.random().toString(36).substr(2, 9), lines: [{ type: 'tab', strings: [], raw: [] }] };
             onChange({ ...song, sections: [...song.sections, newSection] });
          }}
          className="text-[10px] uppercase font-black"
        >
          + TAB
        </Button>
      </div>

      <div className="space-y-6">
        {song.sections.map((section, idx) => (
          <Card key={section.id || idx} className="p-6 border-l-4 border-l-brand relative group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">{section.type}</span>
                <input
                  value={section.note || ''}
                  onChange={e => updateSection(section.id, { note: e.target.value })}
                  placeholder="Band cue..."
                  className="bg-transparent border-none outline-none text-[10px] font-bold italic text-[var(--accents-4)] w-32 focus:w-64 transition-all"
                />
              </div>

              <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    setActiveSectionId(section.id);
                    setPickerAnchor(e.currentTarget.getBoundingClientRect());
                    setPickerOpen(true);
                  }}
                  className="p-1.5 rounded bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </button>
                <button onClick={() => removeSection(section.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--accents-3)] hover:text-red-500 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <textarea
              value={Array.isArray(section.lines) ? section.lines.map(l => typeof l === 'string' ? l : (l.type === 'tab' ? '{tab}...{/tab}' : '{modulate}')).join('\n') : ''}
              onChange={e => {
                const textLines = e.target.value.split('\n');
                // Keep objects (tabs/mods) as they are, update strings
                const newLines = textLines.map((line, i) => {
                   const old = section.lines[i];
                   if (line === '{tab}...{/tab}' && old?.type === 'tab') return old;
                   if (line === '{modulate}' && old?.type === 'modulate') return old;
                   return line;
                });
                updateSection(section.id, { lines: newLines });
              }}
              placeholder="Enter chords and lyrics... e.g. [G]Amazing [C]grace"
              className="w-full bg-transparent border-none outline-none font-mono text-sm min-h-[120px] resize-none text-[var(--geist-foreground)] leading-relaxed"
            />

            {section.lines.some(l => l.type === 'tab') && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 text-[10px] uppercase font-bold"
                onClick={() => {
                  const tabIdx = section.lines.findIndex(l => l.type === 'tab');
                  setActiveTabBlock({ sectionId: section.id, index: tabIdx });
                  setTabEditorOpen(true);
                }}
              >
                Edit Tablature
              </Button>
            )}
          </Card>
        ))}
      </div>

      {song.sections.length === 0 && (
        <div className="text-center py-32 border border-dashed border-[var(--geist-border)] rounded-geist-card bg-[var(--accents-1)]/50">
          <div className="text-[var(--accents-3)] mb-4">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </div>
          <p className="text-[var(--accents-5)] text-sm font-medium">Your chart is empty.</p>
          <p className="text-[var(--accents-4)] text-[10px] uppercase tracking-widest mt-2 font-bold italic">Add a section to start building</p>
        </div>
      )}

      {pickerOpen && (
        <ChordPicker
          onSelect={insertChord}
          onClose={() => setPickerOpen(false)}
          anchorRect={pickerAnchor}
        />
      )}

      {tabEditorOpen && (
        <TabGridEditor
          initialTab={song.sections.find(s => s.id === activeTabBlock.sectionId).lines[activeTabBlock.index]}
          onSave={(ascii) => {
            const section = song.sections.find(s => s.id === activeTabBlock.sectionId);
            const newLines = [...section.lines];
            // Simple logic: parse ascii back or replace raw
            newLines[activeTabBlock.index] = { ...newLines[activeTabBlock.index], raw: ascii.split('\n').filter(l => !l.startsWith('{')) };
            updateSection(activeTabBlock.sectionId, { lines: newLines });
            setTabEditorOpen(false);
          }}
          onClose={() => setTabEditorOpen(false)}
        />
      )}
    </div>
  );
}
