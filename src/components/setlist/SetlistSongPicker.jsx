import { useState, useMemo } from 'react';
import { sectionStyle } from '../../music';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/**
 * Song search/picker panel for adding songs to a setlist.
 */
export default function SetlistSongPicker({ songs, onAddSong, onClose }) {
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  return (
    <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden mt-2">
      <div className="p-2.5 border-b border-[var(--ds-gray-300)]">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          placeholder="Search songs..."
          size="sm"
        />
      </div>
      <div className="max-h-[250px] overflow-y-auto">
        {available.map(song => {
          const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
          return (
            <button
              key={song.id}
              onClick={() => { onAddSong(song); setSearch(''); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-transparent border-none border-b border-[var(--ds-gray-300)] cursor-pointer text-left hover:bg-[var(--ds-gray-100)] transition-colors"
              style={{ minHeight: 'auto' }}
            >
              <span
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-mono text-label-12 font-bold border"
                style={{
                  background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                  borderColor: `${s.b}44`,
                  color: s.d,
                }}
              >
                {song.key}
              </span>
              <div>
                <div className="text-label-13 font-semibold text-[var(--ds-gray-1000)]">
                  {song.title}
                </div>
                <div className="text-copy-11 text-[var(--ds-gray-600)]">
                  {song.artist}
                </div>
              </div>
            </button>
          );
        })}
        {available.length === 0 && (
          <div className="py-5 text-center text-[var(--ds-gray-500)] text-copy-13">
            No songs found
          </div>
        )}
      </div>
      <div className="p-2 border-t border-[var(--ds-gray-300)]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="w-full justify-center"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
