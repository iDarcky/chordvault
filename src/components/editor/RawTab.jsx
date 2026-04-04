export default function RawTab({ raw, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="bento-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Song Markdown</h3>
        <textarea
          value={raw}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%', minHeight: '60vh',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: 20,
            fontSize: 14, lineHeight: 1.6,
            color: 'var(--text)', resize: 'vertical',
            outline: 'none', caretColor: 'var(--accent)',
            fontFamily: 'var(--fm)',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div className="bento-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Syntax Tips</h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <li>Use <code style={{ color: 'var(--accent)' }}>## Section Name</code> for headers.</li>
          <li>Place chords in brackets: <code style={{ color: 'var(--accent)' }}>[G]</code> before lyrics.</li>
          <li>Add metadata like <code style={{ color: 'var(--accent)' }}>Key: G</code> at the top.</li>
        </ul>
      </div>
    </div>
  );
}
