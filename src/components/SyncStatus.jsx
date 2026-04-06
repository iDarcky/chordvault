import React from 'react';
import { Chip } from "@heroui/react";

export default function SyncStatus({ syncState, onClick }) {
  const { state, lastSync, provider } = syncState;

  const colorMap = {
    idle: provider ? 'default' : 'default',
    syncing: 'primary',
    synced: 'success',
    error: 'danger',
  };

  const labels = {
    idle: provider ? 'Cloud Connected' : 'Offline Mode',
    syncing: 'Syncing...',
    synced: lastSync ? `Last synced ${formatRelative(lastSync)}` : 'Synced',
    error: 'Sync error',
  };

  return (
    <Chip
      as="button"
      onClick={onClick}
      color={colorMap[state] || 'default'}
      variant="flat"
      size="sm"
      className="cursor-pointer font-bold uppercase text-[9px] tracking-widest h-6"
      startContent={
        <span className={`w-1.5 h-1.5 rounded-full ml-1 ${state === 'syncing' ? 'animate-pulse' : ''}`}
              style={{ background: 'currentColor' }} />
      }
    >
      {labels[state] || 'Offline'}
    </Chip>
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
