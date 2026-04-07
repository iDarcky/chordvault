import React from 'react';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { Button } from './ui/Button';

export default function SetlistCard({ setlist, onPlay, onView }) {
  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  const songCount = setlist.items?.filter(it => it.type !== 'break').length || 0;

  // Support both new tags array and legacy service field
  const displayTags = setlist.tags?.length
    ? setlist.tags
    : setlist.service
      ? [setlist.service]
      : [];

  return (
    <Card onClick={onView} className="flex flex-col gap-6 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="text-label-12-mono text-[var(--ds-gray-700)] tracking-widest uppercase">
          {dateStr}
        </div>
        {displayTags.length > 0 && (
          <div className="flex flex-col items-end gap-1">
            {displayTags.map((tag, i) => (
              <Chip key={i} variant="success" size="sm">{tag}</Chip>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-heading-20 text-[var(--ds-gray-1000)] m-0 leading-tight">
          {setlist.name || 'Untitled Setlist'}
        </h3>
        <p className="text-copy-14 text-[var(--ds-gray-700)] mt-2">
          {songCount} song{songCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onView(); }}
        >
          View Details
        </Button>
        <Button
          variant="brand"
          className="flex-1"
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
        >
          Play Live
        </Button>
      </div>
    </Card>
  );
}
