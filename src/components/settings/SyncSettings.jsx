import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export default function SyncSettings({ syncState, onSyncStateChange, onSyncNow }) {
  const providers = [
    { id: 'google', name: 'Google Drive', icon: '💾' },
    { id: 'dropbox', name: 'Dropbox', icon: '📦' },
    { id: 'onedrive', name: 'OneDrive', icon: '☁️' },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold">
          Cloud Sync
        </h2>
        {syncState.provider && (
          <Button variant="ghost" size="sm" onClick={onSyncNow} loading={syncState.state === 'syncing'}>
            Sync Now
          </Button>
        )}
      </div>

      <Card className="flex flex-col p-0 overflow-hidden divide-y divide-[var(--ds-gray-400)] border-[var(--ds-gray-400)]">
        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--ds-background-100)] hover:bg-[var(--ds-gray-100)] transition-colors">
          <div className="flex flex-col">
            <span className="text-copy-14 text-[var(--ds-gray-1000)] font-medium">Status</span>
            <span className="text-copy-13 text-[var(--ds-gray-700)]">
              {syncState.lastSync ? `Last synced: ${new Date(syncState.lastSync).toLocaleString()}` : 'Not connected'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className={`h-2 w-2 rounded-full ${syncState.state === 'syncing' ? 'bg-amber-400 animate-pulse' : syncState.provider ? 'bg-emerald-400' : 'bg-[var(--ds-gray-400)]'}`} />
            <span className="text-label-12 uppercase font-semibold text-[var(--ds-gray-900)]">
              {syncState.state === 'syncing' ? 'Syncing...' : syncState.provider ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--ds-background-100)] hover:bg-[var(--ds-gray-100)] transition-colors">
          <div className="flex flex-col">
            <span className="text-copy-14 text-[var(--ds-gray-1000)] font-medium">Provider</span>
            <span className="text-copy-13 text-[var(--ds-gray-700)]">Choose where your data is stored securely.</span>
          </div>
          <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg flex-wrap mt-2 sm:mt-0">
            {providers.map(p => (
              <Button
                key={p.id}
                size="sm"
                variant={syncState.provider === p.id ? 'secondary' : 'ghost'}
                onClick={() => onSyncStateChange({ ...syncState, provider: p.id })}
                className={syncState.provider === p.id ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
              >
                {p.icon} {p.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
