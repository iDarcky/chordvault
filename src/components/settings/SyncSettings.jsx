import { useState } from 'react';
import { getProvider, getAvailableProviders } from '../../sync/provider';
import { setActiveProvider, clearProvider, getSyncState } from '../../sync/tokens';

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
      const msg = err.message || '';
      if (msg.includes('popup') || msg.includes('closed')) {
        setError('Sign-in was cancelled. Please try again.');
      } else if (msg.includes('not configured')) {
        setError(msg);
      } else {
        setError(msg || 'Failed to connect. Please try again.');
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    const state = await getSyncState();
    if (state?.activeProvider) {
      try {
        const provider = getProvider(state.activeProvider);
        await provider.disconnect();
      } catch { /* ignore */ }
    }
    await clearProvider();
    onSyncStateChange({ state: 'idle', lastSync: null, provider: null });
  };

  const providers = getAvailableProviders();
  const connected = syncState.provider;
  const anyConfigured = providers.some(p => p.configured);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle}>Cloud Sync</label>

      {connected ? (
        <div>
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            marginBottom: 8,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
                  {providers.find(p => p.name === connected)?.displayName || connected}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {syncState.lastSync
                    ? `Last synced: ${new Date(syncState.lastSync).toLocaleString()}`
                    : 'Not yet synced'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={onSyncNow} style={{
                  ...cB, padding: '5px 12px',
                  color: 'var(--accent-text)',
                  background: 'var(--accent-soft)',
                  borderColor: 'rgba(99,102,241,0.3)',
                }}>
                  Sync Now
                </button>
                <button onClick={handleDisconnect} style={{
                  ...cB, padding: '5px 12px',
                  color: 'var(--danger)',
                  background: 'var(--danger-soft)',
                  borderColor: 'rgba(239,68,68,0.2)',
                }}>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.5,
          }}>
            Connect a cloud provider to sync songs across devices.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {providers.map(p => {
              const disabled = !p.configured || !!connecting;
              return (
                <button
                  key={p.name}
                  onClick={() => handleConnect(p.name)}
                  disabled={disabled}
                  title={!p.configured ? 'Not configured' : undefined}
                  style={{
                    ...cB,
                    padding: '10px 16px',
                    gap: 6,
                    opacity: !p.configured ? 0.35 : (connecting && connecting !== p.name ? 0.5 : 1),
                    cursor: !p.configured ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>{p.icon}</span>
                  {connecting === p.name ? 'Connecting...' : p.displayName}
                </button>
              );
            })}
          </div>
          {!anyConfigured && (
            <div style={{
              fontSize: 11, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.5,
            }}>
              No cloud providers are configured. Set OAuth client IDs in the environment to enable sync.
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 6,
          background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.2)',
          fontSize: 12, color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
