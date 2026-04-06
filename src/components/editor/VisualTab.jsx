import { useState, useEffect, useRef, useCallback } from 'react';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { parseTabBlock } from '../../parser';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

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
  const [tabEditState, setTabEditState] = useState(null);
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
      const selected = val.substring(start, end);
      insert = opts.wrapSelection.replace('$1', selected);
      newCursor = start + insert.length;
    }

    if (opts.newLine) {
      const before = val.substring(0, start);
      const needsNewLine = before.length > 0 && !before.endsWith('\n');
      const needsBlankLine = before.length > 0 && !before.endsWith('\n\n');
      const prefix = needsBlankLine ? (needsNewLine ? '\n\n' : '\n') : '';
      insert = prefix + insert;
      newCursor = start + insert.length;
    }

    const newVal = val.substring(0, start) + insert + val.substring(end);
    onChange(newVal);

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
      const selected = val.substring(start, end);
      const insert = `[${chord}]${selected}`;
      const newVal = val.substring(0, start) + insert + val.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
        ta.focus();
      });
    } else {
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
    const regex = new RegExp(`^## ${type}(\\\\s+\\\\d+)?$`, 'gm');
    const matches = md.match(regex);
    const count = matches ? matches.length : 0;

    const needsNumber = ['Verse', 'Pre Chorus', 'Chorus', 'Bridge'].includes(type);
    const label = needsNumber ? `${type} ${count + 1}` : (count > 0 ? `${type} ${count + 1}` : type);

    insertAtCursor(`## ${label}\n`, { newLine: true });
    setShowSectionMenu(false);
  }, [md, insertAtCursor]);

  const handleCueInsert = useCallback(() => {
    if (!cueText.trim()) return;
    insertAtCursor(`> ${cueText.trim()}\n`, { newLine: true });
    setCueText('');
    setShowCueInput(false);
  }, [cueText, insertAtCursor]);

  const handleNoteInsert = useCallback(() => {
    if (!noteText.trim()) return;
    insertAtCursor(`{!${noteText.trim()}}`);
    setNoteText('');
    setShowNoteInput(false);
  }, [noteText, insertAtCursor]);

  const handleModInsert = useCallback((n) => {
    insertAtCursor(`{modulate: +${n}}\n`, { newLine: true });
    setShowModMenu(false);
  }, [insertAtCursor]);

  const handleTabInsert = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) { setTabEditState(null); setShowTabEditor(true); return; }
    const cursorPos = ta.selectionStart;
    const val = ta.value;

    const openRegex = /\{tab(?:,\s*[^}]*)?\}/g;
    let editState = null;
    let match;
    while ((match = openRegex.exec(val)) !== null) {
      const blockStart = match.index;
      const closeIdx = val.indexOf('{/tab}', match.index + match[0].length);
      if (closeIdx === -1) continue;
      const blockEnd = closeIdx + '{/tab}'.length;
      if (cursorPos >= blockStart && cursorPos <= blockEnd) {
        const blockText = val.substring(match.index + match[0].length, closeIdx).trim();
        const rawLines = blockText.split('\n').filter(l => l.trim());
        const parsed = parseTabBlock(rawLines);
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
    <div className="flex flex-col h-full">
      {/* ─── Toolbar ─── */}
      <div ref={toolbarRef} className="flex flex-wrap gap-1 py-1.5 border-b border-[var(--ds-gray-300)] mb-2">
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
        className="flex-1 w-full min-h-[50vh] bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-lg p-4 text-copy-13 leading-relaxed text-[var(--ds-gray-1000)] resize-y outline-none font-mono"
        style={{ caretColor: 'var(--chord)' }}
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
          <div className="flex flex-col gap-0.5">
            {SECTION_TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleSectionInsert(t)}
                className="bg-transparent border-none rounded-md px-3 py-1.5 text-left cursor-pointer text-copy-13 font-medium text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-200)] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </Popup>
      )}

      {showCueInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowCueInput(false)}>
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={cueText}
              onChange={e => setCueText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCueInsert(); }}
              placeholder="Band cue text..."
              className="flex-1 px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none font-mono"
            />
            <Button variant="brand" size="xs" onClick={handleCueInsert}>Insert</Button>
          </div>
        </Popup>
      )}

      {showNoteInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowNoteInput(false)}>
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNoteInsert(); }}
              placeholder="Inline note..."
              className="flex-1 px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none font-mono"
            />
            <Button variant="brand" size="xs" onClick={handleNoteInsert}>Insert</Button>
          </div>
        </Popup>
      )}

      {showModMenu && (
        <Popup anchor={popupAnchor} onClose={() => setShowModMenu(false)}>
          <div className="flex gap-1 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <Button key={n} variant="brand" size="xs" onClick={() => handleModInsert(n)} className="w-9 text-center justify-center">
                +{n}
              </Button>
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
    <button
      onClick={onClick}
      title={title}
      className="bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-lg px-2.5 py-1.5 cursor-pointer text-[var(--ds-gray-1000)] text-[14px] font-semibold flex items-center gap-1 whitespace-nowrap hover:bg-[var(--ds-gray-200)] hover:border-[var(--ds-gray-600)] transition-colors"
    >
      <span className="text-[15px]">{label}</span>
      <span className="text-label-10 text-[var(--ds-gray-600)] font-mono">{title}</span>
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
    <div
      ref={ref}
      className="fixed z-[100] bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] rounded-xl p-2.5 min-w-[180px]"
      style={{
        top: anchor ? anchor.bottom + 4 : '50%',
        left: anchor ? Math.min(anchor.left, window.innerWidth - 260) : '50%',
        ...(anchor ? {} : { transform: 'translate(-50%, -50%)' }),
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
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
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[var(--ds-background-200)] rounded-xl border border-[var(--ds-gray-400)] p-5 w-[90%] max-w-[420px] max-h-[80vh] overflow-auto"
      >
        <div className="text-heading-16 text-[var(--ds-gray-1000)] mb-3.5">
          Song Metadata
        </div>
        {fields.map(f => (
          <label key={f.key} className="block mb-2.5">
            <span className="section-title text-[10px] block mb-0.5">
              {f.label}
            </span>
            <input
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-2.5 py-1.5 bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-md text-copy-13 text-[var(--ds-gray-1000)] outline-none font-mono"
            />
          </label>
        ))}
        <div className="flex gap-2 mt-3.5 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="brand" size="sm" onClick={() => onSave(form)}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
