import { useState, useMemo } from 'react';
import { transposeKey, sectionStyle } from '../music';
import { generateId } from '../parser';

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'var(--surface)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 7, color: 'var(--text)',
  fontSize: 14, outline: 'none',
  fontFamily: 'var(--fb)', boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  fontFamily: 'var(--fm)', display: 'block', marginBottom: 4,
};

const cB = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--surface)', color: 'var(--text)',
  fontSize: 15, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--fm)',
};

export default function SetlistBuilder({ songs, setlist, onSave, onBack, onDelete }) {
  const [name, setName] = useState(setlist?.name || '');
  const [date, setDate] = useState(setlist?.date || new Date().toISOString().slice(0, 10));
  const [service, setService] = useState(setlist?.service || 'Morning');
  const [items, setItems] = useState(setlist?.items || []);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [songs, search]);

  const addSong = (song) => {
    setItems(p => [...p, { songId: song.id, note: '', transpose: 0 }]);
    setAdding(false);
    setSearch('');
  };
  const removeSong = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const moveItem = (idx, dir) => {
    setItems(p => {
      const n = [...p];
      const t = n[idx];
      n[idx] = n[idx + dir];
      n[idx + dir] = t;
      return n;
    });
  };
  const updateNote = (idx, note) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, note } : it));
  const updateTranspose = (idx, val) =>
    setItems(p => p.map((it, i) => i === idx ? { ...it, transpose: val } : it));
  const getSong = (id) => songs.find(s => s.id === id);

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a setlist name'); return; }
    onSave({
      id: setlist?.id || generateId(),
      name: name.trim(), date, service, items,
      createdAt: setlist?.createdAt || Date.now(),
    });
  };

  const totalDuration = items.reduce((sum, it) => {
    const s = getSong(it.songId);
    if (!s) return sum;
    const bpm = s.tempo || 120;
    return sum + Math.round(240 / bpm * s.sections.length);
  }, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: 4,
          }}>
            &#8592; Back
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-bright)' }}>
            {setlist ? 'Edit Setlist' : 'New Setlist'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {setlist && onDelete && (
            <button
              onClick={() => { if (confirm('Delete this setlist?')) onDelete(setlist.id); }}
              style={{
                background: 'var(--danger-soft)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 7, padding: '7px 14px',
                color: 'var(--danger)', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Delete
            </button>
          )}
          <button onClick={handleSave} style={{
            background: 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 7, padding: '7px 18px',
            color: 'var(--accent-text)', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
            Save
          </button>
        </div>
      </div>

      {/* Meta fields */}
      <div style={{ padding: '16px 18px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={labelStyle}>Setlist Name</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Sunday Morning Service" style={inputStyle}
          />
        </div>
        <div style={{ flex: '0 0 150px' }}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '0 0 130px' }}>
          <label style={labelStyle}>Service</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {['Morning', 'Evening', 'Special'].map(s => (
              <button key={s} onClick={() => setService(s)} style={{
                ...cB, padding: '6px 10px', width: 'auto', fontSize: 11,
                borderColor: service === s ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                color: service === s ? 'var(--accent-text)' : 'rgba(255,255,255,0.4)',
                background: service === s ? 'var(--accent-soft)' : 'var(--surface)',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Song order */}
      <div style={{ padding: '0 18px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 10,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
            Songs ({items.length})
            {totalDuration > 0 && (
              <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>
                {' '}· ~{totalDuration} min est.
              </span>
            )}
          </span>
        </div>

        {items.map((item, idx) => {
          const song = getSong(item.songId);
          if (!song) return null;
          const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 6,
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden', background: 'rgba(255,255,255,0.015)',
            }}>
              {/* Order number + move buttons */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', width: 44,
                background: 'rgba(255,255,255,0.02)',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                gap: 2, padding: '4px 0',
              }}>
                <button
                  onClick={() => idx > 0 && moveItem(idx, -1)}
                  disabled={idx === 0}
                  style={{
                    background: 'none', border: 'none',
                    color: idx > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                    cursor: idx > 0 ? 'pointer' : 'default', padding: 2, display: 'flex',
                    minHeight: 'auto',
                  }}
                >
                  &#9650;
                </button>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--fm)',
                }}>
                  {idx + 1}
                </span>
                <button
                  onClick={() => idx < items.length - 1 && moveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  style={{
                    background: 'none', border: 'none',
                    color: idx < items.length - 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                    cursor: idx < items.length - 1 ? 'pointer' : 'default',
                    padding: 2, display: 'flex', minHeight: 'auto',
                  }}
                >
                  &#9660;
                </button>
              </div>

              {/* Song info */}
              <div style={{
                flex: 1, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                  border: `1px solid ${s.b}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--fm)', fontSize: 13, fontWeight: 700, color: s.d,
                }}>
                  {transposeKey(song.key, item.transpose)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: 'var(--text-bright)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                    {song.artist} · {song.tempo} bpm · {song.time}
                  </div>
                </div>
              </div>

              {/* Transpose + note + remove */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                }}>
                  <span style={{
                    fontSize: 8, color: 'var(--text-dim)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>
                    Trans
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button
                      onClick={() => updateTranspose(idx, (item.transpose - 1 + 12) % 12)}
                      style={{ ...cB, width: 22, height: 22, fontSize: 12, minHeight: 'auto' }}
                    >
                      &#8722;
                    </button>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--fm)', fontWeight: 700,
                      color: item.transpose ? 'var(--chord)' : 'rgba(255,255,255,0.3)',
                      minWidth: 18, textAlign: 'center',
                    }}>
                      {item.transpose || 0}
                    </span>
                    <button
                      onClick={() => updateTranspose(idx, (item.transpose + 1) % 12)}
                      style={{ ...cB, width: 22, height: 22, fontSize: 12, minHeight: 'auto' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  value={item.note}
                  onChange={e => updateNote(idx, e.target.value)}
                  placeholder="Note..."
                  style={{
                    width: 100, padding: '5px 8px',
                    background: 'var(--surface)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 5, color: 'var(--text)', fontSize: 11,
                    fontFamily: 'var(--fb)', outline: 'none',
                  }}
                />
                <button
                  onClick={() => removeSong(idx)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                    padding: 4, display: 'flex', minHeight: 'auto',
                  }}
                >
                  &#10005;
                </button>
              </div>
            </div>
          );
        })}

        {/* Add song */}
        {adding ? (
          <div style={{
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 10, overflow: 'hidden', marginTop: 8,
          }}>
            <div style={{
              padding: 10,
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                placeholder="Search songs..."
                style={{ ...inputStyle, fontSize: 13 }}
              />
            </div>
            <div style={{ maxHeight: 250, overflowY: 'auto' }}>
              {available.map(song => {
                const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
                return (
                  <button key={song.id} onClick={() => addSong(song)} style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: '10px 12px', background: 'none',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                      background: `linear-gradient(135deg,${s.b}33,${s.b}11)`,
                      border: `1px solid ${s.b}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 700, color: s.d,
                    }}>
                      {song.key}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
                        {song.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {song.artist}
                      </div>
                    </div>
                  </button>
                );
              })}
              {available.length === 0 && (
                <div style={{
                  padding: 20, textAlign: 'center',
                  color: 'var(--text-dim)', fontSize: 13,
                }}>
                  No songs found
                </div>
              )}
            </div>
            <div style={{
              padding: 8,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <button
                onClick={() => { setAdding(false); setSearch(''); }}
                style={{
                  width: '100%', justifyContent: 'center',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 7, padding: '7px 12px',
                  color: '#94a3b8', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--fb)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%', justifyContent: 'center', marginTop: 8,
              padding: '14px 0', borderStyle: 'dashed',
              background: 'var(--surface)',
              border: '1px dashed var(--border)',
              borderRadius: 7, color: '#94a3b8', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--fb)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            + Add Song
          </button>
        )}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}
