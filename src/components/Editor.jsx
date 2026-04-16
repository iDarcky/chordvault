import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, songToMd, generateId, splitMd, replaceFrontmatter, parseFrontmatterFields, serializeFrontmatterFields } from '../parser';
import { ALL_KEYS } from '../music';
import WriteTab from './editor/WriteTab';
import ArrangeTab from './editor/ArrangeTab';
import MetadataPanel from './editor/MetadataPanel';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Tabs } from './ui/Tabs';

const TAB_LIST = [
  { id: 'write', label: 'Write' },
  { id: 'arrange', label: 'Arrange' },
];

const TIME_OPTIONS = ['4/4', '3/4', '6/8', '7/8', '12/8', '2/4', '5/4'];

const DEFAULT_MD = `---
title: New Song
artist:
key: C
tempo: 120
time: 4/4
---

## Verse 1

`;

export default function Editor({ song, onSave, onBack, onDelete }) {
  const [md, setMd] = useState(song ? songToMd(song) : DEFAULT_MD);
  const [activeTab, setActiveTab] = useState('arrange');
  const [preview, setPreview] = useState(null);
  const [metaPanelOpen, setMetaPanelOpen] = useState(!song);
  const textareaRef = useRef(null);

  // Parse md → preview with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try { setPreview(parseSongMd(md)); }
      catch { setPreview(null); }
    }, 300);
    return () => clearTimeout(timer);
  }, [md]);

  const handleSave = useCallback(() => {
    if (!preview) return;
    onSave({ ...preview, id: song?.id || generateId() });
  }, [preview, song, onSave]);

  const handleImport = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      if (md.trim() && !confirm('Replace current content with clipboard?')) return;
      setMd(text);
    } catch {
      alert('Could not read clipboard. Try pasting directly into the editor.');
    }
  }, [md]);

  const handleUndo = useCallback(() => {
    textareaRef.current?.focus();
    document.execCommand('undo');
  }, []);

  const handleRedo = useCallback(() => {
    textareaRef.current?.focus();
    document.execCommand('redo');
  }, []);

  // Update a single frontmatter field without touching the body
  const updateField = useCallback((key, value) => {
    const fields = parseFrontmatterFields(splitMd(md).frontmatter);
    fields[key] = value;
    setMd(replaceFrontmatter(md, serializeFrontmatterFields(fields)));
  }, [md]);

  // Current field values for the header
  const currentKey = preview?.key || 'C';
  const currentTempo = preview?.tempo || 120;
  const currentTime = preview?.time || '4/4';

  // Render active tab content
  const renderTab = () => {
    switch (activeTab) {
      case 'write':
        return <WriteTab md={md} onChange={setMd} textareaRef={textareaRef} />;
      case 'arrange':
        return <ArrangeTab md={md} onChange={setMd} />;
      default:
        return <ArrangeTab md={md} onChange={setMd} />;
    }
  };

  return (
    <div className="h-screen bg-[var(--ds-background-200)] flex flex-col">
      {/* ─── Sticky Header ─── */}
      <div className="material-header" style={{ padding: '8px 16px 0' }}>
        {/* Row 1: back + title + key/bpm/time + actions */}
        <div className="flex items-center gap-2 mb-1">
          <Button variant="ghost" size="xs" onClick={onBack}>←</Button>
          <span className="text-heading-16 text-[var(--ds-gray-1000)] truncate max-w-[140px]">
            {preview?.title || (song ? 'Edit Song' : 'New Song')}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <select
              value={currentKey}
              onChange={e => updateField('key', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded px-1.5 py-0.5 text-label-11 font-mono text-[var(--ds-gray-1000)] outline-none cursor-pointer"
            >
              {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input
              type="number"
              value={currentTempo}
              onChange={e => updateField('tempo', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded px-1.5 py-0.5 text-label-11 font-mono text-[var(--ds-gray-1000)] outline-none w-14"
              min="30" max="300"
            />
            <select
              value={currentTime}
              onChange={e => updateField('time', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded px-1.5 py-0.5 text-label-11 font-mono text-[var(--ds-gray-1000)] outline-none cursor-pointer"
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {song && onDelete && (
              <Button variant="error" size="xs" onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }}>
                Delete
              </Button>
            )}
            <Button variant="brand" size="xs" onClick={handleSave} disabled={!preview}>
              Save
            </Button>
          </div>
        </div>

        {/* Collapsible metadata */}
        <MetadataPanel
          md={md}
          onChange={setMd}
          isOpen={metaPanelOpen}
          onToggle={() => setMetaPanelOpen(v => !v)}
        />

        {/* Tabs + tools */}
        <div className="flex items-center justify-between">
          <Tabs tabs={TAB_LIST} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex items-center gap-1 pb-1">
            {activeTab === 'write' && (
              <>
                <IconButton variant="ghost" size="xs" onClick={handleUndo} aria-label="Undo">↶</IconButton>
                <IconButton variant="ghost" size="xs" onClick={handleRedo} aria-label="Redo">↷</IconButton>
              </>
            )}
            <IconButton variant="ghost" size="xs" onClick={handleImport} aria-label="Import from clipboard">📋</IconButton>
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className={`flex-1 min-h-0 flex flex-col ${activeTab === 'write' ? 'overflow-auto p-[18px]' : 'overflow-hidden'}`}>
        {renderTab()}
      </div>
    </div>
  );
}
