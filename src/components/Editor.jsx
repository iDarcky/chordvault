import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import RawTab from './editor/RawTab';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import PlaceTab from './editor/PlaceTab';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Tabs } from './ui/Tabs';

const TAB_LIST = [
  { id: 'form', label: 'Form' },
  { id: 'visual', label: 'Visual' },
  { id: 'raw', label: 'Raw' },
  { id: 'place', label: 'Place' },
];

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
  const [activeTab, setActiveTab] = useState('form');
  const [preview, setPreview] = useState(null);
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

  // Render active tab content
  const renderTab = () => {
    switch (activeTab) {
      case 'form':
        return <FormTab md={md} onChange={setMd} />;
      case 'visual':
        return <VisualTab md={md} onChange={setMd} textareaRef={textareaRef} />;
      case 'raw':
        return <RawTab md={md} onChange={setMd} textareaRef={textareaRef} />;
      case 'place':
        return <PlaceTab md={md} onChange={setMd} />;
      default:
        return <FormTab md={md} onChange={setMd} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex flex-col">
      {/* ─── Sticky Header ─── */}
      <div className="material-header" style={{ padding: '10px 18px 0' }}>
        {/* Row 1: back, title, delete, save */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="xs" onClick={onBack}>← Back</Button>
            <span className="text-heading-16 text-[var(--ds-gray-1000)]">
              {song ? 'Edit Song' : 'New Song'}
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

        {/* Row 2: tabs (left) + tools & stats (right) */}
        <div className="flex items-center justify-between">
          <Tabs tabs={TAB_LIST} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex items-center gap-1 pb-1">
            <IconButton variant="ghost" size="xs" onClick={handleUndo} aria-label="Undo">↶</IconButton>
            <IconButton variant="ghost" size="xs" onClick={handleRedo} aria-label="Redo">↷</IconButton>
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
