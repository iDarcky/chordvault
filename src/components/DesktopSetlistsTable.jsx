import React, { useState } from 'react';
import { cn } from '../lib/utils';

export function DesktopSetlistsTable({ setlists, onSelectSetlist }) {
  const [hoveredId, setHoveredId] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No Date';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-[minmax(200px,2fr)_minmax(150px,1.5fr)_80px] gap-4 px-4 py-2 border-b" style={{ borderColor: 'var(--notion-border)' }}>
        <div className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)]">
          Name
        </div>
        <div className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)]">
          Date
        </div>
        <div className="flex items-center text-[12px] font-semibold uppercase tracking-wider text-[var(--notion-text-dim)]">
          Songs
        </div>
      </div>

      <div className="flex flex-col">
        {setlists.map(setlist => {
          const isHovered = hoveredId === setlist.id;

          return (
            <div
              key={setlist.id}
              onMouseEnter={() => setHoveredId(setlist.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectSetlist(setlist)}
              className="grid grid-cols-[minmax(200px,2fr)_minmax(150px,1.5fr)_80px] gap-4 px-4 py-2.5 border-b cursor-pointer transition-colors group hover:bg-[var(--notion-bg-hover)]"
              style={{ borderColor: 'var(--notion-border)' }}
            >
              <div className="flex items-center text-copy-14 text-[var(--notion-text-main)] truncate font-medium">
                {setlist.name || 'Untitled Setlist'}
              </div>
              <div className="flex items-center text-copy-14 text-[var(--notion-text-dim)] truncate">
                {formatDate(setlist.date)}
              </div>
              <div className="flex items-center text-copy-14 text-[var(--notion-text-dim)] truncate">
                {setlist.items?.length || 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
