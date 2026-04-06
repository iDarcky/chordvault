import React, { useState } from 'react';
import { Button, Card, CardContent, Chip } from "@heroui/react";
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
    <div className="mb-6">
      <h3 className="text-xs font-bold text-default-400 uppercase tracking-widest mb-3 px-1">Cloud Sync</h3>

      {connected ? (
        <Card className="bg-content1 border-none shadow-sm">
          <CardContent className="p-4 flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">
                {providers.find(p => p.name === connected)?.displayName || connected}
              </span>
              <span className="text-xs text-default-400">
                {syncState.lastSync
                  ? `Synced ${new Date(syncState.lastSync).toLocaleString()}`
                  : 'Not yet synced'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" color="primary" variant="flat" onPress={onSyncNow} className="font-bold">
                Sync Now
              </Button>
              <Button size="sm" color="danger" variant="flat" onPress={handleDisconnect} className="font-bold">
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-default-400 px-1">
            Connect a cloud provider to sync songs across devices.
          </p>
          <div className="flex gap-2 flex-wrap text-foreground">
            {providers.map(p => {
              const disabled = !p.configured || !!connecting;
              return (
                <Button
                  key={p.name}
                  onPress={() => handleConnect(p.name)}
                  isDisabled={disabled}
                  variant="flat"
                  startContent={<span>{p.icon}</span>}
                  className="bg-content1 font-semibold"
                >
                  {connecting === p.name ? 'Connecting...' : p.displayName}
                </Button>
              );
            })}
          </div>
          {!anyConfigured && (
            <p className="text-xs text-default-300 italic px-1">
              No cloud providers configured. Set OAuth client IDs in the environment to enable sync.
            </p>
          )}
        </div>
      )}

      {error && (
        <Chip
          color="danger"
          variant="flat"
          className="mt-3 w-full h-auto py-2 px-3 text-xs leading-relaxed rounded-lg"
        >
          {error}
        </Chip>
      )}
    </div>
  );
}
