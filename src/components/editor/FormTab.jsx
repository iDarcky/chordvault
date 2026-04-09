import { useState, useEffect, useCallback, useRef } from 'react';
import { parseSongMd, serializeTabBlock, parseTabBlock } from '../../parser';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';

const SECTION_TYPES = [
  'Intro', 'Verse', 'Pre Chorus', 'Chorus', 'Bridge',
  'Instrumental', 'Interlude', 'Tag', 'Vamp', 'Outro', 'Ending', 'Refrain',
];

const KEY_OPTIONS = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];

// Parse md into initial form state
function parseInitialMeta(md) {
  try {
    const song = parseSongMd(md);
    return {
      title: song.title || '', artist: song.artist || '',
      key: song.key || 'C', tempo: String(song.tempo || 120),
      time: song.time || '4/4',
      structure: Array.isArray(song.structure) ? song.structure.join(', ') : (song.structure || ''),
      ccli: song.ccli || '',
      tags: Array.isArray(song.tags) ? song.tags.join(', ') : (song.tags || ''),
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
  const isInternalUpdate = useRef(false);

  // Re-sync form state when md changes externally (e.g. from Raw/Visual tab edits)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setMeta(parseInitialMeta(md));
    setSections(parseInitialSections(md));
  }, [md]);

  // ─── Generate md from form state whenever it changes ───
  const generateMd = useCallback(() => {
    const lines = ['---'];
    if (meta.title) lines.push(`title: ${meta.title}`);
    if (meta.artist) lines.push(`artist: ${meta.artist}`);
    if (meta.key) lines.push(`key: ${meta.key}`);
    if (meta.tempo) lines.push(`tempo: ${meta.tempo}`);
    if (meta.time) lines.push(`time: ${meta.time}`);

    const structure = sections.map(s => s.type).join(', ');
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

  // Push changes to parent when form state changes
  useEffect(() => {
    const newMd = generateMd();
    if (newMd !== md) {
      isInternalUpdate.current = true;
      onChange(newMd);
    }
  }, [generateMd]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Section operations ───
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

  // ─── Chord insertion into lyrics ───
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
    <div className="flex flex-col gap-4">
      {/* ─── Metadata Section ─── */}
      <div className="p-3.5 rounded-xl bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)]">
        <div className="section-title mb-2.5">Song Info</div>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Title" value={meta.title} onChange={v => updateMeta('title', v)} span={2} />
          <FormField label="Artist" value={meta.artist} onChange={v => updateMeta('artist', v)} span={2} />
          <div>
            <FieldLabel>Key</FieldLabel>
            <select
              value={meta.key}
              onChange={e => updateMeta('key', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] text-copy-13 font-semibold text-[var(--ds-gray-1000)] outline-none cursor-pointer"
            >
              {KEY_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <FormField label="Tempo" value={meta.tempo} onChange={v => updateMeta('tempo', v)} type="number" />
          <FormField label="Time" value={meta.time} onChange={v => updateMeta('time', v)} />
          <FormField label="Capo" value={meta.capo} onChange={v => updateMeta('capo', v)} />
        </div>

        {/* Collapsible extra fields */}
        <details className="mt-2">
          <summary className="text-copy-11 text-[var(--ds-gray-500)] cursor-pointer py-1">
            More fields
          </summary>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <FormField label="CCLI" value={meta.ccli} onChange={v => updateMeta('ccli', v)} />
            <FormField label="Tags" value={meta.tags} onChange={v => updateMeta('tags', v)} />
            <FormField label="Spotify" value={meta.spotify} onChange={v => updateMeta('spotify', v)} span={2} />
            <FormField label="YouTube" value={meta.youtube} onChange={v => updateMeta('youtube', v)} span={2} />
            <FormField label="Notes" value={meta.notes} onChange={v => updateMeta('notes', v)} span={2} />
          </div>
        </details>
      </div>

      {/* ─── Section Blocks ─── */}
      {sections.map((sec, idx) => {
        const baseType = sec.type.replace(/\s*\d+$/, '');
        return (
          <div key={idx} className="p-3.5 rounded-xl bg-[var(--ds-gray-100)] border border-[var(--ds-gray-300)]">
            {/* Section header row */}
            <div className="flex items-center gap-1.5 mb-2">
              <select
                value={baseType}
                onChange={e => changeSectionType(idx, e.target.value)}
                className="px-2 py-1 rounded-md bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] text-label-12 font-semibold text-[var(--ds-gray-1000)] outline-none cursor-pointer"
              >
                {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <span className="text-label-12-mono text-[var(--ds-gray-500)]">
                {sec.type !== baseType ? sec.type.replace(baseType, '').trim() : ''}
              </span>

              <div className="flex-1" />

              <IconButton size="xs" variant="ghost" onClick={() => moveSection(idx, -1)} disabled={idx === 0} aria-label="Move up">▲</IconButton>
              <IconButton size="xs" variant="ghost" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} aria-label="Move down">▼</IconButton>
              <IconButton size="xs" variant="error" onClick={() => removeSection(idx)} aria-label="Remove section">✕</IconButton>
            </div>

            {/* Band cue */}
            <div className="mb-1.5">
              <FieldLabel>Band Cue</FieldLabel>
              <input
                value={sec.note}
                onChange={e => updateSection(idx, 'note', e.target.value)}
                placeholder="e.g. Keys & light acoustic"
                className="w-full px-2.5 py-1.5 rounded-md bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] text-copy-13 text-[var(--ds-gray-1000)] outline-none"
              />
            </div>

            {/* Lyrics with chord insertion */}
            <div className="mb-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel>Lyrics & Chords</FieldLabel>
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => openChordPicker(idx, e)}
                    className="bg-transparent border-none cursor-pointer text-[var(--chord)] text-label-12 font-semibold font-mono px-1.5 py-0.5"
                  >
                    + Chord
                  </button>
                  <button
                    onClick={() => setTabEditorTarget({ sectionIdx: idx })}
                    className="bg-transparent border-none cursor-pointer text-[var(--color-brand-text)] text-label-12 font-semibold font-mono px-1.5 py-0.5"
                  >
                    + Tab
                  </button>
                </div>
              </div>
              {/* Edit buttons for existing tab blocks */}
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
                  <div className="flex gap-1 flex-wrap mb-1">
                    {tabBlocks.map((tb, ti) => (
                      <button key={ti} onClick={() => {
                        const blockText = sec.lyrics.substring(tb.start + tb.header.length, tb.end - '{/tab}'.length).trim();
                        const rawLines = blockText.split('\n').filter(l => l.trim());
                        const parsed = parseTabBlock(rawLines);
                        const timePart = tb.header.match(/time:\s*(\S+)/);
                        parsed.time = timePart ? timePart[1] : null;
                        setTabEditorTarget({ sectionIdx: idx, initialTab: parsed, replaceRange: { start: tb.start, end: tb.end } });
                      }}
                        className="bg-[var(--color-brand-soft)] border border-[var(--color-brand-border)] rounded-md px-2 py-0.5 cursor-pointer text-[var(--color-brand-text)] text-label-10 font-semibold font-mono"
                      >
                        Edit Tab {tabBlocks.length > 1 ? ti + 1 : ''}
                      </button>
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
                rows={3}
                className="w-full min-h-[60px] px-2.5 py-1.5 rounded-md bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] text-copy-13 text-[var(--ds-gray-1000)] outline-none resize-y font-mono leading-relaxed"
              />
            </div>
          </div>
        );
      })}

      {/* Add Section button */}
      <button
        onClick={addSection}
        className="py-3 rounded-xl bg-[var(--color-brand-soft)] border border-dashed border-[var(--color-brand-border)] text-[var(--color-brand-text)] text-label-13 font-semibold cursor-pointer text-center hover:bg-[var(--color-brand-soft)] hover:opacity-90 transition-opacity"
      >
        + Add Section
      </button>

      {/* Chord picker popup */}
      {chordTarget !== null && (
        <ChordPicker
          anchorRect={chordAnchor}
          onSelect={handleChordSelect}
          onClose={() => setChordTarget(null)}
        />
      )}

      {/* Tab grid editor overlay */}
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

/* ─── Helper components ─── */
function FieldLabel({ children }) {
  return (
    <span className="section-title text-[9.5px] block mb-0.5">
      {children}
    </span>
  );
}

function FormField({ label, value, onChange, type = 'text', span = 1 }) {
  return (
    <div style={{ gridColumn: span > 1 ? '1 / -1' : undefined }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-md bg-[var(--ds-background-200)] border border-[var(--ds-gray-400)] text-copy-13 text-[var(--ds-gray-1000)] outline-none"
      />
    </div>
  );
}
