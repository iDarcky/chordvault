import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import {
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Tooltip,
  Separator,
  Card,
  CardContent,
  Chip
} from "@heroui/react";
import { parseSongMd, songToMd, generateId } from '../parser';
import RawTab from './editor/RawTab';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import PreviewPanel from './editor/PreviewPanel';

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-divider px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="light" size="sm" onPress={onBack} className="text-default-500">
              <span className="text-xl">←</span>
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {song ? 'Edit Song' : 'New Song'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {song && onDelete && (
              <Button
                color="danger"
                variant="flat"
                size="sm"
                className="font-bold"
                onPress={() => { if (confirm('Delete this song?')) onDelete(song.id); }}
              >
                Delete
              </Button>
            )}
            <Button
              color="primary"
              variant="flat"
              size="sm"
              className="font-bold px-6"
              onPress={handleSave}
              isDisabled={!preview}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Tabs
            aria-label="Editor modes"
            variant="underlined"
            color="primary"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            classNames={{
              tabList: "gap-6 h-10 px-1",
              cursor: "w-full",
              tab: "max-w-fit px-0 h-10",
              tabContent: "font-bold text-xs uppercase tracking-wider"
            }}
          >
            <Tab key="form" title="Form" />
            <Tab key="visual" title="Visual" />
            <Tab key="raw" title="Raw" />
          </Tabs>

          <div className="flex items-center gap-1 pb-2">
            {isWide && (
              <div className="flex gap-1 mr-2">
                <Chip size="sm" variant="flat" className="font-mono text-[10px] uppercase font-bold text-default-400 bg-default-50">
                  {charCount} chars
                </Chip>
                <Chip size="sm" variant="flat" className="font-mono text-[10px] uppercase font-bold text-default-400 bg-default-50">
                  {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
                </Chip>
              </div>
            )}

            <ButtonGroup size="sm" variant="light">
              <Tooltip content="Undo"><Button isIconOnly onPress={handleUndo} className="text-lg">↶</Button></Tooltip>
              <Tooltip content="Redo"><Button isIconOnly onPress={handleRedo} className="text-lg">↷</Button></Tooltip>
              <Tooltip content="Paste from clipboard"><Button isIconOnly onPress={handleImport} className="text-lg">📋</Button></Tooltip>
            </ButtonGroup>

            {!isWide && (
              <Button
                isIconOnly
                size="sm"
                variant={showPreview ? "flat" : "light"}
                color={showPreview ? "primary" : "default"}
                onPress={() => setShowPreview(!showPreview)}
                className="ml-1"
              >
                {showPreview ? '✎' : '👁'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0">
        {isWide ? (
          <>
            <ScrollArea className="flex-1 p-6 overflow-auto">
              {renderTab()}
            </ScrollArea>
            <Separator orientation="vertical" />
            <ScrollArea className="flex-1 p-0 overflow-auto bg-content2/10">
              <PreviewPanel preview={preview} />
            </ScrollArea>
          </>
        ) : (
          <ScrollArea className="flex-1 p-6 overflow-auto">
            {showPreview ? <PreviewPanel preview={preview} /> : renderTab()}
          </ScrollArea>
        )}
      </main>
    </div>
  );
}

// Simple ScrollArea replacement since I don't want to overcomplicate dependencies
function ScrollArea({ children, className }) {
  return <div className={`overflow-auto ${className}`}>{children}</div>;
}
