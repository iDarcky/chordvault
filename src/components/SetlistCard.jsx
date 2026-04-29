import React from 'react';
import { Chip } from './ui/Chip';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

function formatDateFriendly(dateStr) {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === today.getTime()) return 'Tonight';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatTimeFriendly(timeStr) {
  if (!timeStr) return '';
  return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
}

export default function SetlistCard({ setlist, onPlay, onView, selected = false }) {
  const songCount = setlist.items?.filter(it => it.type !== 'break').length || 0;

  const displayTags = setlist.tags?.length
    ? setlist.tags
    : setlist.service
      ? [setlist.service]
      : [];

  const timeStr = formatTimeFriendly(setlist.time);
  const dateLabel = `${formatDateFriendly(setlist.date)}${timeStr ? ` • ${timeStr}` : ''}`;

  return (
    <div
      onClick={onView}
      className={cn(
        "border border-[var(--ds-gray-200)] rounded-xl bg-[var(--ds-background-100)] flex flex-col md:flex-row w-full overflow-hidden shadow-sm h-auto md:h-64 cursor-pointer group transition-transform duration-150 active:scale-[0.99]",
        selected && "ring-2 ring-[var(--color-brand)]",
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Left gradient panel */}
      <div className="w-full md:w-1/3 bg-gradient-to-br from-[var(--color-brand)] to-[#3a1a3b] h-28 md:h-full relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Right details */}
      <div className="flex-1 min-w-0 p-6 md:p-8 flex flex-col justify-center group-hover:bg-white/[0.02] transition-colors">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {displayTags.length > 0 ? (
            displayTags.slice(0, 2).map(tag => (
              <Chip key={tag} variant="success" size="sm">{tag}</Chip>
            ))
          ) : (
            <Chip variant="success" size="sm">Live Show</Chip>
          )}
        </div>

        {/* Setlist Name */}
        <h3 className="text-heading-20 md:text-heading-24 font-bold text-[var(--ds-gray-1000)] m-0 mb-3 tracking-tight truncate">
          {setlist.name || 'Untitled Setlist'}
        </h3>

        {/* Date & Location */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-label-14 text-[var(--ds-gray-900)] mb-6 font-medium">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span className="truncate">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="truncate">{setlist.location || 'No Location Set'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 mt-auto">
          <Button
            variant="brand"
            className="border-none text-white shadow-sm px-6 font-bold"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M8 5v14l11-7z"/></svg>
            Play Live
          </Button>
          <div className="text-label-13 text-[var(--ds-gray-700)] font-medium">
            {songCount} Song{songCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
