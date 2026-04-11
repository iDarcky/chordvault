import { sectionStyle, compactLabel } from '../music';
import { cn } from '../lib/utils';

export function StructureRibbon({ structure, compact, onSelect }) {
  return (
    <div className="flex gap-1 flex-wrap py-1">
      {structure.map((name, i) => {
        const s = sectionStyle(name.replace(/\s*\d+$/, ''));
        const Tag = onSelect ? 'button' : 'span';
        return (
          <Tag
            key={i}
            {...(onSelect ? { type: 'button', onClick: () => onSelect(i) } : {})}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
              compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-[12px]",
              onSelect && "cursor-pointer hover:opacity-80"
            )}
            style={{
              borderColor: s.br,
              background: s.bg,
              color: s.d,
            }}
          >
            <span
              className={cn("rounded-full flex-shrink-0", compact ? "w-1.5 h-1.5" : "w-2 h-2")}
              style={{ background: s.b }}
            />
            {compact ? compactLabel(name) : name}
          </Tag>
        );
      })}
    </div>
  );
}

export function MetaPill({ label, value, highlight }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-default-100 border border-default-300">
      <span className="text-label-10 font-semibold text-default-500">
        {label}
      </span>
      <span
        className={cn("text-label-14-mono font-bold", highlight ? "text-[var(--chord)]" : "text-foreground")}
      >
        {value}
      </span>
    </div>
  );
}
