import { useState, useEffect, useRef, useCallback } from 'react';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { parseTabBlock } from '../../parser';

const SECTION_TYPES = [
  'Intro', 'Verse', 'Pre Chorus', 'Chorus', 'Bridge',
  'Instrumental', 'Interlude', 'Tag', 'Vamp', 'Outro', 'Ending', 'Refrain',
];

export default function VisualTab({ md, onChange, textareaRef }) {
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showCueInput, setShowCueInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [tabEditState, setTabEditState] = useState(null); // { initialTab, time, range: { start, end } } | null
  const [chordAnchor, setChordAnchor] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [cueText, setCueText] = useState('');
  const [noteText, setNoteText] = useState('');
  const toolbarRef = useRef(null);

  // ─── Textarea helpers ───
  const insertAtCursor = useCallback((text, opts = {}) => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.focus();
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;

    let insert = text;
    let newCursor = start + insert.length;

    if (opts.wrapSelection && start !== end) {
      // Wrap selected text
      const selected = val.substring(start, end);
      insert = opts.wrapSelection.replace('$1', selected);
      newCursor = start + insert.length;
    }

    if (opts.newLine) {
      // Ensure we're on a new line
      const before = val.substring(0, start);
      const needsNewLine = before.length > 0 && !before.endsWith('\n');
      const needsBlankLine = before.length > 0 && !before.endsWith('\n\n');
      const prefix = needsBlankLine ? (needsNewLine ? '\n\n' : '\n') : '';
      insert = prefix + insert;
      newCursor = start + insert.length;
    }

    const newVal = val.substring(0, start) + insert + val.substring(end);
    onChange(newVal);

    // Set cursor position after React re-render
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = newCursor;
      ta.focus();
    });
  }, [onChange]);

  // ─── Chord insertion ───
  const handleChordSelect = useCallback((chord) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;

    if (start !== end) {
      // Wrap selection
      const selected = val.substring(start, end);
      const insert = `[${chord}]${selected}`;
      const newVal = val.substring(0, start) + insert + val.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
        ta.focus();
      });
    } else {
      // Insert at cursor
      const insert = `[${chord}]`;
      const newVal = val.substring(0, start) + insert + val.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
        ta.focus();
      });
    }
    setShowChordPicker(false);
  }, [onChange]);

  // ─── Section insertion with auto-numbering ───
  const handleSectionInsert = useCallback((type) => {
    // Count existing sections of this type for auto-numbering
    const regex = new RegExp(`^## ${type}(\\s+\\d+)?$`, 'gm');
    const matches = md.match(regex);
    const count = matches ? matches.length : 0;

    // Always number if there are existing sections or if it's a type that's commonly numbered
    const needsNumber = ['Verse', 'Pre Chorus', 'Chorus', 'Bridge'].includes(type);
    const label = needsNumber ? `${type} ${count + 1}` : (count > 0 ? `${type} ${count + 1}` : type);

    insertAtCursor(`## ${label}\n`, { newLine: true });
    setShowSectionMenu(false);
  }, [md, insertAtCursor]);

  // ─── Band cue insertion ───
  const handleCueInsert = useCallback(() => {
    if (!cueText.trim()) return;
    insertAtCursor(`> ${cueText.trim()}\n`, { newLine: true });
    setCueText('');
    setShowCueInput(false);
  }, [cueText, insertAtCursor]);

  // ─── Inline note insertion ───
  const handleNoteInsert = useCallback(() => {
    if (!noteText.trim()) return;
    insertAtCursor(`{!${noteText.trim()}}`);
    setNoteText('');
    setShowNoteInput(false);
  }, [noteText, insertAtCursor]);

  // ─── Modulation insertion ───
  const handleModInsert = useCallback((n) => {
    insertAtCursor(`{modulate: +${n}}\n`, { newLine: true });
    setShowModMenu(false);
  }, [insertAtCursor]);

  // ─── Tab block insertion/editing via grid editor ───
  const handleTabInsert = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) { setTabEditState(null); setShowTabEditor(true); return; }
    const cursorPos = ta.selectionStart;
    const val = ta.value;

    // Check if cursor is inside an existing {tab}...{/tab} block
    const openRegex = /\{tab(?:,\s*[^}]*)?\}/g;
    let editState = null;
    let match;
    while ((match = openRegex.exec(val)) !== null) {
      const blockStart = match.index;
      const closeIdx = val.indexOf('{/tab}', match.index + match[0].length);
      if (closeIdx === -1) continue;
      const blockEnd = closeIdx + '{/tab}'.length;
      if (cursorPos >= blockStart && cursorPos <= blockEnd) {
        // Cursor is inside this tab block — parse it for editing
        const blockText = val.substring(match.index + match[0].length, closeIdx).trim();
        const rawLines = blockText.split('\n').filter(l => l.trim());
        const parsed = parseTabBlock(rawLines);
        // Extract time from header
        const timePart = match[0].match(/time:\s*(\S+)/);
        const time = timePart ? timePart[1] : null;
        parsed.time = time;
        editState = { initialTab: parsed, time, range: { start: blockStart, end: blockEnd } };
        break;
      }
    }

    setTabEditState(editState);
    setShowTabEditor(true);
  }, [md]);

  const handleTabEditorSave = useCallback((asciiBlock) => {
    if (tabEditState?.range) {
      // Replace existing tab block
      const { start, end } = tabEditState.range;
      const newVal = md.substring(0, start) + asciiBlock + md.substring(end);
      onChange(newVal);
    } else {
      insertAtCursor(asciiBlock, { newLine: true });
    }
    setTabEditState(null);
    setShowTabEditor(false);
  }, [tabEditState, md, onChange, insertAtCursor]);

  // ─── Metadata form ───
  const handleMetaSave = useCallback((meta) => {
    // Parse existing frontmatter
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
    const body = fmMatch ? md.substring(fmMatch[0].length) : '\n' + md;

    const lines = [];
    if (meta.title) lines.push(`title: ${meta.title}`);
    if (meta.artist) lines.push(`artist: ${meta.artist}`);
    if (meta.key) lines.push(`key: ${meta.key}`);
    if (meta.tempo) lines.push(`tempo: ${meta.tempo}`);
    if (meta.time) lines.push(`time: ${meta.time}`);
    if (meta.structure) lines.push(`structure: [${meta.structure}]`);
    if (meta.ccli) lines.push(`ccli: ${meta.ccli}`);
    if (meta.tags) lines.push(`tags: [${meta.tags}]`);
    if (meta.capo) lines.push(`capo: ${meta.capo}`);
    if (meta.spotify) lines.push(`spotify: ${meta.spotify}`);
    if (meta.youtube) lines.push(`youtube: ${meta.youtube}`);
    if (meta.notes) lines.push(`notes: ${meta.notes}`);

    const newMd = `---\n${lines.join('\n')}\n---${body}`;
    onChange(newMd);
    setShowMetaForm(false);
  }, [md, onChange]);

  // Parse current metadata for the form
  const parseMeta = () => {
    const meta = { title: '', artist: '', key: 'C', tempo: '120', time: '4/4', structure: '', ccli: '', tags: '', capo: '', spotify: '', youtube: '', notes: '' };
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return meta;
    fmMatch[1].split('\n').forEach(line => {
      const m = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
      if (m) {
        const key = m[1].trim().toLowerCase();
        let val = m[2].trim();
        if (val.startsWith('[') && val.endsWith(']')) val = val.slice(1, -1);
        if (Object.hasOwn(meta, key)) meta[key] = val;
      }
    });
    return meta;
  };

  const openChordPicker = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setChordAnchor(rect);
    setShowChordPicker(true);
  };

  const openPopup = (setter, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupAnchor(rect);
    setter(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ─── Toolbar ─── */}
      <div ref={toolbarRef} style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 0',
        borderBottom: '1px solid var(--border)', marginBottom: 8,
      }}>
        <ToolBtn label="♪" title="Insert Chord" onClick={openChordPicker} />
        <ToolBtn label="§" title="Add Section" onClick={(e) => openPopup(setShowSectionMenu, e)} />
        <ToolBtn label="📢" title="Band Cue" onClick={(e) => openPopup(setShowCueInput, e)} />
        <ToolBtn label="💬" title="Inline Note" onClick={(e) => openPopup(setShowNoteInput, e)} />
        <ToolBtn label="↑" title="Modulate" onClick={(e) => openPopup(setShowModMenu, e)} />
        <ToolBtn label="┃" title="Tab Block" onClick={handleTabInsert} />
        <ToolBtn label="ⓘ" title="Metadata" onClick={() => setShowMetaForm(true)} />
      </div>

      {/* ─── Textarea ─── */}
      <textarea
        ref={textareaRef}
        value={md}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        style={{
          flex: 1, width: '100%', minHeight: '50vh',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: 16,
          fontSize: 13.5, lineHeight: 1.6,
          color: 'var(--text)', resize: 'vertical',
          outline: 'none', caretColor: 'var(--chord)',
          boxSizing: 'border-box',
          fontFamily: 'var(--fm)',
        }}
      />

      {/* ─── Popups ─── */}
      {showChordPicker && (
        <ChordPicker
          anchorRect={chordAnchor}
          onSelect={handleChordSelect}
          onClose={() => setShowChordPicker(false)}
        />
      )}

      {showSectionMenu && (
        <Popup anchor={popupAnchor} onClose={() => setShowSectionMenu(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTION_TYPES.map(t => (
              <button key={t} onClick={() => handleSectionInsert(t)} style={menuItemStyle}>
                {t}
              </button>
            ))}
          </div>
        </Popup>
      )}

      {showCueInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowCueInput(false)}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={cueText}
              onChange={e => setCueText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCueInsert(); }}
              placeholder="Band cue text..."
              style={inputStyle}
            />
            <button onClick={handleCueInsert} style={popupBtnStyle}>Insert</button>
          </div>
        </Popup>
      )}

      {showNoteInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowNoteInput(false)}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNoteInsert(); }}
              placeholder="Inline note..."
              style={inputStyle}
            />
            <button onClick={handleNoteInsert} style={popupBtnStyle}>Insert</button>
          </div>
        </Popup>
      )}

      {showModMenu && (
        <Popup anchor={popupAnchor} onClose={() => setShowModMenu(false)}>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button key={n} onClick={() => handleModInsert(n)} style={{
                ...popupBtnStyle, width: 36, textAlign: 'center',
              }}>
                +{n}
              </button>
            ))}
          </div>
        </Popup>
      )}

      {showMetaForm && (
        <MetadataOverlay meta={parseMeta()} onSave={handleMetaSave} onClose={() => setShowMetaForm(false)} />
      )}

      {showTabEditor && (
        <TabGridEditor
          key={tabEditState?.range?.start ?? 'new'}
          initialTab={tabEditState?.initialTab}
          time={tabEditState?.time || parseMeta().time}
          onSave={handleTabEditorSave}
          onClose={() => { setShowTabEditor(false); setTabEditState(null); }}
        />
      )}
    </div>
  );
}

/* ─── Toolbar button ─── */
function ToolBtn({ label, title, onClick }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 7, padding: '5px 10px', cursor: 'pointer',
      color: 'var(--text)', fontSize: 14, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 4,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 15 }}>{label}</span>
      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--fm)' }}>{title}</span>
    </button>
  );
}

/* ─── Generic popup wrapper ─── */
function Popup({ anchor, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: anchor ? anchor.bottom + 4 : '50%',
      left: anchor ? Math.min(anchor.left, window.innerWidth - 260) : '50%',
      ...(anchor ? {} : { transform: 'translate(-50%, -50%)' }),
      zIndex: 100,
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: 180,
    }}>
      {children}
    </div>
  );
}

/* ─── Metadata overlay ─── */
function MetadataOverlay({ meta, onSave, onClose }) {
  const [form, setForm] = useState({ ...meta });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = [
    { key: 'title', label: 'Title', placeholder: 'Song title' },
    { key: 'artist', label: 'Artist', placeholder: 'Artist / band' },
    { key: 'key', label: 'Key', placeholder: 'C' },
    { key: 'tempo', label: 'Tempo', placeholder: '120' },
    { key: 'time', label: 'Time', placeholder: '4/4' },
    { key: 'structure', label: 'Structure', placeholder: 'Verse 1, Chorus, Verse 2, Chorus' },
    { key: 'ccli', label: 'CCLI', placeholder: 'CCLI number' },
    { key: 'tags', label: 'Tags', placeholder: 'worship, hymn, fast' },
    { key: 'capo', label: 'Capo', placeholder: '0' },
    { key: 'spotify', label: 'Spotify', placeholder: 'https://...' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://...' },
    { key: 'notes', label: 'Notes', placeholder: 'Performance notes' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: 12,
        border: '1px solid var(--border)',
        padding: 20, width: '90%', maxWidth: 420, maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 14 }}>
          Song Metadata
        </div>
        {fields.map(f => (
          <label key={f.key} style={{ display: 'block', marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
              display: 'block', marginBottom: 3,
            }}>
              {f.label}
            </span>
            <input
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{
                ...inputStyle, width: '100%',
              }}
            />
          </label>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            ...popupBtnStyle, background: 'var(--surface)', color: 'var(--text-muted)',
          }}>
            Cancel
          </button>
          <button onClick={() => onSave(form)} style={popupBtnStyle}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared styles ─── */
const menuItemStyle = {
  background: 'none', border: 'none', borderRadius: 6,
  padding: '6px 12px', textAlign: 'left', cursor: 'pointer',
  color: 'var(--text)', fontSize: 13, fontWeight: 500,
};

const inputStyle = {
  flex: 1, background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6, padding: '6px 10px',
  color: 'var(--text)', fontSize: 13,
  outline: 'none', fontFamily: 'var(--fm)',
  boxSizing: 'border-box',
};

const popupBtnStyle = {
  background: 'var(--accent-soft)',
  border: '1px solid var(--accent-border)',
  borderRadius: 6, padding: '6px 14px',
  color: 'var(--accent-text)', fontSize: 12,
  fontWeight: 600, cursor: 'pointer',
  whiteSpace: 'nowrap',
};
