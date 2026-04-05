import React from 'react';

export default function SetlistCard({ setlist, onPlay, onView }) {
  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).toUpperCase();

  const songCount = setlist.items?.length || 0;

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 16,
        background: 'var(--ds-background-100)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'background 0.2s',
      }}
      className="hover:bg-[var(--ds-gray-200)] group"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="text-label-12-mono" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {dateStr}
        </div>
        {setlist.service && (
          <div className="text-label-12" style={{
            padding: '2px 8px',
            borderRadius: 6,
            background: 'var(--ds-gray-100)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {setlist.service}
          </div>
        )}
      </div>

      <div onClick={onView} style={{ cursor: 'pointer' }}>
        <h3 className="text-heading-24" style={{ color: 'var(--text-bright)', margin: 0 }}>
          {setlist.name || 'Untitled Setlist'}
        </h3>
        <p className="text-copy-14" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          {songCount} song{songCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="text-button-14 hover:opacity-90 active:scale-[0.98]"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--color-brand)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'opacity 0.2s',
          }}
        >
          Play Live
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="text-button-14 hover:bg-[var(--ds-gray-100)] active:scale-[0.98]"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--ds-background-100)',
            color: 'var(--text-bright)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
