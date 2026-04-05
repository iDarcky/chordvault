import React from 'react';
import PageHeader from './PageHeader';
import SetlistCard from './SetlistCard';

export default function Setlists({ songs, setlists, onViewSetlist, onPlaySetlist, onNewSetlist, onImportSetlist }) {
  const sorted = [...setlists].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ds-background-200)', paddingBottom: 100 }}>
      <PageHeader title="Setlists">
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onNewSetlist} className="text-button-14" style={{
            background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600
          }}>
            Create Setlist
          </button>
          <label style={{
            background: 'var(--ds-background-100)', color: 'var(--text-bright)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13
          }}>
            Import .zip
            <input type="file" accept=".zip" onChange={(e) => {
              const file = e.target.files[0];
              if (file) onImportSetlist(file);
            }} style={{ display: 'none' }} />
          </label>
        </div>
      </PageHeader>

      <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {sorted.map(sl => (
            <SetlistCard
              key={sl.id}
              setlist={sl}
              onPlay={() => onPlaySetlist(sl)}
              onView={() => onViewSetlist(sl)}
            />
          ))}
          {sorted.length === 0 && (
            <div style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 16 }}>
              <p className="text-copy-14" style={{ color: 'var(--text-muted)' }}>
                Organize your songs into setlists for rehearsals or live performances.
              </p>
              <button onClick={onNewSetlist} className="text-button-14" style={{
                marginTop: 16, background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600
              }}>
                Create Your First Setlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
