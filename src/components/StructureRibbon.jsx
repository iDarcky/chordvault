import { cn } from '../lib/utils';
import { sectionStyle } from '../music';

export default function StructureRibbon({ structure, currentSection, onSelect, className }) {
  if (!structure || structure.length === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2",
      className
    )}>
      {structure.map((item, i) => {
        const s = sectionStyle(item);
        const isActive = currentSection === i;

        return (
          <button
            key={i}
            onClick={() => onSelect && onSelect(i)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
              isActive
                ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-105"
                : "bg-[var(--accents-1)] border-[var(--geist-border)] text-[var(--accents-5)] hover:border-[var(--accents-8)]"
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export function MetaPill({ label, value, icon, className }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-geist-button bg-[var(--accents-1)] border border-[var(--geist-border)]",
      className
    )}>
      {icon && <span className="text-[var(--accents-4)]">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--accents-4)] leading-none mb-0.5">{label}</span>
        <span className="text-xs font-mono font-bold text-[var(--geist-foreground)] leading-none">{value}</span>
      </div>
    </div>
  );
}
