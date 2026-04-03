export default function SyncStatus({ syncState, onClick }) {
  const { state, lastSync, provider } = syncState;

  const dotColors = {
    idle: 'var(--text-dim)',
    syncing: 'var(--accent)',
    synced: 'var(--success)',
    error: 'var(--danger)',
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 20,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        cursor: 'pointer',
        fontFamily: 'var(--fb)',
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--text-muted)',
      }}
    >
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: dotColors[state] || dotColors.idle,
        display: 'inline-block',
        animation: state === 'syncing' ? 'pulse 1.5s infinite' : 'none',
      }} />
      {labels[state] || 'Offline'}
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
