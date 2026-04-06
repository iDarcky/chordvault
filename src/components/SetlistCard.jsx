import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export default function SetlistCard({ setlist, onPlay, onView }) {
  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  const songCount = setlist.items?.length || 0;

  return (
    <Card onClick={onView} className="flex flex-col gap-6 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="text-label-12-mono text-[var(--ds-gray-700)] tracking-widest uppercase">
          {dateStr}
        </div>
        {setlist.service && (
          <div className="text-label-12 text-[var(--ds-gray-700)] px-2 py-0.5 rounded-md bg-[var(--ds-gray-200)] border border-[var(--ds-gray-400)] uppercase tracking-tight">
            {setlist.service}
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
