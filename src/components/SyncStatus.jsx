import { cn } from '../lib/utils';

export default function SyncStatus({ syncState, onClick }) {
  const { state, lastSync, provider } = syncState;

  const dotColors = {
    idle: 'bg-accents-3',
    syncing: 'bg-geist-link animate-pulse',
    synced: 'bg-geist-success',
    error: 'bg-geist-error',
  };

  const labels = {
    idle: provider ? 'Idle' : 'Offline',
    syncing: 'Syncing...',
    synced: lastSync ? formatRelative(lastSync) : 'Synced',
    error: 'Sync error',
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accents-2 bg-accents-1 hover:bg-accents-2 transition-colors cursor-pointer border-none"
    >
      <span className={cn("w-2 h-2 rounded-full", dotColors[state] || dotColors.idle)} />
      <span className="text-[10px] font-bold text-accents-5 uppercase tracking-wider font-mono">
        {labels[state] || 'Offline'}
      </span>
    </button>
  );
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
