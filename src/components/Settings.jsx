import { useState } from 'react';
import SyncSettings from './settings/SyncSettings';

const labelStyle = {
  fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  fontFamily: 'var(--fm)', display: 'block', marginBottom: 6,
};

const cB = {
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)',
  fontSize: 12, cursor: 'pointer', fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--fb)', padding: '6px 14px',
};

const activeBtn = (active) => ({
  ...cB,
  borderColor: active ? 'var(--accent)' : 'var(--border)',
  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
  background: active ? 'var(--accent-soft)' : 'var(--surface)',
});

export default function Settings({ settings, onUpdate, onBack, onClearAll, songCount, setlistCount, syncState, onSyncStateChange, onSyncNow }) {
  const [detectingKey, setDetectingKey] = useState(null); // 'next' | 'prev' | null

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--header-bg)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 18px 10px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', padding: 4,
        }}>
          &#8592; Back
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-bright)' }}>
          Settings
        </span>
      </div>

      <div style={{ padding: '16px 18px', maxWidth: 500 }}>
        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Theme</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['dark', 'light'].map(t => (
              <button key={t} onClick={() => update('theme', t)} style={activeBtn(settings.theme === t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Default Layout */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Default Layout</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['auto', 1, 2].map(v => (
              <button key={v} onClick={() => update('defaultColumns', v)} style={activeBtn(settings.defaultColumns === v)}>
                {v === 'auto' ? 'Auto' : `${v}col`}
              </button>
            ))}
          </div>
        </div>

        {/* Default Font Size */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Default Font Size</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['S', 'M', 'L'].map(s => (
              <button key={s} onClick={() => update('defaultFontSize', s)} style={activeBtn(settings.defaultFontSize === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pedal Mapping */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Pedal / Keyboard Mapping</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { field: 'pedalNext', label: 'Next Song' },
              { field: 'pedalPrev', label: 'Previous Song' },
            ].map(({ field, label }) => (
              <div key={field} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{label}</span>
                <button
                  onClick={() => handleDetectKey(field)}
                  style={{
                    ...cB,
                    background: detectingKey === field ? 'rgba(245,158,11,0.15)' : 'var(--surface)',
                    borderColor: detectingKey === field ? 'rgba(245,158,11,0.4)' : 'var(--border)',
                    color: detectingKey === field ? '#fbbf24' : 'var(--chord)',
                    fontFamily: 'var(--fm)', fontSize: 11,
                  }}
                >
                  {detectingKey === field ? 'Press a key...' : settings[field]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Sync */}
        <SyncSettings
          syncState={syncState || { state: 'idle', lastSync: null, provider: null }}
          onSyncStateChange={onSyncStateChange}
          onSyncNow={onSyncNow}
        />

        {/* Data */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Data</label>
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {songCount} song{songCount !== 1 ? 's' : ''} · {setlistCount} setlist{setlistCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => { if (confirm('Delete ALL songs and setlists? This cannot be undone.')) onClearAll(); }}
            style={{
              ...cB, width: '100%', justifyContent: 'center',
              background: 'var(--danger-soft)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--danger)',
            }}
          >
            Clear All Data
          </button>
        </div>

        {/* About */}
        <div style={{
          padding: '12px 14px', borderRadius: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4 }}>
            ChordVault
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Free, offline-first chord chart app for worship teams.
            Songs are portable .md files.
          </div>
        </div>
      </div>
    </div>
  );
}
