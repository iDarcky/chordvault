export default function SyncStatus({ syncState, onClick }) {
  const { state, lastSync, provider } = syncState;

  const dotColors = {
    idle: 'var(--text-dim)',
    syncing: 'var(--accent)',
    synced: 'var(--success)',
    error: 'var(--danger)',
  };

  const labels = {
    idle: provider ? 'IDLE' : 'OFFLINE',
    syncing: 'SYNCING',
    synced: lastSync ? formatRelative(lastSync).toUpperCase() : 'SYNCED',
    error: 'ERROR',
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 30,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        minHeight: 'auto'
      }}
    >
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: dotColors[state] || dotColors.idle,
        boxShadow: state === 'syncing' ? '0 0 8px var(--accent)' : 'none'
      }} />
      {labels[state] || 'OFFLINE'}
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
