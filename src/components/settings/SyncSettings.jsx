import React from 'react';
import { Button } from '../ui/Button';

export default function SyncSettings({ syncState, onSyncStateChange, onSyncNow }) {
  const providers = [
    { id: 'google', name: 'Google Drive', icon: '💾' },
    { id: 'dropbox', name: 'Dropbox', icon: '📦' },
    { id: 'onedrive', name: 'OneDrive', icon: '☁️' },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-label-12 text-[var(--modes-text-dim)] uppercase tracking-wider font-semibold">
          Cloud Sync
        </h2>
        {syncState.provider && (
          <Button variant="ghost" size="sm" onClick={onSyncNow} loading={syncState.state === 'syncing'}>
            Sync Now
          </Button>
        )}
      </div>

      <div className="modes-card flex flex-col p-0 overflow-hidden divide-y" style={{ borderColor: 'var(--modes-border)' }}>
        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-copy-14 text-[var(--modes-text)] font-medium">Status</span>
            <span className="text-copy-13 text-[var(--modes-text-muted)]">
              {syncState.lastSync ? `Last synced: ${new Date(syncState.lastSync).toLocaleString()}` : 'Not connected'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className={`h-2 w-2 rounded-full ${syncState.state === 'syncing' ? 'bg-amber-400 animate-pulse' : syncState.provider ? 'bg-emerald-400' : 'bg-[var(--modes-border)]'}`} />
            <span className="text-label-12 uppercase font-semibold text-[var(--modes-text-muted)]">
              {syncState.state === 'syncing' ? 'Syncing…' : syncState.provider ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-copy-14 text-[var(--modes-text)] font-medium">Provider</span>
            <span className="text-copy-13 text-[var(--modes-text-muted)]">Choose where your data is stored securely.</span>
          </div>
          <div className="flex p-1 bg-[var(--modes-surface-strong)] rounded-lg flex-wrap mt-2 sm:mt-0">
            {providers.map(p => (
              <Button
                key={p.id}
                size="sm"
                variant={syncState.provider === p.id ? 'secondary' : 'ghost'}
                onClick={() => onSyncStateChange({ ...syncState, provider: p.id })}
                className={syncState.provider === p.id ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--modes-text-muted)]"}
              >
                {p.icon} {p.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
