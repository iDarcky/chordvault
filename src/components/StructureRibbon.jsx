import { sectionStyle, compactLabel } from '../music';

export function StructureRibbon({ structure, compact }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '8px 0' }}>
      {structure.map((name, i) => {
        const s = sectionStyle(name.replace(/\s*\d+$/, ''));
        return (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: compact ? 3 : 4,
            padding: compact ? '2px 6px' : '3px 9px', borderRadius: 16,
            border: `1.5px solid ${s.b}44`, background: `${s.bg}88`,
            color: s.d, fontSize: compact ? 10 : 10.5, fontWeight: 500,
            fontFamily: 'var(--fm)', whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: compact ? 5 : 7, height: compact ? 5 : 7,
              borderRadius: '50%', background: s.d,
            }} />
            {compact ? compactLabel(name) : name}
          </span>
        );
      })}
    </div>
  );
}

export function MetaPill({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 11px', borderRadius: 7,
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <span style={{
        fontSize: 9.5, fontWeight: 500, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13.5, fontWeight: 500,
        color: highlight ? 'var(--chord)' : 'var(--text-bright)',
        fontFamily: 'var(--fm)',
      }}>
        {value}
      </span>
    </div>
  );
}
