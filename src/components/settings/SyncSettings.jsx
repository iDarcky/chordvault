import { useState } from 'react';
import { getProvider, getAvailableProviders } from '../../sync/provider';
import { setActiveProvider, clearProvider, getSyncState } from '../../sync/tokens';

export default function SyncSettings({ syncState, onSyncStateChange, onSyncNow }) {
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState(null);

  const handleConnect = async (providerName) => {
    setConnecting(providerName);
    setError(null);
    try {
      const provider = getProvider(providerName);
      const tokens = await provider.connect();
      await setActiveProvider(providerName, tokens);
      onSyncStateChange({ state: 'idle', lastSync: null, provider: providerName });
      if (onSyncNow) onSyncNow();
    } catch (err) {
      setError(err.message || 'Failed to connect.');
    } finally {
      setConnecting(null);
    }
  };

  const providers = getAvailableProviders();
  const connected = syncState.provider;

  return (
    <section>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Cloud Sync</h3>
      <div className="bento-card">
        {connected ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{connected.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>CONNECTED</div>
            </div>
            <button className="primary" onClick={onSyncNow} style={{ padding: '8px 16px', borderRadius: 30, fontSize: 12 }}>SYNC NOW</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {providers.map(p => (
              <button key={p.name} onClick={() => handleConnect(p.name)} disabled={!p.configured} style={{
                flex: 1, minWidth: 120, height: 48, borderRadius: 12, background: 'var(--surface-alt)', fontSize: 13,
                opacity: p.configured ? 1 : 0.4
              }}>
                {p.displayName}
              </button>
            ))}
          </div>
        )}
        {error && <div style={{ marginTop: 16, color: 'var(--danger)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
      </div>
    </section>
  );
}
