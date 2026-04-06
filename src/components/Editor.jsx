import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import RawTab from './editor/RawTab';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import PreviewPanel from './editor/PreviewPanel';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Tabs } from './ui/Tabs';
import { Badge } from './ui/Badge';

const TAB_LIST = [
  { id: 'form', label: 'Form' },
  { id: 'visual', label: 'Visual' },
  { id: 'raw', label: 'Raw' },
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
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState(null);
  const textareaRef = useRef(null);

  // Media query for split-screen
  const wideMq = useRef(window.matchMedia('(min-width: 768px)'));
  const isWide = useSyncExternalStore(
    (cb) => { wideMq.current.addEventListener('change', cb); return () => wideMq.current.removeEventListener('change', cb); },
    () => wideMq.current.matches,
  );

  // Parse md → preview with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try { setPreview(parseSongMd(md)); }
      catch { setPreview(null); }
    }, 300);
    return () => clearTimeout(timer);
  }, [md]);

  const charCount = md.length;
  const sectionCount = preview?.sections?.length || 0;

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
            {isWide && (
              <Badge variant="secondary" className="text-label-10-mono">
                {charCount} chars
              </Badge>
            )}
            {isWide && (
              <Badge variant="secondary" className="text-label-10-mono">
                {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
              </Badge>
            )}

            <IconButton variant="ghost" size="xs" onClick={handleUndo} aria-label="Undo">↶</IconButton>
            <IconButton variant="ghost" size="xs" onClick={handleRedo} aria-label="Redo">↷</IconButton>
            <IconButton variant="ghost" size="xs" onClick={handleImport} aria-label="Import from clipboard">📋</IconButton>

            {/* Preview toggle (narrow only) */}
            {!isWide && (
              <IconButton
                variant={showPreview ? 'active' : 'ghost'}
                size="xs"
                onClick={() => setShowPreview(v => !v)}
                aria-label={showPreview ? 'Show editor' : 'Show preview'}
              >
                {showPreview ? '✎' : '👁'}
              </IconButton>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      {isWide ? (
        /* Split-screen on wide viewports */
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-auto p-[18px]">
            {renderTab()}
          </div>
          <div className="flex-1 overflow-auto border-l border-[var(--ds-gray-300)] bg-[var(--ds-background-200)]">
            <PreviewPanel preview={preview} />
          </div>
        </div>
      ) : (
        /* Toggle on narrow viewports */
        <div className="flex-1 p-[18px]">
          {showPreview
            ? <PreviewPanel preview={preview} />
            : renderTab()
          }
        </div>
      )}
    </div>
  );
}
