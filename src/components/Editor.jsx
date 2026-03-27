import { useState, useEffect } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import SectionBlock from './SectionBlock';

export default function Editor({ song, onSave, onBack, onDelete }) {
  const [md, setMd] = useState(
    song
      ? songToMd(song)
      : `---\ntitle: New Song\nartist: \nkey: C\ntempo: 120\ntime: 4/4\nstructure: [Verse 1, Chorus]\n---\n\n## Verse 1\n[C]Write your [G]lyrics here\n\n## Chorus\n[Am]Add your [F]chorus [C]here\n`
  );
  const [tab, setTab] = useState('edit');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    try { setPreview(parseSongMd(md)); }
    catch { setPreview(null); }
  }, [md]);

  const handleSave = () => {
    if (!preview) return;
    onSave({ ...preview, id: song?.id || generateId() });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
          }}>
            &#8592; Back
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-bright)' }}>
            {song ? 'Edit Song' : 'New Song'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {song && onDelete && (
            <button
              onClick={() => { if (confirm('Delete this song?')) onDelete(song.id); }}
              style={{
                background: 'var(--danger-soft)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 7, padding: '7px 14px',
                color: 'var(--danger)', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
          <button onClick={handleSave} style={{
            background: 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 7, padding: '7px 18px',
            color: 'var(--accent-text)', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 18px',
      }}>
        {['edit', 'preview'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            color: tab === t ? 'var(--text)' : 'var(--text-muted)',
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', textTransform: 'capitalize',
          }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'edit' ? (
        <div style={{ padding: 18 }}>
          <div style={{
            marginBottom: 10, padding: 12, borderRadius: 8,
            background: 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.12)',
            fontSize: 11.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
            fontFamily: 'var(--fm)',
          }}>
            YAML frontmatter →{' '}
            <strong style={{ color: 'var(--accent-text)' }}>## Section Name</strong> →{' '}
            <strong style={{ color: 'var(--chord)' }}>[Chord]</strong>lyrics →{' '}
            <strong style={{ color: 'rgba(255,255,255,0.5)' }}>&gt; note</strong> for band cues
          </div>
          <textarea
            value={md}
            onChange={e => setMd(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: '60vh',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: 16,
              fontSize: 13.5, lineHeight: 1.6,
              color: 'var(--text)', resize: 'vertical',
              outline: 'none', caretColor: 'var(--chord)',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ) : (
        preview && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                {preview.sections.slice(0, Math.ceil(preview.sections.length / 2)).map((sec, i) => (
                  <SectionBlock key={i} section={sec} transpose={0} />
                ))}
              </div>
              <div>
                {preview.sections.slice(Math.ceil(preview.sections.length / 2)).map((sec, i) => (
                  <SectionBlock key={i} section={sec} transpose={0} />
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
