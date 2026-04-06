import React from 'react';
import { Chip } from "@heroui/react";
import { sectionStyle, compactLabel } from '../music';

export function StructureRibbon({ structure, compact }) {
  return (
    <div className="flex gap-1.5 flex-wrap py-2">
      {structure.map((name, i) => {
        const s = sectionStyle(name.replace(/\s*\d+$/, ''));
        return (
          <Chip
            key={i}
            size="sm"
            variant="flat"
            classNames={{
              base: `bg-${s.b === '#53796F' ? 'primary' : 'default'}/10 border border-${s.b === '#53796F' ? 'primary' : 'default'}/20 h-6 px-2`,
              content: `text-[10px] font-bold uppercase tracking-wider text-${s.b === '#53796F' ? 'primary' : 'default-600'}`
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.d }} />
              {compact ? compactLabel(name) : name}
            </div>
          </Chip>
        );
      })}
    </div>
  );
}

export function MetaPill({ label, value, highlight }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-content2 border border-divider">
      <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest leading-none">
        {label}
      </span>
      <span className={`text-xs font-mono font-bold leading-none ${highlight ? 'text-warning' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}
