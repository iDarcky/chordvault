import React, { useState, useCallback, useRef } from 'react';
import {
  Button,
  ButtonGroup,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  TextArea
} from "@heroui/react";
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { parseTabBlock } from '../../parser';

const SECTION_TYPES = [
  'Intro', 'Verse', 'Pre Chorus', 'Chorus', 'Bridge',
  'Instrumental', 'Interlude', 'Tag', 'Vamp', 'Outro', 'Ending', 'Refrain',
];

export default function VisualTab({ md, onChange, textareaRef }) {
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [chordAnchor, setChordAnchor] = useState(null);
  const [isCueOpen, setIsCueOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [showTabEditor, setShowTabEditor] = useState(false);
  const [tabEditState, setTabEditState] = useState(null);

  const [cueText, setCueText] = useState('');
  const [noteText, setNoteText] = useState('');

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
      insert = opts.wrapSelection.replace('', selected);
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
    insertAtCursor(`## ${label}\n`, { newLine: true });
  }, [md, insertAtCursor]);

  const handleCueInsert = useCallback(() => {
    if (!cueText.trim()) return;
    insertAtCursor(`> ${cueText.trim()}\n`, { newLine: true });
    setCueText('');
    setIsCueOpen(false);
  }, [cueText, insertAtCursor]);

  const handleNoteInsert = useCallback(() => {
    if (!noteText.trim()) return;
    insertAtCursor(`{!${noteText.trim()}}`);
    setNoteText('');
    setIsNoteOpen(false);
  }, [noteText, insertAtCursor]);

  const handleModInsert = useCallback((n) => {
    insertAtCursor(`{modulate: +${n}}\n`, { newLine: true });
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

  const handleMetaSave = (meta) => {
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
    const body = fmMatch ? md.substring(fmMatch[0].length) : '\n' + md;
    const lines = [];
    Object.entries(meta).forEach(([k, v]) => {
      if (v) {
        if (k === 'tags' || k === 'structure') lines.push(`${k}: [${v}]`);
        else lines.push(`${k}: ${v}`);
      }
    });
    onChange(`---\n${lines.join('\n')}\n---${body}`);
    setIsMetaOpen(false);
  };

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

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-wrap gap-1.5 p-2 bg-content2/50 rounded-xl border border-divider">
        <Tooltip content="Add Chord"><Button isIconOnly variant="flat" size="sm" className="font-mono text-warning font-black" onPress={e => { setChordAnchor(e.currentTarget.getBoundingClientRect()); setShowChordPicker(true); }}>♪</Button></Tooltip>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <Dropdown backdrop="blur">
          <DropdownTrigger><Button variant="flat" size="sm" className="font-bold">Section</Button></DropdownTrigger>
          <DropdownMenu aria-label="Insert Section" onAction={key => handleSectionInsert(key)}>
            {SECTION_TYPES.map(t => <DropdownItem key={t}>{t}</DropdownItem>)}
          </DropdownMenu>
        </Dropdown>

        <Button variant="flat" size="sm" className="font-bold" onPress={() => setIsCueOpen(true)}>Cue</Button>
        <Button variant="flat" size="sm" className="font-bold" onPress={() => setIsNoteOpen(true)}>Note</Button>

        <Dropdown backdrop="blur">
          <DropdownTrigger><Button variant="flat" size="sm" className="font-bold">Mod</Button></DropdownTrigger>
          <DropdownMenu aria-label="Modulate" onAction={key => handleModInsert(key)}>
            {[1, 2, 3, 4, 5, 6, 7].map(n => <DropdownItem key={String(n)}>+${n} Semitones</DropdownItem>)}
          </DropdownMenu>
        </Dropdown>

        <Separator orientation="vertical" className="h-8 mx-1" />

        <Button variant="flat" size="sm" color="primary" className="font-bold" onPress={handleTabInsert}>Tab</Button>
        <Button variant="flat" size="sm" className="font-bold" onPress={() => setIsMetaOpen(true)}>Meta</Button>
      </div>

      <TextArea
        ref={textareaRef}
        value={md}
        onValueChange={onChange}
        variant="flat"
        className="flex-1 font-mono"
        classNames={{
          input: "min-h-[50vh] text-[14px] leading-relaxed caret-warning",
          inputWrapper: "h-full p-4 bg-content1"
        }}
        placeholder="Type here..."
      />

      {showChordPicker && (
        <ChordPicker
          anchorRect={chordAnchor}
          onSelect={handleChordSelect}
          onClose={() => setShowChordPicker(false)}
        />
      )}

      {/* Cue Modal */}
      <Modal isOpen={isCueOpen} onClose={() => setIsCueOpen(false)} placement="center">
        <ModalDialog>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-foreground">Add Band Cue</ModalHeader>
              <ModalBody>
                <Input autoFocus label="Cue Text" placeholder="e.g. Building energy..." value={cueText} onValueChange={setCueText} onKeyDown={e => e.key === 'Enter' && handleCueInsert()} />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={handleCueInsert}>Insert</Button>
              </ModalFooter>
            </>
          )}
        </ModalDialog>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} placement="center">
        <ModalDialog>
          {(onClose) => (
            <>
              <ModalHeader className="font-bold text-foreground">Add Inline Note</ModalHeader>
              <ModalBody>
                <Input autoFocus label="Note" placeholder="e.g. Lead vox only" value={noteText} onValueChange={setNoteText} onKeyDown={e => e.key === 'Enter' && handleNoteInsert()} />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button color="primary" onPress={handleNoteInsert}>Insert</Button>
              </ModalFooter>
            </>
          )}
        </ModalDialog>
      </Modal>

      {/* Meta Modal */}
      <Modal isOpen={isMetaOpen} onClose={() => setIsMetaOpen(false)} placement="center" scrollBehavior="inside" size="lg">
        <ModalDialog>
          {(onClose) => (
            <MetaForm initialMeta={parseMeta()} onSave={handleMetaSave} onClose={onClose} />
          )}
        </ModalDialog>
      </Modal>

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

function MetaForm({ initialMeta, onSave, onClose }) {
  const [form, setForm] = useState({ ...initialMeta });
  return (
    <>
      <ModalHeader className="font-black text-foreground">Song Metadata</ModalHeader>
      <ModalBody className="gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Title" variant="flat" value={form.title} onValueChange={v => setForm({...form, title: v})} className="col-span-2" />
          <Input label="Artist" variant="flat" value={form.artist} onValueChange={v => setForm({...form, artist: v})} className="col-span-2" />
          <Input label="Key" variant="flat" value={form.key} onValueChange={v => setForm({...form, key: v})} />
          <Input label="Tempo" variant="flat" value={form.tempo} onValueChange={v => setForm({...form, tempo: v})} />
          <Input label="Time" variant="flat" value={form.time} onValueChange={v => setForm({...form, time: v})} />
          <Input label="Capo" variant="flat" value={form.capo} onValueChange={v => setForm({...form, capo: v})} />
          <Input label="CCLI" variant="flat" value={form.ccli} onValueChange={v => setForm({...form, ccli: v})} className="col-span-2" />
          <Input label="Tags" variant="flat" value={form.tags} onValueChange={v => setForm({...form, tags: v})} className="col-span-2" />
          <TextArea label="Notes" variant="flat" value={form.notes} onValueChange={v => setForm({...form, notes: v})} className="col-span-2" />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose}>Cancel</Button>
        <Button color="primary" onPress={() => onSave(form)}>Apply</Button>
      </ModalFooter>
    </>
  );
}

function Separator({ className, orientation = "horizontal" }) {
  return <div className={`bg-divider ${orientation === "horizontal" ? "h-px w-full" : "w-px h-full"} ${className}`} />;
}
