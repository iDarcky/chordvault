import React, { useState } from 'react';
import PageHeader from './PageHeader';
import SongCard from './SongCard';

export default function Library({ songs, onSelectSong, onNewSong, onImportSong }) {
  const [query, setQuery] = useState('');

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist?.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ds-background-200)', paddingBottom: 100 }}>
      <PageHeader title="Song Library">
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onNewSong} className="text-button-14" style={{
            background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600
          }}>
            Add Song
          </button>
          <label style={{
            background: 'var(--ds-background-100)', color: 'var(--text-bright)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13
          }}>
            Import
            <input type="file" accept=".md" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => onImportSong(ev.target.result);
                reader.readAsText(file);
              }
            }} style={{ display: 'none' }} />
          </label>
        </div>
      </PageHeader>

      <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <input
            placeholder="Search library..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--ds-background-100)', color: 'var(--text-bright)', fontSize: 14,
              outline: 'none', transition: 'border-color 0.2s'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filtered.map(song => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => onSelectSong(song)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              {query ? 'No songs matching your search.' : 'Your library is empty.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
