import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { getSyncState, setSyncToken, clearSyncState } from '../../sync/tokens';

export default function SyncSettings({ syncState, onSyncStateChange, onSyncNow }) {
  const [showConfig, setShowConfig] = useState(false);

  const handleDisconnect = async () => {
    if (confirm('Disconnect from cloud storage? Local data will remain.')) {
      await clearSyncState();
      onSyncStateChange({ state: 'idle', lastSync: null, provider: null });
    }
  };

  const syncStatus = (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        syncState.state === 'syncing' ? "bg-brand animate-pulse" : "bg-green-500"
      )} />
      <span className="text-xs font-semibold capitalize">{syncState.state}</span>
    </div>
  );

  return (
    <Card className="p-4 space-y-4">
      {syncState.provider ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accents-1)] flex items-center justify-center border border-[var(--geist-border)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <div>
                <div className="text-sm font-semibold capitalize">{syncState.provider}</div>
                <div className="text-[10px] text-[var(--accents-4)]">Connected</div>
              </div>
            </div>
            {syncStatus}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onSyncNow} disabled={syncState.state === 'syncing'}>
              Sync Now
            </Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>

          <div className="text-[9px] font-mono text-center text-[var(--accents-4)] uppercase tracking-widest">
            Last Sync: {syncState.lastSync ? new Date(syncState.lastSync).toLocaleString() : 'Never'}
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-[var(--accents-1)] flex items-center justify-center border border-[var(--geist-border)] mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c.6 0 1.1-.4 1.3-.9l1.9-6.6c.2-.7-.3-1.5-1-1.5h-15c-.7 0-1.2.8-1 1.5l1.9 6.6c.2.5.7.9 1.3.9h11z"></path><path d="M18 10V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6"></path></svg>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold">No Cloud Storage Connected</div>
            <div className="text-xs text-[var(--accents-5)] px-4">Keep your songs and setlists in sync across all your devices.</div>
          </div>
          <Button
            variant="brand"
            className="w-full"
            onClick={() => alert('Cloud Sync integration requires additional API keys. Check docs/monetization.md for the strategy.')}
          >
            Connect Cloud Storage
          </Button>
        </div>
      )}
    </Card>
  );
}
