import React from 'react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

function formatRelativeTime(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SongCard({ song, onClick, variant = 'card', showTags = false, selected = false }) {
  if (variant === 'row') {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center justify-between p-6 cursor-pointer transition-colors duration-150 rounded-2xl",
          selected
            ? "bg-[var(--ds-teal-100)] text-[var(--ds-teal-1000)]"
            : "bg-[var(--ds-background-200)] hover:bg-[var(--ds-gray-200)]"
        )}
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-heading-18 text-[var(--text-1)] truncate">
            {song.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {song.artist && (
              <span className="text-copy-14 text-[var(--text-2)] font-serif italic truncate">
                {song.artist}
              </span>
            )}
            {showTags && song.tags?.length > 0 && song.tags.map(tag => (
              <span
                key={tag}
                className="text-label-11 text-[var(--text-2)] uppercase tracking-widest opacity-60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4 shrink-0 opacity-80">
          <div className="flex items-center gap-2">
            <span className="text-label-14 font-semibold text-[var(--color-brand)]">
              {song.key || 'C'}
            </span>
            {song.tempo && (
              <>
                <span className="text-[var(--text-2)] text-[12px] opacity-40">•</span>
                <span className="text-label-12 text-[var(--text-2)]">
                  {song.tempo} BPM
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Masonry default card (no borders, flat)
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer flex flex-col gap-3 p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 w-full text-left bg-transparent border-none",
        selected ? "bg-[var(--ds-teal-100)]" : "bg-[var(--ds-background-200)]"
      )}
    >
      <h3 className="text-heading-20 text-[var(--text-1)] m-0 leading-tight">
        {song.title}
      </h3>
      {song.artist && (
        <p className="text-copy-16 text-[var(--text-2)] font-serif italic mt-0 mb-2">
          {song.artist}
        </p>
      )}
      <div className="flex items-center gap-3 mt-auto pt-4">
        <span className="text-label-14 text-[var(--color-brand)] font-bold">
          {song.key || 'C'}
        </span>
        {song.tempo && (
          <span className="text-label-12 text-[var(--text-2)] opacity-80">
            {song.tempo} BPM
          </span>
        )}
      </div>
    </div>
  );
}
