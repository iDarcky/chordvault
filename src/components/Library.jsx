import { useState, useMemo, useRef } from 'react';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';
import SongCard from './SongCard';

const btnStyle = {
  border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6,
  fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13,
  padding: '8px 14px', background: 'var(--ds-background-100)',
  color: 'var(--text-bright)',
};

export default function Library({ songs, onSelectSong, onNewSong, onImportSong }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title'); // 'title' | 'artist' | 'key'
  const [tagFilter, setTagFilter] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fileRef = useRef(null);

  const allTags = useMemo(() => {
    const s = new Set();
    songs.forEach(song => (song.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [songs]);

  const filtered = useMemo(() => {
    let list = songs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }
    if (tagFilter.length > 0) {
      list = list.filter(s => tagFilter.every(t => (s.tags || []).includes(t)));
    }
    return list.sort((a, b) => {
      if (sort === 'key') return a.key.localeCompare(b.key);
      if (sort === 'artist') return (a.artist || '').localeCompare(b.artist || '');
      return a.title.localeCompare(b.title);
    });
  }, [songs, search, sort, tagFilter]);

  const toggleTag = (tag) => {
    setTagFilter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
    setFabOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      <PageHeader title="Library">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowTagDropdown(prev => !prev)} style={{
              ...btnStyle,
              background: tagFilter.length > 0 ? 'var(--accent-soft)' : 'var(--ds-background-100)',
              borderColor: tagFilter.length > 0 ? 'var(--accent-border)' : 'var(--border)',
              color: tagFilter.length > 0 ? 'var(--accent-text)' : 'var(--text-bright)',
            }}>
              Tags {tagFilter.length > 0 ? `(${tagFilter.length})` : ''}
            </button>
            {showTagDropdown && (
              <>
                <div onClick={() => setShowTagDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--ds-background-100)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '8px', zIndex: 50, minWidth: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}>
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '10px 12px', background: 'none', border: 'none',
                      cursor: 'pointer', borderRadius: 8, textAlign: 'left',
                    }} className="hover:bg-[var(--ds-gray-100)]">
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: tagFilter.includes(tag) ? 'none' : '1px solid var(--border)',
                        background: tagFilter.includes(tag) ? 'var(--color-brand)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11,
                      }}>
                        {tagFilter.includes(tag) && '✓'}
                      </span>
                      <span className="text-label-13" style={{ color: 'var(--text-bright)' }}>{tag}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </PageHeader>

      <div style={{ padding: '0 24px' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
              <SearchIcon size={16} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search songs..."
              style={{
                width: '100%', padding: '10px 14px 10px 40px',
                background: 'var(--ds-background-100)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-bright)', fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['title', 'artist', 'key'].map(s => (
              <button key={s} onClick={() => setSort(s)} style={{
                ...btnStyle, padding: '6px 12px', fontSize: 12,
                background: sort === s ? 'var(--ds-gray-200)' : 'var(--ds-background-100)',
                borderColor: sort === s ? 'var(--text-bright)' : 'var(--border)',
              }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 8,
        }}>
          {filtered.map(song => (
            <SongCard key={song.id} song={song} onClick={onSelectSong} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: 16,
          }}>
            <p className="text-copy-16">No songs found.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 84, right: 24, zIndex: 90 }}>
        {fabOpen && (
          <>
            <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 89 }} />
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 12px)', right: 0,
              display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160,
              padding: '8px', borderRadius: 12, background: 'var(--ds-background-100)',
              border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              zIndex: 90,
            }}>
              <button onClick={() => { setFabOpen(false); onNewSong(); }} style={{
                ...btnStyle, padding: '10px 16px', borderRadius: 8, border: 'none',
                background: 'none', color: 'var(--text-bright)', fontSize: 13, justifyContent: 'flex-start',
              }} className="hover:bg-[var(--ds-gray-100)]">
                + New Song
              </button>
              <button onClick={() => { setFabOpen(false); fileRef.current?.click(); }} style={{
                ...btnStyle, padding: '10px 16px', borderRadius: 8, border: 'none',
                background: 'none', color: 'var(--text-bright)', fontSize: 13, justifyContent: 'flex-start',
              }} className="hover:bg-[var(--ds-gray-100)]">
                + Import .md
              </button>
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'var(--color-brand)', color: '#fff',
            fontSize: 28, fontWeight: 300, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px var(--accent-border)',
            transition: 'transform 0.2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  );
}
