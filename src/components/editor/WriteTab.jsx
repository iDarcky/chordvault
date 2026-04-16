import { useState, useEffect, useRef, useCallback } from 'react';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { parseTabBlock, splitMd, parseFrontmatterFields } from '../../parser';
import { Button } from '../ui/Button';

const SECTION_TYPES = [
  'Intro', 'Verse', 'Pre Chorus', 'Chorus', 'Bridge',
  'Instrumental', 'Interlude', 'Tag', 'Vamp', 'Outro', 'Ending', 'Refrain',
];

export default function WriteTab({ md, onChange, textareaRef }) {
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showCueInput, setShowCueInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showModMenu, setShowModMenu] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [tabEditState, setTabEditState] = useState(null);
  const [chordAnchor, setChordAnchor] = useState(null);
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [cueText, setCueText] = useState('');
  const [noteText, setNoteText] = useState('');

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
  }, [onChange, textareaRef]);

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
  }, [onChange, textareaRef]);

  // ─── Section insertion with auto-numbering ───
  const handleSectionInsert = useCallback((type) => {
    const regex = new RegExp(`^## ${type}(\\s+\\d+)?$`, 'gm');
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
  }, [md, textareaRef]);

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

  // Get time sig from frontmatter for TabGridEditor
  const getTime = () => {
    const fields = parseFrontmatterFields(splitMd(md).frontmatter);
    return fields.time || '4/4';
  };

  return (
    <div className="flex flex-col h-full">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap gap-1 py-1.5 border-b border-[var(--ds-gray-300)] mb-2">
        <ToolBtn label="♪" title="Chord" onClick={openChordPicker} />
        <ToolBtn label="§" title="Section" onClick={(e) => openPopup(setShowSectionMenu, e)} />
        <ToolBtn label="📢" title="Cue" onClick={(e) => openPopup(setShowCueInput, e)} />
        <ToolBtn label="💬" title="Note" onClick={(e) => openPopup(setShowNoteInput, e)} />
        <ToolBtn label="↑" title="Modulate" onClick={(e) => openPopup(setShowModMenu, e)} />
        <ToolBtn label="┃" title="Tab" onClick={handleTabInsert} />
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

      {/* ─── Syntax Reference ─── */}
      <button
        onClick={() => setShowRef(v => !v)}
        className="bg-transparent border-none cursor-pointer text-[var(--color-brand-text)] text-label-12 font-semibold font-mono py-2 text-left flex items-center gap-1.5"
      >
        <span className="text-[10px]">{showRef ? '▾' : '▸'}</span>
        Syntax Reference
      </button>

      {showRef && (
        <div className="mb-2.5 p-3 rounded-lg bg-[var(--color-brand-soft)] border border-[var(--color-brand-border)] text-copy-11 text-[var(--ds-gray-600)] leading-relaxed font-mono">
          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Frontmatter</strong> (between <code>---</code> delimiters):
          </div>
          <div className="pl-2.5 mb-2 text-[var(--ds-gray-500)]">
            title: Song Name<br />
            artist: Artist Name<br />
            key: C<br />
            tempo: 120<br />
            time: 4/4<br />
            structure: [Verse 1, Chorus, Verse 2, Chorus]<br />
            <span className="opacity-50">tags, ccli, spotify, youtube, capo, notes — optional</span>
          </div>
          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Sections & Chords:</strong>
          </div>
          <div className="pl-2.5 text-[var(--ds-gray-500)] mb-2">
            <strong className="text-[var(--color-brand-text)]">## Section Name</strong> — starts a section<br />
            <strong className="text-[var(--chord)]">[Chord]</strong>lyrics — inline chords above lyrics<br />
            <strong className="text-[var(--ds-gray-600)]">&gt; note</strong> — band cue<br />
          </div>
          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Tab Blocks:</strong>
          </div>
          <div className="pl-2.5 text-[var(--ds-gray-500)]">
            <strong className="text-[var(--color-brand-text)]">{'{'}</strong>tab{'}'} ... {'{'}/tab{'}'}<br />
            <span className="text-[var(--chord)]">e|--0--2h3--|</span> — string lines (e B G D A E)<br />
            <span className="opacity-70">Techniques: </span>
            <strong className="text-[var(--chord)]">h</strong> hammer &nbsp;
            <strong className="text-[var(--chord)]">p</strong> pull &nbsp;
            <strong className="text-[var(--chord)]">s</strong> slide &nbsp;
            <strong className="text-[var(--chord)]">b</strong> bend &nbsp;
            <strong className="text-[var(--chord)]">x</strong> mute &nbsp;
            <strong className="text-[var(--chord)]">~</strong> vibrato
          </div>
        </div>
      )}

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

      {showTabEditor && (
        <TabGridEditor
          key={tabEditState?.range?.start ?? 'new'}
          initialTab={tabEditState?.initialTab}
          time={tabEditState?.time || getTime()}
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
