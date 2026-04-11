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
        <h2 className="text-label-12 text-default-600 uppercase tracking-wider font-semibold">
          Cloud Sync
        </h2>
        {syncState.provider && (
          <Button variant="ghost" size="sm" onClick={onSyncNow} loading={syncState.state === 'syncing'}>
            Sync Now
          </Button>
        )}
      </div>

      <Card className="flex flex-col p-0 overflow-hidden divide-y divide-default-300 border-default-300">
        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-content1 hover:bg-default-100 transition-colors">
          <div className="flex flex-col">
            <span className="text-copy-14 text-foreground font-medium">Status</span>
            <span className="text-copy-13 text-default-600">
              {syncState.lastSync ? `Last synced: ${new Date(syncState.lastSync).toLocaleString()}` : 'Not connected'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className={`h-2 w-2 rounded-full ${syncState.state === 'syncing' ? 'bg-amber-400 animate-pulse' : syncState.provider ? 'bg-emerald-400' : 'bg-[var(--color-default-300)]'}`} />
            <span className="text-label-12 uppercase font-semibold text-default-800">
              {syncState.state === 'syncing' ? 'Syncing...' : syncState.provider ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-content1 hover:bg-default-100 transition-colors">
          <div className="flex flex-col">
            <span className="text-copy-14 text-foreground font-medium">Provider</span>
            <span className="text-copy-13 text-default-600">Choose where your data is stored securely.</span>
          </div>
          <div className="flex p-1 bg-default-200 rounded-lg flex-wrap mt-2 sm:mt-0">
            {providers.map(p => (
              <Button
                key={p.id}
                size="sm"
                variant={syncState.provider === p.id ? 'secondary' : 'ghost'}
                onClick={() => onSyncStateChange({ ...syncState, provider: p.id })}
                className={syncState.provider === p.id ? "bg-content1 shadow-sm" : "text-default-800"}
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
