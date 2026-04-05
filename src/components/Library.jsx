import React, { useState } from 'react';
import PageHeader from './PageHeader';
import SongCard from './SongCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function Library({ songs, onSelectSong, onNewSong, onImportSong }) {
  const [query, setQuery] = useState('');

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist?.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen material-page pb-32">
      <PageHeader title="Song Library">
        <div className="flex gap-4">
          <Button variant="brand" size="sm" onClick={onNewSong}>
            Add Song
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".md"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => onImportSong(ev.target.result);
                  reader.readAsText(file);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="secondary" size="sm">
              Import
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <Input
          placeholder="Search library..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="max-w-md mx-auto"
          prefix={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(song => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => onSelectSong(song)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-[var(--ds-gray-700)] text-copy-14">
              {query ? 'No songs matching your search.' : 'Your library is empty.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
