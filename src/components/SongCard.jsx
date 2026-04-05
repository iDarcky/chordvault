import React from 'react';
import { Card } from './ui/Card';

export default function SongCard({ song, onClick }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-2"
    >
      <h3 className="text-heading-18 text-[var(--ds-gray-1000)] m-0 leading-tight">
        {song.title}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-label-12 text-[var(--ds-gray-900)] uppercase font-semibold">
          {song.key || 'C'}
        </span>
        <span className="text-[var(--ds-gray-400)] text-[10px]">•</span>
        <span className="text-label-12 text-[var(--ds-gray-700)]">
          {song.bpm ? `${song.bpm} BPM` : 'No Tempo'}
        </span>
      </div>
      {song.artist && (
        <p className="text-copy-14 text-[var(--ds-gray-900)] mt-1 line-clamp-1">
          {song.artist}
        </p>
      )}
    </Card>
  );
}
