import { useState, useMemo, useRef } from 'react';
import PageHeader from './PageHeader';
import SetlistCard from './SetlistCard';

export default function Setlists({ songs, setlists, onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist }) {
  const [fabOpen, setFabOpen] = useState(false);
  const fileRef = useRef(null);

  const sorted = useMemo(() => {
    return [...setlists].sort((a, b) => b.date.localeCompare(a.date));
  }, [setlists]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      <PageHeader title="Setlists" />

      <div style={{ padding: '24px' }}>
        {sorted.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {sorted.map(sl => (
              <SetlistCard
                key={sl.id}
                setlist={sl}
                onPlay={() => onPlaySetlist(sl)}
                onView={() => onViewSetlist(sl)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: 16,
          }}>
            <p className="text-copy-16">No setlists yet.</p>
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
              <button onClick={() => { setFabOpen(false); onNewSetlist(); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
                border: 'none', background: 'none', color: 'var(--text-bright)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--fb)', fontWeight: 600,
              }} className="hover:bg-[var(--ds-gray-100)]">
                + New Setlist
              </button>
              <button onClick={() => { setFabOpen(false); fileRef.current?.click(); }} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
                border: 'none', background: 'none', color: 'var(--text-bright)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--fb)', fontWeight: 600,
              }} className="hover:bg-[var(--ds-gray-100)]">
                + Import .zip
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
      <input ref={fileRef} type="file" accept=".zip" onChange={e => {
        if (e.target.files[0]) onImportSetlist(e.target.files[0]);
        e.target.value = '';
      }} style={{ display: 'none' }} />
    </div>
  );
}
