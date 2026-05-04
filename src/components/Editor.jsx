import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, songToMd, generateId, splitMd, replaceFrontmatter, parseFrontmatterFields, serializeFrontmatterFields } from '../parser';
import { ALL_KEYS } from '../music';
import WriteTab from './editor/WriteTab';
import ArrangeTab from './editor/ArrangeTab';
import MetadataPanel from './editor/MetadataPanel';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Tabs } from './ui/Tabs';
import ChartView from './ChartView';
import { toast } from './ui/use-toast';

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

export default function Editor({ song, onSave, onBack, onDelete, onMove, activeLibrary, team, importProgress }) {
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
      toast({
        title: 'Clipboard unavailable',
        description: 'Try pasting directly into the editor.',
        variant: 'error',
      });
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
    <div className="h-screen bg-[var(--ds-background-200)] flex flex-col lg:flex-row overflow-hidden">

      {/* ─── Left Column (Editor) ─── */}
      <div className="flex-1 lg:w-1/2 flex flex-col min-w-0 h-full relative z-10 border-r border-[var(--ds-gray-200)]">
        {/* Sticky Header */}
        <div className="material-header border-b border-[var(--ds-gray-200)] pb-1 shrink-0">
          <div className="px-4 md:px-6 pt-2 flex flex-col gap-1 max-w-3xl mx-auto w-full">
            {/* Row 1: back + title + actions */}
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="xs" onClick={onBack}>←</Button>
              <span className="text-heading-16 text-[var(--ds-gray-1000)] truncate max-w-[140px] md:max-w-xs">
                {preview?.title || (song ? 'Edit Song' : 'New Song')}
              </span>

              {importProgress && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-label-11 font-semibold border"
                  style={{
                    color: 'var(--color-brand-text)',
                    borderColor: 'var(--color-brand-border)',
                    background: 'var(--color-brand-soft)',
                  }}
                >
                  Importing {importProgress.current} of {importProgress.total}
                  {importProgress.onSkip && (
                    <button
                      onClick={importProgress.onSkip}
                      className="bg-transparent border-none p-0 text-[var(--color-brand-text)] underline cursor-pointer text-label-11 font-semibold"
                    >
                      Skip
                    </button>
                  )}
                </span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button variant="secondary" size="xs" onClick={() => setMetaPanelOpen(true)}>
                  Song Info
                </Button>

                {song && onMove && team && (
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      const target = activeLibrary === 'personal' ? team.id : 'personal';
                      const label = activeLibrary === 'personal' ? team.name : 'Personal Library';
                      if (confirm(`Move to ${label}?`)) {
                        onMove(target);
                      }
                    }}
                    className="hidden sm:flex"
                  >
                    Move to {activeLibrary === 'personal' ? 'Team' : 'Personal'}
                  </Button>
                )}

                {song && onDelete && (
                  <Button variant="error" size="xs" onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }} className="hidden sm:flex">
                    Delete
                  </Button>
                )}
                <Button variant="brand" size="xs" onClick={handleSave} disabled={!preview}>
                  Save
                </Button>
              </div>
            </div>

            <MetadataPanel
              md={md}
              onChange={setMd}
              isInfoOpen={metaPanelOpen}
              onInfoClose={() => setMetaPanelOpen(false)}
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
        </div>

        {/* Content Area */}
        <div className={`flex-1 min-h-0 flex flex-col w-full max-w-3xl mx-auto px-4 md:px-6 ${activeTab === 'write' ? 'overflow-auto py-[18px]' : 'overflow-hidden'}`}>
          {renderTab()}
        </div>
      </div>

      {/* ─── Right Column (Live Preview) ─── */}
      <div className="hidden lg:flex lg:flex-1 lg:w-1/2 flex-col min-w-0 bg-[var(--notion-bg)] h-full overflow-hidden">
        {preview ? (
          <ChartView
            song={preview}
            isPreview={true}
            headerStyle="notion"
            defaultColumns={1}
            defaultFontSize={14}
            chartLayout="columns"
            showInlineNotes={true}
            duplicateSections="full"
            displayRole="leader"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ds-gray-500)] text-sm">
            Invalid markdown or empty chart
          </div>
        )}
      </div>

    </div>
  );
}
