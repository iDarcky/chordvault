import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import RawTab from './editor/RawTab';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import PreviewPanel from './editor/PreviewPanel';

const TABS = [
  { id: 'form', label: 'Form', disabled: false },
  { id: 'visual', label: 'Visual', disabled: false },
  { id: 'raw', label: 'Raw', disabled: false },
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

  // Media query for split-screen (using useSyncExternalStore to avoid lint issues)
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Sticky Header ─── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--header-bg)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 18px 0',
      }}>
        {/* Row 1: back, title, delete, save */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onBack} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>
              ← Back
            </button>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-bright)' }}>
              {song ? 'Edit Song' : 'New Song'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {song && onDelete && (
              <button
                onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }}
                style={{
                  background: 'var(--danger-soft)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 7, padding: '6px 12px',
                  color: 'var(--danger)', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Delete
              </button>
            )}
            <button onClick={handleSave} style={{
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              borderRadius: 7, padding: '6px 16px',
              color: 'var(--accent-text)', fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
              opacity: preview ? 1 : 0.4,
            }}>
              Save
            </button>
          </div>
        </div>

        {/* Row 2: tabs (left) + tools & stats (right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Tabs */}
          <div style={{ display: 'flex' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => !t.disabled && setActiveTab(t.id)}
                disabled={t.disabled}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: activeTab === t.id
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  color: t.disabled
                    ? 'var(--text-dim)'
                    : activeTab === t.id
                      ? 'var(--text)'
                      : 'var(--text-muted)',
                  padding: '8px 14px', fontSize: 12, fontWeight: 600,
                  cursor: t.disabled ? 'not-allowed' : 'pointer',
                  opacity: t.disabled ? 0.4 : 1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tools & stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: 4 }}>
            {isWide && <span style={statPillStyle}>{charCount} chars</span>}
            {isWide && <span style={statPillStyle}>{sectionCount} {sectionCount === 1 ? 'section' : 'sections'}</span>}

            <button onClick={handleUndo} title="Undo" style={iconBtnStyle}>↶</button>
            <button onClick={handleRedo} title="Redo" style={iconBtnStyle}>↷</button>
            <button onClick={handleImport} title="Import from clipboard" style={iconBtnStyle}>📋</button>

            {/* Preview toggle (narrow only) */}
            {!isWide && (
              <button
                onClick={() => setShowPreview(v => !v)}
                title={showPreview ? 'Show editor' : 'Show preview'}
                style={{
                  ...iconBtnStyle,
                  background: showPreview ? 'var(--accent-soft)' : 'transparent',
                  color: showPreview ? 'var(--accent-text)' : 'var(--text-muted)',
                }}
              >
                {showPreview ? '✎' : '👁'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      {isWide ? (
        /* Split-screen on wide viewports */
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
            {renderTab()}
          </div>
          <div style={{
            flex: 1, overflow: 'auto',
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg)',
          }}>
            <PreviewPanel preview={preview} />
          </div>
        </div>
      ) : (
        /* Toggle on narrow viewports */
        <div style={{ flex: 1, padding: 18 }}>
          {showPreview
            ? <PreviewPanel preview={preview} />
            : renderTab()
          }
        </div>
      )}
    </div>
  );
}

/* ─── Shared button styles ─── */

const iconBtnStyle = {
  background: 'none', border: 'none',
  color: 'var(--text-muted)', cursor: 'pointer',
  fontSize: 16, padding: '4px 6px', borderRadius: 6,
  lineHeight: 1,
};

const statPillStyle = {
  fontSize: 10.5, fontWeight: 600,
  color: 'var(--text-dim)',
  fontFamily: 'var(--fm)',
  padding: '3px 8px',
  borderRadius: 10,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  whiteSpace: 'nowrap',
};
