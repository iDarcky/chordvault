export function MetaPill({ label, value }) {
  return (
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 80,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)' }}>{value}</span>
    </div>
  );
}

export function StructureRibbon({ sections, onScrollTo }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 0 16px', overflowX: 'auto' }} className="hide-scrollbar">
      {sections.map((s, i) => (
        <button
          key={i}
          onClick={() => onScrollTo(i)}
          style={{
            padding: '6px 14px',
            borderRadius: 30,
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {s.type.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
