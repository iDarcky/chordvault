import { useState, useEffect, useCallback, useRef } from 'react';
import { parseSongMd, serializeTabBlock, parseTabBlock } from '../../parser';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

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
      if (sec.lyrics.trim()) {
        lines.push(sec.lyrics.trim());
      }
      lines.push('');
    }
    return lines.join('\n');
  }, [meta, sections]);

  useEffect(() => {
    const newMd = generateMd();
    if (newMd !== md) onChange(newMd);
  }, [generateMd, md, onChange]);

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
    <div className="flex flex-col gap-8 pb-10">
      <Card className="bg-accents-1 border-accents-2 shadow-none">
        <CardContent className="p-6">
          <div className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-4 font-mono">
            Song Identity
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <FieldLabel>Title</FieldLabel>
              <Input value={meta.title} onChange={e => updateMeta('title', e.target.value)} placeholder="Song title" className="bg-background h-10 text-sm font-semibold" />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Artist</FieldLabel>
              <Input value={meta.artist} onChange={e => updateMeta('artist', e.target.value)} placeholder="Artist / band" className="bg-background h-10 text-sm font-semibold" />
            </div>
            <div>
              <FieldLabel>Key</FieldLabel>
              <select
                value={meta.key}
                onChange={e => updateMeta('key', e.target.value)}
                className="w-full h-10 px-3 bg-background border border-accents-2 rounded-geist text-sm font-mono font-bold outline-none focus:border-foreground"
              >
                {KEY_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Tempo</FieldLabel>
              <Input value={meta.tempo} onChange={e => updateMeta('tempo', e.target.value)} type="number" placeholder="120" className="bg-background font-mono h-10" />
            </div>
            <div>
              <FieldLabel>Time</FieldLabel>
              <Input value={meta.time} onChange={e => updateMeta('time', e.target.value)} placeholder="4/4" className="bg-background font-mono h-10" />
            </div>
            <div>
              <FieldLabel>Capo</FieldLabel>
              <Input value={meta.capo} onChange={e => updateMeta('capo', e.target.value)} placeholder="0" className="bg-background font-mono h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-accents-2 pb-2 mx-1">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-tight">Song Sections</h2>
          <Badge variant="outline" className="font-mono text-[10px]">{sections.length} TOTAL</Badge>
        </div>

        {sections.map((sec, idx) => {
          const baseType = sec.type.replace(/\s*\d+$/, '');
          return (
            <Card key={idx} className="border-accents-2 overflow-hidden bg-background group shadow-sm transition-all hover:border-accents-3">
              <div className="flex items-center gap-2 p-3 bg-accents-1/30 border-b border-accents-2">
                <select
                  value={baseType}
                  onChange={e => changeSectionType(idx, e.target.value)}
                  className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-foreground focus:ring-0 outline-none cursor-pointer"
                >
                  {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-xs font-mono font-bold text-accents-4">
                  {sec.type !== baseType ? sec.type.replace(baseType, '').trim() : ''}
                </span>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="p-1 text-accents-3 hover:text-foreground disabled:opacity-20 border-none bg-transparent cursor-pointer text-xs">▲</button>
                  <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="p-1 text-accents-3 hover:text-foreground disabled:opacity-20 border-none bg-transparent cursor-pointer text-xs">▼</button>
                  <button onClick={() => removeSection(idx)} className="p-1 text-accents-3 hover:text-geist-error border-none bg-transparent cursor-pointer text-xs ml-1">✕</button>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div>
                  <FieldLabel>Section Note (Band Cue)</FieldLabel>
                  <Input
                    value={sec.note}
                    onChange={e => updateSection(idx, 'note', e.target.value)}
                    placeholder="e.g. Keys & light acoustic"
                    className="bg-accents-1 h-9 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Lyrics & Chords</FieldLabel>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={(e) => openChordPicker(idx, e)} className="h-7 px-2 text-[10px] font-bold tracking-tight">
                        + CHORD
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setTabEditorTarget({ sectionIdx: idx })} className="h-7 px-2 text-[10px] font-bold tracking-tight">
                        + TAB
                      </Button>
                    </div>
                  </div>

                  {(() => {
                    const tabBlocks = [];
                    const openRegex = /\{tab(?:,\\s*[^}]*)?\}/g;
                    let m;
                    while ((m = openRegex.exec(sec.lyrics)) !== null) {
                      const closeIdx = sec.lyrics.indexOf('{/tab}', m.index + m[0].length);
                      if (closeIdx !== -1) {
                        tabBlocks.push({ start: m.index, end: closeIdx + '{/tab}'.length, header: m[0] });
                      }
                    }
                    if (tabBlocks.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tabBlocks.map((tb, ti) => (
                          <Badge
                            key={ti}
                            onClick={() => {
                              const blockText = sec.lyrics.substring(tb.start + tb.header.length, tb.end - '{/tab}'.length).trim();
                              const rawLines = blockText.split('\n').filter(l => l.trim());
                              const parsed = parseTabBlock(rawLines);
                              const timePart = tb.header.match(/time:\s*(\S+)/);
                              parsed.time = timePart ? timePart[1] : null;
                              setTabEditorTarget({ sectionIdx: idx, initialTab: parsed, replaceRange: { start: tb.start, end: tb.end } });
                            }}
                            variant="outline"
                            className="cursor-pointer font-mono text-[9px] bg-geist-link/5 border-geist-link/20 text-geist-link hover:bg-geist-link/10 transition-colors"
                          >
                            EDIT TAB ${tabBlocks.length > 1 ? ti + 1 : ''}
                          </Badge>
                        ))}
                      </div>
                    );
                  })()}

                  <textarea
                    ref={el => { lyricRefs.current[idx] = el; }}
                    value={sec.lyrics}
                    onChange={e => updateSection(idx, 'lyrics', e.target.value)}
                    placeholder="[C]Type lyrics with [G]chords in brackets"
                    spellCheck={false}
                    className="w-full min-h-[100px] p-3 bg-accents-1 border border-accents-2 rounded-geist text-sm leading-relaxed font-mono outline-none focus:border-foreground resize-none caret-geist-link"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button
          variant="secondary"
          onClick={addSection}
          className="w-full h-12 border-dashed border-2 border-accents-2 text-accents-4 hover:border-accents-3 hover:text-accents-5 transition-all font-bold uppercase tracking-widest text-[11px]"
        >
          + ADD SECTION
        </Button>
      </div>

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

function FieldLabel({ children }) {
  return (
    <label className="text-[10px] font-bold text-accents-4 uppercase tracking-widest mb-1.5 block font-mono">
      {children}
    </label>
  );
}
