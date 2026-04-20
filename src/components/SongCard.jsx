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
          "group relative flex items-center justify-between px-5 py-4 cursor-pointer transition-all duration-200 border-b border-transparent hover:bg-[var(--bg-2)]",
          selected && "bg-[var(--ds-teal-100)] hover:bg-[var(--ds-teal-100)]",
        )}
      >
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-lg font-serif tracking-tight text-[var(--text-1)] truncate">
            {song.title}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {song.artist && (
              <span className="text-sm font-serif italic text-[var(--color-brand)] truncate">
                {song.artist}
              </span>
            )}
            {showTags && song.tags?.length > 0 && song.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-2)] px-2 py-0.5 rounded-full bg-[var(--bg-2)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-label-12-mono text-[var(--chord)] font-semibold">
              {song.key || 'C'}
            </span>
            <span className="text-[var(--text-2)] text-[12px] opacity-60">•</span>
            <span className="text-label-12-mono text-[var(--text-2)]">
              {song.tempo ? `${song.tempo} BPM` : 'No Tempo'}
            </span>
          </div>
          {song.updatedAt && (
            <span className="text-label-12 text-[var(--text-2)]">
              {formatRelativeTime(song.updatedAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-2"
    >
      <h3 className="text-heading-18 text-[var(--text-1)] m-0 leading-tight truncate">
        {song.title}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-label-12 text-[var(--text-2)] uppercase font-semibold">
          {song.key || 'C'}
        </span>
        <span className="text-[var(--text-2)] text-[12px] opacity-60">•</span>
        <span className="text-label-12 text-[var(--text-2)]">
          {song.tempo ? `${song.tempo} BPM` : 'No Tempo'}
        </span>
      </div>
      {song.artist && (
        <p className="text-copy-14 text-[var(--text-2)] mt-1 line-clamp-1">
          {song.artist}
        </p>
      )}
    </Card>
  );
}
