import React from 'react';
import PageHeader from './PageHeader';
import SetlistCard from './SetlistCard';
import { Button } from './ui/Button';

export default function Setlists({ songs, setlists, onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist }) {
  const sorted = [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] pb-32">
      <PageHeader title="Setlists">
        <div className="flex gap-4">
          <Button variant="brand" size="sm" onClick={onNewSetlist}>
            Create Setlist
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) onImportSetlist(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="secondary" size="sm">
              Import .zip
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sorted.map(sl => (
            <SetlistCard
              key={sl.id}
              setlist={sl}
              onPlay={() => onPlaySetlist(sl)}
              onView={() => onViewSetlist(sl)}
            />
          ))}
          {sorted.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-[var(--ds-gray-400)] rounded-2xl flex flex-col items-center gap-4">
              <p className="text-copy-14 text-[var(--ds-gray-700)]">
                Organize your songs into setlists for rehearsals or live performances.
              </p>
              <Button variant="brand" onClick={onNewSetlist}>
                Create Your First Setlist
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
