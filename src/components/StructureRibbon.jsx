import { sectionStyle } from '../music';

export function StructureRibbon({ structure }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '8px 0' }}>
      {structure.map((name, i) => {
        const s = sectionStyle(name.replace(/\s*\d+$/, ''));
        return (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 16,
            border: `1.5px solid ${s.b}44`, background: `${s.bg}88`,
            color: s.d, fontSize: 10.5, fontWeight: 600,
            fontFamily: 'var(--fm)', whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: s.d,
            }} />
            {name}
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
        fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13.5, fontWeight: 700,
        color: highlight ? 'var(--chord)' : 'var(--text-bright)',
        fontFamily: 'var(--fm)',
      }}>
        {value}
      </span>
    </div>
  );
}
