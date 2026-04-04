import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import RawTab from './editor/RawTab';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import PreviewPanel from './editor/PreviewPanel';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

const TABS = [
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
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-[100] bg-background/80 backdrop-blur-md border-b border-accents-2 px-6 pt-4">
        {/* Row 1: back, title, delete, save */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-accents-4 hover:text-foreground">
              &#8592;
            </button>
            <h1 className="text-xl font-bold text-foreground tracking-tight m-0">
              {song ? 'Edit Song' : 'New Song'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {song && onDelete && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }}
                className="text-geist-error hover:bg-geist-error/10 border-geist-error/20"
              >
                Delete
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!preview}
              className="px-6 font-bold tracking-tight"
            >
              SAVE
            </Button>
          </div>
        </div>

        {/* Row 2: tabs (left) + tools & stats (right) */}
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                  activeTab === t.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-accents-4 hover:text-accents-6 hover:border-accents-2"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tools & stats */}
          <div className="flex items-center gap-2 pb-2">
            {isWide && (
              <div className="flex items-center gap-2 mr-2">
                <Badge variant="outline" className="font-mono text-[10px] h-6 px-2 bg-accents-1 border-accents-2">
                  {charCount} CHARS
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] h-6 px-2 bg-accents-1 border-accents-2">
                  {sectionCount} {sectionCount === 1 ? 'SEC' : 'SECS'}
                </Badge>
              </div>
            )}

            <div className="flex items-center bg-accents-1 p-1 rounded-geist border border-accents-2">
              <button onClick={handleUndo} title="Undo" className="p-1.5 text-accents-5 hover:text-foreground hover:bg-background rounded transition-colors cursor-pointer border-none bg-transparent">
                ↶
              </button>
              <button onClick={handleRedo} title="Redo" className="p-1.5 text-accents-5 hover:text-foreground hover:bg-background rounded transition-colors cursor-pointer border-none bg-transparent">
                ↷
              </button>
              <button onClick={handleImport} title="Import from clipboard" className="p-1.5 text-accents-5 hover:text-foreground hover:bg-background rounded transition-colors cursor-pointer border-none bg-transparent">
                📋
              </button>
            </div>

            {/* Preview toggle (narrow only) */}
            {!isWide && (
              <Button
                variant={showPreview ? "primary" : "secondary"}
                size="sm"
                onClick={() => setShowPreview(v => !v)}
                className="w-10 h-10 p-0 font-bold"
              >
                {showPreview ? '✎' : '👁'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isWide ? (
        <div className="flex flex-1 min-h-0 divide-x divide-accents-2">
          <div className="flex-1 overflow-auto bg-accents-1/20 p-6">
            {renderTab()}
          </div>
          <div className="flex-1 overflow-auto bg-background">
            <PreviewPanel preview={preview} />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-background p-6">
          {showPreview
            ? <PreviewPanel preview={preview} />
            : renderTab()
          }
        </div>
      )}
    </div>
  );
}
