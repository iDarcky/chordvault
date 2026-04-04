export default function FormTab({ song, onChange }) {
  const updateMeta = (key, val) => {
    onChange({ ...song, [key]: val });
  };

  const fields = [
    { key: 'title', label: 'Title', placeholder: 'Song Title' },
    { key: 'artist', label: 'Artist', placeholder: 'Artist Name' },
    { key: 'key', label: 'Key', placeholder: 'G' },
    { key: 'tempo', label: 'Tempo', placeholder: '120' },
    { key: 'time', label: 'Time', placeholder: '4/4' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="bento-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Metadata</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.key === 'title' || f.key === 'artist' ? 'span 2' : 'auto' }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase' }}>{f.label}</label>
              <input
                value={song[f.key] || ''}
                onChange={e => updateMeta(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', background: 'var(--surface-alt)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14,
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
