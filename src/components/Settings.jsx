import { useState } from 'react';
import SyncSettings from './settings/SyncSettings';
import { saveSettings } from '../storage';

export default function Settings({ settings, onUpdate, onBack, onClearAll, songCount, setlistCount, syncState, onSyncStateChange, onSyncNow }) {
  const [detectingKey, setDetectingKey] = useState(null);

  const update = (key, value) => onUpdate({ ...settings, [key]: value });

  const handleDetectKey = (field) => {
    setDetectingKey(field);
    const handler = (e) => {
      e.preventDefault();
      update(field, e.code);
      setDetectingKey(null);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('keydown', handler);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
      <header className="glass-header" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-alt)' }}>←</button>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Settings</h1>
        </div>
      </header>

      <main style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Appearance</h3>
          <div className="bento-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => update('theme', t)} style={{
                height: 48, borderRadius: 12, background: settings.theme === t ? 'var(--accent)' : 'var(--surface-alt)',
                color: settings.theme === t ? '#fff' : 'var(--text)', border: 'none', fontWeight: 700
              }}>{t.toUpperCase()}</button>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Layout</h3>
          <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: 15, fontWeight: 600 }}>Default Columns</span>
               <div style={{ display: 'flex', gap: 8 }}>
                 {['auto', 1, 2].map(v => (
                   <button key={v} onClick={() => update('defaultColumns', v)} style={{ width: 44, height: 36, borderRadius: 8, background: settings.defaultColumns === v ? 'var(--accent)' : 'var(--surface-alt)', color: settings.defaultColumns === v ? '#fff' : 'var(--text)', fontSize: 12 }}>{v}</button>
                 ))}
               </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: 15, fontWeight: 600 }}>Text Size</span>
               <div style={{ display: 'flex', gap: 8 }}>
                 {['S', 'M', 'L'].map(v => (
                   <button key={v} onClick={() => update('defaultFontSize', v)} style={{ width: 44, height: 36, borderRadius: 8, background: settings.defaultFontSize === v ? 'var(--accent)' : 'var(--surface-alt)', color: settings.defaultFontSize === v ? '#fff' : 'var(--text)', fontSize: 12 }}>{v}</button>
                 ))}
               </div>
             </div>
          </div>
        </section>

        <SyncSettings syncState={syncState} onSyncStateChange={onSyncStateChange} onSyncNow={onSyncNow} />

        <section>
           <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Data Management</h3>
           <div className="bento-card" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
              <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Deleting your local data is permanent. Make sure your cloud sync is complete.</p>
              <button onClick={() => confirm('Delete everything?') && onClearAll()} style={{ width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 12 }}>CLEAR ALL DATA</button>
           </div>
        </section>
      </main>
    </div>
  );
}
