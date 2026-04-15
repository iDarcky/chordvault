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
structure: [Verse 1, Chorus]
---

## Verse 1
[C]Write your [G]lyrics here

## Chorus
[Am]Add your [F]chorus [C]here
`;

export default function Editor({ song, onSave, onBack, onDelete }) {
  const [md, setMd] = useState(song ? songToMd(song) : DEFAULT_MD);
  const [activeTab, setActiveTab] = useState('arrange');
  const [preview, setPreview] = useState(null);
  const [metaPanelOpen, setMetaPanelOpen] = useState(false);
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
    <div className="min-h-screen bg-[var(--ds-background-200)] flex flex-col">
      {/* ─── Sticky Header ─── */}
      <div className="material-header" style={{ padding: '10px 18px 0' }}>
        {/* Row 1: back, title, delete, save */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="xs" onClick={onBack}>← Back</Button>
            <span className="text-heading-16 text-[var(--ds-gray-1000)] truncate max-w-[200px]">
              {preview?.title || (song ? 'Edit Song' : 'New Song')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {song && onDelete && (
              <Button
                variant="error"
                size="xs"
                onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="brand"
              size="xs"
              onClick={handleSave}
              disabled={!preview}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Row 2: Key, Tempo, Time — always visible */}
        <div className="flex items-center gap-3 mb-1.5 pb-1.5 border-b border-[var(--ds-gray-300)]">
          <label className="flex items-center gap-1.5">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)]">Key</span>
            <select
              value={currentKey}
              onChange={e => updateField('key', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md px-2 py-1 text-label-12 font-mono text-[var(--ds-gray-1000)] outline-none cursor-pointer"
            >
              {ALL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)]">BPM</span>
            <input
              type="number"
              value={currentTempo}
              onChange={e => updateField('tempo', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md px-2 py-1 text-label-12 font-mono text-[var(--ds-gray-1000)] outline-none w-16"
              min="30"
              max="300"
            />
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-label-10 font-semibold uppercase tracking-wider text-[var(--ds-gray-600)]">Time</span>
            <select
              value={currentTime}
              onChange={e => updateField('time', e.target.value)}
              className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md px-2 py-1 text-label-12 font-mono text-[var(--ds-gray-1000)] outline-none cursor-pointer"
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          {/* Structure summary */}
          {preview?.structure?.length > 0 && (
            <div className="flex-1 overflow-hidden">
              <span className="text-label-10 text-[var(--ds-gray-500)] truncate block">
                {preview.structure.join(' → ')}
              </span>
            </div>
          )}
        </div>

        {/* Row 3: Metadata panel toggle */}
        <div className="px-0">
          <MetadataPanel
            md={md}
            onChange={setMd}
            isOpen={metaPanelOpen}
            onToggle={() => setMetaPanelOpen(v => !v)}
          />
        </div>

        {/* Row 4: tabs (left) + tools (right) */}
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
      <div className="flex-1 min-h-0 overflow-auto p-[18px]">
        {renderTab()}
      </div>
    </div>
  );
}
