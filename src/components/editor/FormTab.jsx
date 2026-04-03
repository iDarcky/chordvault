import { useState, useEffect, useCallback, useRef } from 'react';
import { parseSongMd, serializeTabBlock, parseTabBlock } from '../../parser';
import ChordPicker from './ChordPicker';
import TabGridEditor from './TabGridEditor';

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
  const [chordTarget, setChordTarget] = useState(null); // { sectionIdx, cursorPos }
  const [chordAnchor, setChordAnchor] = useState(null);
  const [tabEditorTarget, setTabEditorTarget] = useState(null); // { sectionIdx, initialTab?, replaceRange? }
  const lyricRefs = useRef({});

  // ─── Generate md from form state whenever it changes ───
  const generateMd = useCallback(() => {
    const lines = ['---'];
    if (meta.title) lines.push(`title: ${meta.title}`);
    if (meta.artist) lines.push(`artist: ${meta.artist}`);
    if (meta.key) lines.push(`key: ${meta.key}`);
    if (meta.tempo) lines.push(`tempo: ${meta.tempo}`);
    if (meta.time) lines.push(`time: ${meta.time}`);

    // Auto-generate structure from section types
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

  // Push changes to parent
  useEffect(() => {
    const newMd = generateMd();
    if (newMd !== md) onChange(newMd);
  }, [generateMd]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Section operations ───
  const updateMeta = (key, val) => setMeta(m => ({ ...m, [key]: val }));

  const updateSection = (idx, field, val) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const addSection = () => {
    // Auto-pick type and number
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
    // Auto-number: count how many of this base type exist before this index
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

    // Restore cursor
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
      // Replace existing tab block
      const newLyrics = lyrics.substring(0, replaceRange.start) + asciiBlock + lyrics.substring(replaceRange.end);
      updateSection(sectionIdx, 'lyrics', newLyrics);
    } else {
      // Insert new tab block
      const ta = lyricRefs.current[sectionIdx];
      const cursorPos = ta ? ta.selectionStart : lyrics.length;
      const needsNewline = lyrics.length > 0 && !lyrics.endsWith('\n');
      const insert = (needsNewline ? '\n' : '') + asciiBlock;
      updateSection(sectionIdx, 'lyrics', lyrics.substring(0, cursorPos) + insert + lyrics.substring(cursorPos));
    }
    setTabEditorTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─── Metadata Section ─── */}
      <div style={{
        padding: 14, borderRadius: 10,
        background: 'var(--surface)', border: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Song Info
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FormField label="Title" value={meta.title} onChange={v => updateMeta('title', v)} span={2} />
          <FormField label="Artist" value={meta.artist} onChange={v => updateMeta('artist', v)} span={2} />
          <div>
            <FieldLabel>Key</FieldLabel>
            <select value={meta.key} onChange={e => updateMeta('key', e.target.value)} style={selectStyle}>
              {KEY_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <FormField label="Tempo" value={meta.tempo} onChange={v => updateMeta('tempo', v)} type="number" />
          <FormField label="Time" value={meta.time} onChange={v => updateMeta('time', v)} />
          <FormField label="Capo" value={meta.capo} onChange={v => updateMeta('capo', v)} />
        </div>

        {/* Collapsible extra fields */}
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', padding: '4px 0' }}>
            More fields
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
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
          <div key={idx} style={{
            padding: 14, borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            {/* Section header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <select
                value={baseType}
                onChange={e => changeSectionType(idx, e.target.value)}
                style={{ ...selectStyle, flex: 0, width: 'auto', minWidth: 100 }}
              >
                {SECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Auto-number display */}
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>
                {sec.type !== baseType ? sec.type.replace(baseType, '').trim() : ''}
              </span>

              <div style={{ flex: 1 }} />

              {/* Move & delete */}
              <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} style={smallBtnStyle} title="Move up">▲</button>
              <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} style={smallBtnStyle} title="Move down">▼</button>
              <button onClick={() => removeSection(idx)} style={{ ...smallBtnStyle, color: 'var(--danger)' }} title="Remove section">✕</button>
            </div>

            {/* Band cue */}
            <div style={{ marginBottom: 6 }}>
              <FieldLabel>Band Cue</FieldLabel>
              <input
                value={sec.note}
                onChange={e => updateSection(idx, 'note', e.target.value)}
                placeholder="e.g. Keys & light acoustic"
                style={{ ...fieldInputStyle, width: '100%' }}
              />
            </div>

            {/* Lyrics with chord insertion */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FieldLabel>Lyrics & Chords</FieldLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={(e) => openChordPicker(idx, e)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--chord)', fontSize: 12, fontWeight: 500,
                    fontFamily: 'var(--fm)', padding: '2px 6px',
                  }}>
                    + Chord
                  </button>
                  <button onClick={() => setTabEditorTarget({ sectionIdx: idx })} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--accent-text)', fontSize: 12, fontWeight: 500,
                    fontFamily: 'var(--fm)', padding: '2px 6px',
                  }}>
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
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                    {tabBlocks.map((tb, ti) => (
                      <button key={ti} onClick={() => {
                        const blockText = sec.lyrics.substring(tb.start + tb.header.length, tb.end - '{/tab}'.length).trim();
                        const rawLines = blockText.split('\n').filter(l => l.trim());
                        const parsed = parseTabBlock(rawLines);
                        const timePart = tb.header.match(/time:\s*(\S+)/);
                        parsed.time = timePart ? timePart[1] : null;
                        setTabEditorTarget({ sectionIdx: idx, initialTab: parsed, replaceRange: { start: tb.start, end: tb.end } });
                      }} style={{
                        background: 'var(--accent-soft)', border: '1px solid var(--accent)',
                        borderRadius: 5, padding: '2px 8px', cursor: 'pointer',
                        color: 'var(--accent-text)', fontSize: 10, fontWeight: 500,
                        fontFamily: 'var(--fm)',
                      }}>
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
                style={{
                  ...fieldInputStyle, width: '100%', minHeight: 60,
                  resize: 'vertical', fontFamily: 'var(--fm)',
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Add Section button */}
      <button onClick={addSection} style={{
        background: 'var(--accent-soft)',
        border: '1px dashed var(--accent)',
        borderRadius: 10, padding: '12px 0',
        color: 'var(--accent-text)', fontSize: 13,
        fontWeight: 500, cursor: 'pointer',
        textAlign: 'center',
      }}>
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
    <span style={{
      fontSize: 9.5, fontWeight: 500, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      display: 'block', marginBottom: 3,
    }}>
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
        style={{ ...fieldInputStyle, width: '100%' }}
      />
    </div>
  );
}

/* ─── Shared styles ─── */
const fieldInputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 6, padding: '6px 10px',
  color: 'var(--text)', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
};

const selectStyle = {
  ...fieldInputStyle,
  cursor: 'pointer', fontWeight: 500,
  width: '100%',
};

const smallBtnStyle = {
  background: 'none', border: 'none',
  color: 'var(--text-dim)', cursor: 'pointer',
  fontSize: 12, padding: '2px 6px', borderRadius: 4,
};
