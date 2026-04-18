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
        "flex flex-col w-full rounded-[24px] overflow-hidden bg-[var(--ds-background-200)] cursor-pointer transition-all duration-300 transform hover:-translate-y-1 text-left border-none",
        selected && "bg-[var(--ds-teal-100)] ring-4 ring-[var(--ds-teal-100)] ring-opacity-50",
      )}
    >
      <div className="p-8 flex flex-col gap-4 h-full">
        {/* Setlist Name */}
        <h3 className="text-heading-24 font-serif text-[var(--text-1)] m-0 leading-tight">
          {setlist.name || 'Untitled Setlist'}
        </h3>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {displayTags.slice(0, 3).map(tag => (
              <span key={tag} className="text-label-11 text-[var(--text-2)] uppercase tracking-widest opacity-60">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-2 mt-4 text-copy-14 text-[var(--text-2)] opacity-80 font-serif italic">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>{dateLabel}</span>
          </div>
          {setlist.location && (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{setlist.location}</span>
            </div>
          )}
        </div>

        {/* Actions / Footer */}
        <div className="flex items-center justify-between mt-auto pt-6">
          <span className="text-label-14 font-semibold text-[var(--text-1)] opacity-70">
            {songCount} Song{songCount !== 1 ? 's' : ''}
          </span>

          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-brand)] text-white border-none cursor-pointer hover:scale-105 transition-transform"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            title="Play Live"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
