import { useState, useMemo, useRef } from 'react';
import PageHeader from './PageHeader';
import SearchIcon from './SearchIcon';

export default function Library({
  songs, onSelectSong, onNewSong, onImportSong,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const [tagFilter, setTagFilter] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fileRef = useRef(null);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    songs.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [songs]);

  const filtered = useMemo(() => {
    let list = songs;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }
    if (tagFilter.length > 0) {
      list = list.filter(s =>
        tagFilter.some(t => (s.tags || []).includes(t))
      );
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'artist') sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (sort === 'key') sorted.sort((a, b) => a.key.localeCompare(b.key));
    return sorted;
  }, [songs, query, sort, tagFilter]);

  const grouped = useMemo(() => {
    const groups = [];
    let currentLabel = null;
    for (const song of filtered) {
      let label;
      if (sort === 'title') {
        label = (song.title[0] || '#').toUpperCase();
      } else if (sort === 'artist') {
        label = song.artist || 'Unknown';
      } else {
        label = song.key || '?';
      }
      if (label !== currentLabel) {
        groups.push({ label, songs: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].songs.push(song);
    }
    return groups;
  }, [filtered, sort]);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImportSong(text);
    }
    e.target.value = '';
  };

  const toggleTag = (tag) => {
    setTagFilter(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const sortBtnStyle = (active) => ({
    border: 'none', borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    fontFamily: 'var(--fb)', fontWeight: 500, fontSize: 12,
    padding: '5px 10px',
    color: active ? 'var(--text-bright)' : 'var(--text-muted)',
    background: active ? 'var(--surface)' : 'transparent',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title="Library" />

      {/* Search bar + Tags filter */}
      <div style={{ padding: '0 24px 8px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text)',
                fontSize: 14, outline: 'none',
                fontFamily: 'var(--fb)', boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute', left: 11, top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', color: 'var(--text-dim)',
            }}>
              <SearchIcon size={16} />
            </span>
          </div>

          {/* Tags dropdown */}
          {allTags.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowTagDropdown(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg)', cursor: 'pointer',
                  fontFamily: 'var(--fb)', fontSize: 13, fontWeight: 500,
                  color: tagFilter.length > 0 ? 'var(--text-bright)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tagFilter.length > 0 && (
                  <span style={{
                    display: 'flex', gap: 2,
                  }}>
                    {tagFilter.slice(0, 3).map(t => (
                      <span key={t} style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--accent)',
                      }} />
                    ))}
                  </span>
                )}
                Tags{tagFilter.length > 0 ? ` ${tagFilter.length}/${allTags.length}` : ''}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2 }}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showTagDropdown && (
                <>
                  <div onClick={() => setShowTagDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '6px 0', zIndex: 50,
                    minWidth: 180, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }}>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '8px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--fb)', fontSize: 13,
                          color: 'var(--text)', textAlign: 'left',
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: tagFilter.includes(tag) ? 'none' : '1px solid var(--border)',
                          background: tagFilter.includes(tag) ? 'var(--accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 11, flexShrink: 0,
                        }}>
                          {tagFilter.includes(tag) && '\u2713'}
                        </span>
                        {tag}
                      </button>
                    ))}
                    {tagFilter.length > 0 && (
                      <button
                        onClick={() => setTagFilter([])}
                        style={{
                          width: '100%', padding: '8px 14px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderTop: '1px solid var(--border)',
                          fontFamily: 'var(--fb)', fontSize: 12,
                          color: 'var(--text-muted)', textAlign: 'center',
                          marginTop: 4,
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sort row */}
        <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
          {[
            { id: 'title', label: 'Title' },
            { id: 'artist', label: 'Artist' },
            { id: 'key', label: 'Key' },
          ].map(s => (
            <button key={s.id} onClick={() => setSort(s.id)} style={sortBtnStyle(sort === s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Song list — grouped */}
      <div style={{ padding: '0 24px', paddingBottom: 100 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
          fontFamily: 'var(--fm)', marginBottom: 8,
        }}>
          All Songs
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-dim)', fontSize: 14,
            border: '1px solid var(--border)', borderRadius: 10,
          }}>
            {songs.length === 0
              ? 'No songs yet. Tap + to create or import.'
              : 'No songs match your search.'}
          </div>
        )}

        {grouped.map(group => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: sort === 'title' ? 18 : 14,
              fontWeight: 700,
              color: 'var(--text-bright)',
              fontFamily: sort === 'key' ? 'var(--fm)' : 'var(--fb)',
              marginBottom: 6,
              padding: '0 2px',
            }}>
              {group.label}
            </div>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {group.songs.map((song, i) => (
                <div
                  key={song.id || i}
                  onClick={() => onSelectSong(song)}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: i < group.songs.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', boxSizing: 'border-box',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: 'var(--text-bright)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {song.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: 'var(--text-muted)', marginTop: 3,
                      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                    }}>
                      <span>{song.artist}</span>
                      <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                      <span style={{ fontFamily: 'var(--fm)', fontSize: 11, fontWeight: 600, color: 'var(--chord)' }}>
                        {song.key}
                      </span>
                      {song.tempo && (
                        <>
                          <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                          <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{song.tempo} bpm</span>
                        </>
                      )}
                      {song.time && (
                        <>
                          <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                          <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{song.time}</span>
                        </>
                      )}
                      {(song.tags || []).length > 0 && (
                        <>
                          <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
                          {song.tags.map(t => (
                            <span key={t} style={{
                              fontSize: 10, padding: '1px 6px', borderRadius: 4,
                              background: 'var(--accent-soft)', color: 'var(--accent-text)',
                              fontWeight: 500,
                            }}>
                              {t}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      {fabOpen && (
        <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 89 }} />
      )}
      <div style={{
        position: 'fixed', bottom: 80, right: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: 8, zIndex: 90,
      }}>
        {fabOpen && (
          <>
            <button onClick={() => { setFabOpen(false); onNewSong(); }} style={{
              borderRadius: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13,
              padding: '10px 18px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              New Song
            </button>
            <button onClick={() => { setFabOpen(false); fileRef.current?.click(); }} style={{
              borderRadius: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--fb)', fontWeight: 600, fontSize: 13,
              padding: '10px 18px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-bright)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}>
              Import .md
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen(prev => !prev)}
          style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: '#fff',
            fontSize: 28, fontWeight: 300, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            transition: 'transform 0.2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".md,.txt" multiple
        onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  );
}
