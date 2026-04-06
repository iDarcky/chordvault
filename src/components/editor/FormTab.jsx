import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Input,
  Select,
  ListBoxItem,
  Card,
  CardContent,
  Button,
  Separator,
  TextArea,
  Accordion,
  AccordionItem
} from "@heroui/react";
import { parseSongMd, serializeTabBlock, parseTabBlock } from '../../parser';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';

const SECTION_TYPES = [
  'Intro', 'Verse', 'Pre Chorus', 'Chorus', 'Bridge',
  'Instrumental', 'Interlude', 'Tag', 'Vamp', 'Outro', 'Ending', 'Refrain',
];

const KEY_OPTIONS = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];

function parseInitialMeta(md) {
  try {
    const song = parseSongMd(md);
    return {
      title: song.title || '', artist: song.artist || '',
      key: song.key || 'C', tempo: String(song.tempo || 120),
      time: song.time || '4/4', structure: (song.structure || []).join(', '),
      ccli: song.ccli || '', tags: (song.tags || []).join(', '),
      capo: song.capo ? String(song.capo) : '', spotify: song.spotify || '',
      youtube: song.youtube || '', notes: song.notes || '',
    };
  } catch { return { title: '', artist: '', key: 'C', tempo: '120', time: '4/4', structure: '', ccli: '', tags: '', capo: '', spotify: '', youtube: '', notes: '' }; }
}

function parseInitialSections(md) {
  try {
    const song = parseSongMd(md);
    return song.sections.map(s => ({
      type: s.type,
      note: s.note || '',
      lyrics: s.lines.map(l => {
        if (typeof l === 'string') return l;
        if (l.type === 'tab') return serializeTabBlock(l);
        if (l.type === 'modulate') return `{modulate: ${l.semitones > 0 ? '+' : ''}${l.semitones}}`;
        return '';
      }).join('\n'),
    }));
  } catch { return []; }
}

export default function FormTab({ md, onChange }) {
  const [meta, setMeta] = useState(() => parseInitialMeta(md));
  const [sections, setSections] = useState(() => parseInitialSections(md));
  const [chordTarget, setChordTarget] = useState(null);
  const [chordAnchor, setChordAnchor] = useState(null);
  const [tabEditorTarget, setTabEditorTarget] = useState(null);
  const lyricRefs = useRef({});

  const generateMd = useCallback(() => {
    const lines = ['---'];
    if (meta.title) lines.push(`title: ${meta.title}`);
    if (meta.artist) lines.push(`artist: ${meta.artist}`);
    if (meta.key) lines.push(`key: ${meta.key}`);
    if (meta.tempo) lines.push(`tempo: ${meta.tempo}`);
    if (meta.time) lines.push(`time: ${meta.time}`);
    const structure = meta.structure || sections.map(s => s.type).join(', ');
    if (structure) lines.push(`structure: [${structure}]`);
    if (meta.ccli) lines.push(`ccli: ${meta.ccli}`);
    if (meta.tags) lines.push(`tags: [${meta.tags}]`);
    if (meta.capo) lines.push(`capo: ${meta.capo}`);
    if (meta.spotify) lines.push(`spotify: ${meta.spotify}`);
    if (meta.youtube) lines.push(`youtube: ${meta.youtube}`);
    if (meta.notes) lines.push(`notes: ${meta.notes}`);
    lines.push('---', '');
    for (const sec of sections) {
      lines.push(`## ${sec.type}`);
      if (sec.note) lines.push(`> ${sec.note}`);
      if (sec.lyrics.trim()) { lines.push(sec.lyrics.trim()); }
      lines.push('');
    }
    return lines.join('\n');
  }, [meta, sections]);

  useEffect(() => {
    const newMd = generateMd();
    if (newMd !== md) onChange(newMd);
  }, [generateMd]);

  const updateMeta = (key, val) => setMeta(m => ({ ...m, [key]: val }));
  const updateSection = (idx, field, val) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const addSection = () => {
    const typeCounts = {};
    sections.forEach(s => {
      const base = s.type.replace(/\s*\d+$/, '');
      typeCounts[base] = (typeCounts[base] || 0) + 1;
    });
    const type = sections.length === 0 ? 'Verse 1' : 'Verse ' + ((typeCounts['Verse'] || 0) + 1);
    setSections(prev => [...prev, { type, note: '', lyrics: '' }]);
  };

  const removeSection = (idx) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const moveSection = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    setSections(prev => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const changeSectionType = (idx, baseType) => {
    const count = sections.filter((s, i) => i < idx && s.type.replace(/\s*\d+$/, '') === baseType).length;
    const needsNumber = ['Verse', 'Pre Chorus', 'Chorus', 'Bridge'].includes(baseType);
    const label = needsNumber ? `${baseType} ${count + 1}` : baseType;
    updateSection(idx, 'type', label);
  };

  const openChordPicker = (sectionIdx, e) => {
    const ta = lyricRefs.current[sectionIdx];
    const cursorPos = ta ? ta.selectionStart : 0;
    setChordTarget({ sectionIdx, cursorPos });
    setChordAnchor(e.currentTarget.getBoundingClientRect());
  };

  const handleChordSelect = (chord) => {
    if (!chordTarget) return;
    const { sectionIdx, cursorPos } = chordTarget;
    const lyrics = sections[sectionIdx].lyrics;
    const insert = `[${chord}]`;
    const newLyrics = lyrics.substring(0, cursorPos) + insert + lyrics.substring(cursorPos);
    updateSection(sectionIdx, 'lyrics', newLyrics);
    setChordTarget(null);
    requestAnimationFrame(() => {
      const ta = lyricRefs.current[sectionIdx];
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = cursorPos + insert.length;
      }
    });
  };

  const handleTabEditorSave = (asciiBlock) => {
    if (!tabEditorTarget) return;
    const { sectionIdx, replaceRange } = tabEditorTarget;
    const lyrics = sections[sectionIdx].lyrics;
    if (replaceRange) {
      const newLyrics = lyrics.substring(0, replaceRange.start) + asciiBlock + lyrics.substring(replaceRange.end);
      updateSection(sectionIdx, 'lyrics', newLyrics);
    } else {
      const ta = lyricRefs.current[sectionIdx];
      const cursorPos = ta ? ta.selectionStart : lyrics.length;
      const needsNewline = lyrics.length > 0 && !lyrics.endsWith('\n');
      const insert = (needsNewline ? '\n' : '') + asciiBlock;
      updateSection(sectionIdx, 'lyrics', lyrics.substring(0, cursorPos) + insert + lyrics.substring(cursorPos));
    }
    setTabEditorTarget(null);
  };

  return (
    <div className="space-y-6">
      <Card shadow="sm" className="bg-content1 border-none">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-1">Song Info</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title" variant="flat" value={meta.title} onValueChange={v => updateMeta('title', v)} className="sm:col-span-2" />
            <Input label="Artist" variant="flat" value={meta.artist} onValueChange={v => updateMeta('artist', v)} className="sm:col-span-2" />
            <Select
              label="Key"
              variant="flat"
              selectedKeys={[meta.key]}
              onSelectionChange={keys => updateMeta('key', Array.from(keys)[0])}
              disallowEmptySelection
            >
              {KEY_OPTIONS.map(k => <ListBoxItem key={k} value={k}>{k}</ListBoxItem>)}
            </Select>
            <Input label="Tempo" variant="flat" type="number" value={meta.tempo} onValueChange={v => updateMeta('tempo', v)} />
            <Input label="Time" variant="flat" value={meta.time} onValueChange={v => updateMeta('time', v)} />
            <Input label="Capo" variant="flat" value={meta.capo} onValueChange={v => updateMeta('capo', v)} />
          </div>

          <Accordion className="px-0" itemClasses={{ title: "text-[11px] font-bold text-default-400 uppercase", trigger: "py-2" }}>
            <AccordionItem key="extra" aria-label="More Fields" title="More Fields">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                <Input label="CCLI" variant="flat" value={meta.ccli} onValueChange={v => updateMeta('ccli', v)} />
                <Input label="Tags" variant="flat" value={meta.tags} onValueChange={v => updateMeta('tags', v)} placeholder="worship, fast" />
                <Input label="Spotify" variant="flat" value={meta.spotify} onValueChange={v => updateMeta('spotify', v)} className="sm:col-span-2" />
                <Input label="YouTube" variant="flat" value={meta.youtube} onValueChange={v => updateMeta('youtube', v)} className="sm:col-span-2" />
                <TextArea label="Notes" variant="flat" value={meta.notes} onValueChange={v => updateMeta('notes', v)} className="sm:col-span-2" />
              </div>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((sec, idx) => {
          const baseType = sec.type.replace(/\s*\d+$/, '');
          return (
            <Card key={idx} shadow="sm" className="bg-content1 border-none">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Select
                    variant="flat"
                    size="sm"
                    className="w-36"
                    selectedKeys={[baseType]}
                    onSelectionChange={keys => changeSectionType(idx, Array.from(keys)[0])}
                    disallowEmptySelection
                  >
                    {SECTION_TYPES.map(t => <ListBoxItem key={t} value={t}>{t}</ListBoxItem>)}
                  </Select>
                  <span className="font-mono text-sm font-bold text-default-400">
                    {sec.type !== baseType ? sec.type.replace(baseType, '').trim() : ''}
                  </span>
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light" isDisabled={idx === 0} onPress={() => moveSection(idx, -1)}>▲</Button>
                    <Button isIconOnly size="sm" variant="light" isDisabled={idx === sections.length - 1} onPress={() => moveSection(idx, 1)}>▼</Button>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeSection(idx)}>✕</Button>
                  </div>
                </div>

                <Input
                  label="Band Cue"
                  variant="flat"
                  size="sm"
                  value={sec.note}
                  onValueChange={v => updateSection(idx, 'note', v)}
                  placeholder="e.g. Keys & light acoustic"
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">Lyrics & Chords</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="light" color="warning" className="font-bold font-mono h-6 px-2" onPress={e => openChordPicker(idx, e)}>+ Chord</Button>
                      <Button size="sm" variant="light" color="primary" className="font-bold font-mono h-6 px-2" onPress={() => setTabEditorTarget({ sectionIdx: idx })}>+ Tab</Button>
                    </div>
                  </div>

                  {(() => {
                    const tabBlocks = [];
                    const openRegex = /\{tab(?:,\s*[^}]*)?\}/g;
                    let m;
                    while ((m = openRegex.exec(sec.lyrics)) !== null) {
                      const closeIdx = sec.lyrics.indexOf('{/tab}', m.index + m[0].length);
                      if (closeIdx !== -1) {
                        tabBlocks.push({ start: m.index, end: closeIdx + '{/tab}'.length, header: m[0] });
                      }
                    }
                    if (tabBlocks.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2 mb-2 px-1">
                        {tabBlocks.map((tb, ti) => (
                          <Button
                            key={ti}
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="h-6 px-2 text-[10px] font-bold font-mono"
                            onPress={() => {
                              const blockText = sec.lyrics.substring(tb.start + tb.header.length, tb.end - '{/tab}'.length).trim();
                              const rawLines = blockText.split('\n').filter(l => l.trim());
                              const parsed = parseTabBlock(rawLines);
                              const timePart = tb.header.match(/time:\s*(\S+)/);
                              parsed.time = timePart ? timePart[1] : null;
                              setTabEditorTarget({ sectionIdx: idx, initialTab: parsed, replaceRange: { start: tb.start, end: tb.end } });
                            }}
                          >
                            Edit Tab ${tabBlocks.length > 1 ? ti + 1 : ''}
                          </Button>
                        ))}
                      </div>
                    );
                  })()}

                  <TextArea
                    ref={el => { lyricRefs.current[idx] = el; }}
                    variant="flat"
                    value={sec.lyrics}
                    onValueChange={v => updateSection(idx, 'lyrics', v)}
                    placeholder="[C]Type lyrics with [G]chords in brackets"
                    className="font-mono"
                    classNames={{ input: "leading-relaxed text-[14px]" }}
                    minRows={3}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onPress={addSection}
        variant="dashed"
        className="w-full h-14 border-2 border-divider font-bold text-primary"
      >
        + Add Section
      </Button>

      {chordTarget !== null && (
        <ChordPicker
          anchorRect={chordAnchor}
          onSelect={handleChordSelect}
          onClose={() => setChordTarget(null)}
        />
      )}

      {tabEditorTarget !== null && (
        <TabGridEditor
          key={tabEditorTarget.replaceRange?.start ?? 'new'}
          initialTab={tabEditorTarget.initialTab}
          time={tabEditorTarget.initialTab?.time || meta.time || '4/4'}
          onSave={handleTabEditorSave}
          onClose={() => setTabEditorTarget(null)}
        />
      )}
    </div>
  );
}
