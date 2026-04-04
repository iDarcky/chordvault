import { useState, useEffect, useRef, useCallback } from 'react';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { parseTabBlock } from '../../parser';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

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
  }, [onChange, textareaRef]);

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
  }, [onChange, textareaRef]);

  const handleSectionInsert = useCallback((type) => {
    const regex = new RegExp(`^## ${type}(\\s+\\d+)?$`, 'gm');
    const matches = md.match(regex);
    const count = matches ? matches.length : 0;
    const needsNumber = ['Verse', 'Pre Chorus', 'Chorus', 'Bridge'].includes(type);
    const label = needsNumber ? `${type} ${count + 1}` : (count > 0 ? `${type} ${count + 1}` : type);

    insertAtCursor(`## ${label}\\n`, { newLine: true });
    setShowSectionMenu(false);
  }, [md, insertAtCursor]);

  const handleCueInsert = useCallback(() => {
    if (!cueText.trim()) return;
    insertAtCursor(`> ${cueText.trim()}\\n`, { newLine: true });
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
    insertAtCursor(`{modulate: +${n}}\\n`, { newLine: true });
    setShowModMenu(false);
  }, [insertAtCursor]);

  const handleTabInsert = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) { setTabEditState(null); setShowTabEditor(true); return; }
    const cursorPos = ta.selectionStart;
    const val = ta.value;

    const openRegex = /\{tab(?:,\\s*[^}]*)?\}/g;
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
  }, [textareaRef]);

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
    <div className="flex flex-col h-full bg-accents-1/30 rounded-geist overflow-hidden border border-accents-2">
      {/* Toolbar */}
      <div
        ref={toolbarRef}
        className="flex flex-wrap gap-2 p-3 bg-background border-b border-accents-2 sticky top-0 z-10"
      >
        <ToolBtn icon="♪" label="CHORD" onClick={openChordPicker} />
        <ToolBtn icon="§" label="SECTION" onClick={(e) => openPopup(setShowSectionMenu, e)} />
        <ToolBtn icon="📢" label="CUE" onClick={(e) => openPopup(setShowCueInput, e)} />
        <ToolBtn icon="💬" label="NOTE" onClick={(e) => openPopup(setShowNoteInput, e)} />
        <ToolBtn icon="↑" label="MOD" onClick={(e) => openPopup(setShowModMenu, e)} />
        <ToolBtn icon="┃" label="TAB" onClick={handleTabInsert} />
        <div className="flex-1" />
        <ToolBtn icon="ⓘ" label="INFO" onClick={() => setShowMetaForm(true)} variant="secondary" />
      </div>

      {/* Textarea Area */}
      <div className="flex-1 relative p-4 bg-accents-1/10 overflow-hidden flex flex-col">
        <textarea
          ref={textareaRef}
          value={md}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed font-mono resize-none outline-none p-0 caret-geist-link"
          placeholder="Start writing your chord chart..."
        />
      </div>

      {/* Popups */}
      {showChordPicker && (
        <ChordPicker
          anchorRect={chordAnchor}
          onSelect={handleChordSelect}
          onClose={() => setShowChordPicker(false)}
        />
      )}

      {showSectionMenu && (
        <Popup anchor={popupAnchor} onClose={() => setShowSectionMenu(false)}>
          <div className="grid grid-cols-2 gap-1 min-w-[240px]">
            {SECTION_TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleSectionInsert(t)}
                className="px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-left rounded-geist hover:bg-accents-1 transition-colors border-none bg-transparent cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </Popup>
      )}

      {showCueInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowCueInput(false)}>
          <div className="flex gap-2">
            <Input
              autoFocus
              value={cueText}
              onChange={e => setCueText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCueInsert(); }}
              placeholder="Band cue text..."
              className="h-9 text-xs"
            />
            <Button size="sm" onClick={handleCueInsert} className="h-9">INSERT</Button>
          </div>
        </Popup>
      )}

      {showNoteInput && (
        <Popup anchor={popupAnchor} onClose={() => setShowNoteInput(false)}>
          <div className="flex gap-2">
            <Input
              autoFocus
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNoteInsert(); }}
              placeholder="Inline note..."
              className="h-9 text-xs"
            />
            <Button size="sm" onClick={handleNoteInsert} className="h-9">INSERT</Button>
          </div>
        </Popup>
      )}

      {showModMenu && (
        <Popup anchor={popupAnchor} onClose={() => setShowModMenu(false)}>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <Button
                key={n}
                onClick={() => handleModInsert(n)}
                variant="secondary"
                className="h-10 w-10 p-0 font-mono font-bold"
              >
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

function ToolBtn({ icon, label, title, onClick, variant = "primary" }) {
  return (
    <Button
      variant={variant === "primary" ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-9 px-3 gap-2 border-accents-2",
        variant === "ghost" ? "text-accents-4 hover:text-foreground" : "bg-background shadow-sm"
      )}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">{label}</span>
    </Button>
  );
}

function Popup({ anchor, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-[300] bg-background border border-accents-2 rounded-geist p-2 shadow-2xl animate-in fade-in slide-in-from-top-1"
      style={{
        top: anchor ? anchor.bottom + 8 : '50%',
        left: anchor ? Math.min(anchor.left, window.innerWidth - 280) : '50%',
        ...(anchor ? {} : { transform: 'translate(-50%, -50%)' }),
      }}
    >
      {children}
    </div>
  );
}

function MetadataOverlay({ meta, onSave, onClose }) {
  const [form, setForm] = useState({ ...meta });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fields = [
    { key: 'title', label: 'Title', placeholder: 'Song title' },
    { key: 'artist', label: 'Artist', placeholder: 'Artist / band' },
    { key: 'key', label: 'Key', placeholder: 'C' },
    { key: 'tempo', label: 'Tempo', placeholder: '120' },
    { key: 'time', label: 'Time', placeholder: '4/4' },
    { key: 'structure', label: 'Structure', placeholder: 'Verse 1, Chorus, Verse 2' },
    { key: 'ccli', label: 'CCLI', placeholder: 'CCLI number' },
    { key: 'tags', label: 'Tags', placeholder: 'worship, hymn, fast' },
    { key: 'capo', label: 'Capo', placeholder: '0' },
    { key: 'spotify', label: 'Spotify', placeholder: 'https://...' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://...' },
    { key: 'notes', label: 'Notes', placeholder: 'Performance notes' },
  ];

  return (
    <div className="fixed inset-0 z-[400] bg-background/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <CardHeader className="p-6 border-b border-accents-2">
          <CardTitle className="text-xl tracking-tight">Song Metadata</CardTitle>
        </CardHeader>
        <CardContent className="p-6 max-h-[60vh] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-1.5 block font-mono">
                  {f.label}
                </label>
                <Input
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="bg-accents-1 border-accents-2 h-9 text-xs"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <div className="flex gap-2 p-6 border-t border-accents-2 justify-end bg-accents-1/30">
          <Button variant="secondary" size="sm" onClick={onClose} className="px-6 font-bold uppercase tracking-widest text-[11px]">
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(form)} className="px-6 font-bold uppercase tracking-widest text-[11px]">
            Apply Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
