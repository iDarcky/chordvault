import { sectionStyle } from '../music';
import { cn } from '../lib/utils';

export function MetaPill({ label, value, highlight }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-geist border text-[11px] font-bold uppercase tracking-tight font-mono",
      highlight
        ? "bg-foreground text-background border-foreground shadow-md"
        : "bg-accents-1 border-accents-2 text-accents-5"
    )}>
      <span className={highlight ? "text-accents-2" : "text-accents-3"}>{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

export function StructureRibbon({ structure, compact }) {
  if (!structure?.length) return null;

  return (
    <div className={cn(
      "flex gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth transition-all",
      compact ? "mt-2 pb-1" : "my-4 pb-2"
    )}>
      {structure.map((s, i) => {
        const style = sectionStyle(s);
        return (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-geist border shadow-sm transition-all hover:scale-105"
            style={{
              borderColor: `${style.b}44`,
              backgroundColor: `${style.b}10`,
              color: style.d
            }}
          >
            <span className="font-mono text-[10px] font-black border border-current rounded-full w-4 h-4 flex items-center justify-center opacity-60">
              {style.l}
            </span>
            <span className="text-[10px] font-bold tracking-tight uppercase">
              {s}
            </span>
          </div>
        );
      })}
    </div>
  );
}
