import React from 'react';

export default function SongCard({ song, onClick }) {
  return (
    <div
      onClick={() => onClick(song)}
      style={{
        padding: '20px 24px',
        borderRadius: 16,
        background: 'var(--ds-background-100)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      className="hover:bg-[var(--ds-gray-200)] group"
    >
      <h3 className="text-heading-20" style={{ color: 'var(--text-bright)', margin: 0 }}>
        {song.title}
      </h3>
      <div className="text-copy-14" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {song.artist}
        </span>
        <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
        <span style={{ color: 'var(--color-brand-text)', fontWeight: 600, fontFamily: 'var(--fm)' }}>
          {song.key}
        </span>
        {song.tempo && (
          <>
            <span style={{ color: 'var(--text-dim)' }}>&middot;</span>
            <span style={{ whiteSpace: 'nowrap' }}>{song.tempo} BPM</span>
          </>
        )}
      </div>
    </div>
  );
}
