import React from 'react';

export default function SongCard({ song, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        borderRadius: 16,
        background: 'var(--ds-background-100)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'background 0.2s',
      }}
      className="hover:bg-[var(--ds-gray-200)]"
    >
      <h3 className="text-heading-18" style={{ color: 'var(--text-bright)', margin: 0 }}>
        {song.title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="text-label-12" style={{ color: 'var(--chord)', fontWeight: 600 }}>
          {song.key || 'C'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>•</span>
        <span className="text-label-12" style={{ color: 'var(--text-muted)' }}>
          {song.bpm ? `${song.bpm} BPM` : 'No Tempo'}
        </span>
      </div>
      {song.artist && (
        <p className="text-copy-14" style={{ color: 'var(--text-muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.artist}
        </p>
      )}
    </div>
  );
}
