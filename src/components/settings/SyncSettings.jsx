import React from 'react';

const labelStyle = {
  className: "text-label-12-mono", color: 'var(--text-muted)',
  fontFamily: 'var(--fm)', display: 'block', marginBottom: 6,
};

const cB = {
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)',
  className: "text-label-12", cursor: 'pointer', fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--fb)', padding: '6px 14px',
};

const activeBtn = (active) => ({
  ...cB,
  borderColor: active ? 'var(--accent)' : 'var(--border)',
  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
  background: active ? 'var(--accent-soft)' : 'var(--surface)',
});

export default function SyncSettings({ syncState, onSyncStateChange, onSyncNow }) {
  const providers = [
    { id: 'google', name: '💾 Google Drive' },
    { id: 'dropbox', name: '📦 Dropbox' },
    { id: 'onedrive', name: '☁️ OneDrive' },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle}>Cloud Sync</label>
      <div style={{
        padding: '12px 14px', borderRadius: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        marginBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: syncState.state === 'syncing' ? '#fbbf24' : syncState.provider ? '#10b981' : 'var(--text-muted)',
            animation: syncState.state === 'syncing' ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase' }}>
            {syncState.state === 'syncing' ? 'Syncing...' : syncState.provider ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {syncState.provider && (
          <button onClick={onSyncNow} disabled={syncState.state === 'syncing'} style={{ ...cB, padding: '4px 12px', fontSize: 11 }}>
            Sync Now
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {providers.map(p => (
          <button
            key={p.id}
            onClick={() => onSyncStateChange({ ...syncState, provider: p.id })}
            style={activeBtn(syncState.provider === p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {syncState.lastSync && (
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
          Last sync: {new Date(syncState.lastSync).toLocaleString()}
        </div>
      )}
    </div>
  );
}
