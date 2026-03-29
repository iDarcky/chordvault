import { useState } from 'react';

export default function RawTab({ md, onChange, textareaRef }) {
  const [showRef, setShowRef] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Syntax Reference Toggle */}
      <button
        onClick={() => setShowRef(v => !v)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent-text)', fontSize: 12, fontWeight: 600,
          fontFamily: 'var(--fm)', padding: '8px 0', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <span style={{ fontSize: 10 }}>{showRef ? '▾' : '▸'}</span>
        Syntax Reference
      </button>

      {showRef && (
        <div style={{
          marginBottom: 10, padding: 12, borderRadius: 8,
          background: 'var(--accent-soft)',
          border: '1px solid rgba(99,102,241,0.12)',
          fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.7,
          fontFamily: 'var(--fm)',
        }}>
          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: 'var(--text)' }}>Frontmatter</strong> (between <code>---</code> delimiters):
          </div>
          <div style={{ paddingLeft: 10, marginBottom: 8, color: 'var(--text-dim)' }}>
            title: Song Name<br />
            artist: Artist Name<br />
            key: C<br />
            tempo: 120<br />
            time: 4/4<br />
            structure: [Verse 1, Chorus, Verse 2, Chorus]<br />
            <span style={{ opacity: 0.5 }}>tags, ccli, spotify, youtube, capo, notes — optional</span>
          </div>

          <div style={{ marginBottom: 6 }}>
            <strong style={{ color: 'var(--text)' }}>Sections & Chords:</strong>
          </div>
          <div style={{ paddingLeft: 10, color: 'var(--text-dim)' }}>
            <strong style={{ color: 'var(--accent-text)' }}>## Section Name</strong> — starts a section (Verse, Chorus, Bridge, etc.)<br />
            <strong style={{ color: 'var(--chord)' }}>[Chord]</strong>lyrics — inline chords above lyrics<br />
            <strong style={{ color: 'var(--text-muted)' }}>&gt; note</strong> — band cue / performance note<br />
            <span style={{ opacity: 0.5 }}>Blank lines between sections</span>
          </div>
        </div>
      )}

      {/* Textarea */}
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
    </div>
  );
}
