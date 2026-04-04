import { useState } from 'react';
import { getProvider, getAvailableProviders } from '../../sync/provider';
import { setActiveProvider, clearProvider, getSyncState } from '../../sync/tokens';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

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
    <div className="space-y-4">
      {connected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-geist border border-accents-2 bg-accents-1/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {providers.find(p => p.name === connected)?.displayName || connected}
                </span>
                <Badge variant="success" className="text-[9px] font-black h-4 px-1 leading-none uppercase">CONNECTED</Badge>
              </div>
              <div className="text-[10px] font-bold text-accents-4 mt-1 font-mono uppercase tracking-wider">
                {syncState.lastSync
                  ? `LAST SYNC: ${new Date(syncState.lastSync).toLocaleString()}`
                  : 'NOT YET SYNCED'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onSyncNow} className="h-8 text-[10px] font-bold">
                SYNC NOW
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDisconnect} className="h-8 text-[10px] font-bold text-geist-error hover:bg-geist-error/10 border-geist-error/20">
                DISCONNECT
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-accents-4 leading-relaxed max-w-sm">
            Keep your library in sync across all your devices using your preferred cloud storage provider.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {providers.map(p => {
              const disabled = !p.configured || !!connecting;
              return (
                <Button
                  key={p.name}
                  onClick={() => handleConnect(p.name)}
                  disabled={disabled}
                  variant="secondary"
                  className={cn(
                    "h-12 gap-3 justify-start px-4",
                    !p.configured && "opacity-30 grayscale"
                  )}
                >
                  <span className="text-lg opacity-70">{p.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {connecting === p.name ? '...' : p.displayName}
                  </span>
                </Button>
              );
            })}
          </div>
          {!anyConfigured && (
            <div className="p-3 rounded bg-geist-warning/5 border border-geist-warning/10 text-[10px] font-bold text-geist-warning uppercase tracking-tight">
              No cloud providers configured in the current environment.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-geist-error/5 border border-geist-error/10 text-xs text-geist-error font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
