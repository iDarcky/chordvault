import { useState, useEffect, useRef } from 'react';
import { parseSongMd, songToMd, generateId } from '../parser';
import VisualTab from './editor/VisualTab';
import FormTab from './editor/FormTab';
import RawTab from './editor/RawTab';

export default function Editor({ song, onSave, onBack, onDelete }) {
  const [activeTab, setActiveTab] = useState('visual');
  const [raw, setRaw] = useState(song ? songToMd(song) : '');
  const [preview, setPreview] = useState(song || { title: '', artist: '', key: 'C', sections: [] });

  useEffect(() => {
    try {
      const parsed = parseSongMd(raw);
      setPreview(parsed);
    } catch { /* keep old preview */ }
  }, [raw]);

  const handleSave = () => {
    onSave({ ...preview, id: song?.id || generateId(), raw });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      <header className="glass-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-alt)' }}>←</button>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{preview.title || 'Untitled Song'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onDelete && (
            <button onClick={() => confirm('Delete song?') && onDelete(song.id)} style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)' }}>🗑</button>
          )}
          <button className="primary" onClick={handleSave} style={{ padding: '8px 24px', borderRadius: 10 }}>SAVE</button>
        </div>
      </header>

      <nav style={{ padding: '20px 20px 0', display: 'flex', gap: 8 }}>
        {[
          { id: 'visual', label: 'PREVIEW' },
          { id: 'form', label: 'STRUCTURE' },
          { id: 'raw', label: 'MARKDOWN' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
            background: activeTab === t.id ? 'var(--surface-alt)' : 'transparent',
            border: `1px solid ${activeTab === t.id ? 'var(--border-bright)' : 'transparent'}`,
            color: activeTab === t.id ? 'var(--text-bright)' : 'var(--text-dim)',
          }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ padding: '24px 20px' }}>
        {activeTab === 'visual' && <VisualTab song={preview} />}
        {activeTab === 'form' && <FormTab song={preview} onChange={(p) => { setPreview(p); setRaw(songToMd(p)); }} />}
        {activeTab === 'raw' && <RawTab raw={raw} onChange={setRaw} />}
      </main>
    </div>
  );
}
