import { sectionStyle, compactLabel } from '../music';

export function StructureRibbon({ structure, compact }) {
  return (
    <div className="flex gap-1 flex-wrap py-2">
      {structure.map((name, i) => {
        const s = sectionStyle(name.replace(/\s*\d+$/, ''));
        return (
          <span
            key={i}
            className={`inline-flex items-center font-mono font-semibold whitespace-nowrap rounded-full border-[1.5px] ${compact ? 'gap-0.5 px-1.5 py-0.5 text-label-10' : 'gap-1 px-2 py-0.5 text-label-11'}`}
            style={{
              borderColor: `${s.b}33`,
              background: s.bg,
              color: s.d,
            }}
          >
            <span
              className={`rounded-full ${compact ? 'w-[5px] h-[5px]' : 'w-[7px] h-[7px]'}`}
              style={{ background: s.d }}
            />
            {compact ? compactLabel(name) : name}
          </span>
        );
      })}
    </div>
  );
}

export function MetaPill({ label, value, highlight }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)]">
      <span className="text-label-10 font-semibold text-[var(--ds-gray-600)]">
        {label}
      </span>
      <span
        className={`text-label-14-mono font-bold ${highlight ? 'text-[var(--chord)]' : 'text-[var(--ds-gray-1000)]'}`}
      >
        {value}
      </span>
    </div>
  );
}
