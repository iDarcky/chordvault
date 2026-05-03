import { useMemo, useState, useEffect } from 'react';
import { transposeKey } from '../music';
import { Chip } from './ui/Chip';
import { IconButton } from './ui/IconButton';
import ExportSetlistDialog from './ExportSetlistDialog';
import { useTeam } from '../auth/useTeam';
import RosterPanel from './setlist/RosterPanel';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExportZip, onExportPdfOverview, onExportPdfFull, onPlay, onPractice, onDelete, isFullscreen = false, onToggleFullscreen }) {
  const { team, isAdmin } = useTeam();
  const [showRoster, setShowRoster] = useState(false);
  const getSong = (id, title) => {
    let s = songs.find(s => s.id === id);
    if (!s && title) s = songs.find(s => s.title === title);
    return s;
  };
  const [collapsed, setCollapsed] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  // Per-row song number (skips breaks). Lookup table keeps the running
  // counter out of the render body so React Compiler stays happy.
  const songNumberByIdx = useMemo(() => {
    const acc = { n: 0 };
    return setlist.items.map(item => {
      if (item.type === 'break') return null;
      acc.n += 1;
      return acc.n;
    });
  }, [setlist.items]);

  const dateStr = new Date(setlist.date + 'T' + (setlist.time || '12:00') + ':00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeStr = setlist.time ? new Date(`1970-01-01T${setlist.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }) : '';

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this setlist? This cannot be undone.')) {
      onDelete?.();
    }
  };

  const actionIcons = (
    <div className="flex items-center gap-1 shrink-0">
      {onPractice && (
        <IconButton variant="ghost" size="sm" onClick={onPractice} aria-label="Practice setlist" title="Practice setlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </IconButton>
      )}
      <IconButton variant="ghost" size="sm" onClick={onPlay} aria-label="Play setlist" title="Play setlist" className="text-[var(--color-brand)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M8 5v14l11-7z" />
        </svg>
      </IconButton>
      {team && (
        <IconButton
          variant={showRoster ? 'active' : 'ghost'}
          size="sm"
          onClick={() => setShowRoster(true)}
          aria-label="View roster"
          title="View roster"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m6-2.13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-12 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
          </svg>
        </IconButton>
      )}
      <IconButton variant="ghost" size="sm" onClick={() => setExportOpen(true)} aria-label="Export setlist">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </IconButton>
      <IconButton variant="ghost" size="sm" onClick={onEdit} aria-label="Edit setlist">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </IconButton>
      {onToggleFullscreen && (
        <IconButton
          variant={isFullscreen ? 'active' : 'ghost'}
          size="sm"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand to full screen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Expand to full screen'}
        >
          {isFullscreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v4a1 1 0 0 1-1 1H3" />
              <path d="M21 8h-4a1 1 0 0 1-1-1V3" />
              <path d="M3 16h4a1 1 0 0 1 1 1v4" />
              <path d="M16 21v-4a1 1 0 0 1 1-1h4" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          )}
        </IconButton>
      )}
      <IconButton variant="ghost" size="sm" onClick={onBack} aria-label="Close">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--notion-bg)] pb-8">
      {/* ── Sticky header (Desktop/Mobile) ── */}
      <div className="sticky top-0 z-10 bg-[var(--notion-bg)]/80 backdrop-blur-md border-b border-[var(--notion-border)] lg:border-transparent transition-all duration-200">
        <div className="a4-container lg:max-w-4xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-2.5 min-h-[56px]">
            {/* Desktop Back Button / Mobile Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <IconButton variant="ghost" size="sm" onClick={onBack} aria-label="Back" className="lg:hidden">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </IconButton>

              {/* Only show title in header when collapsed on mobile, or always on desktop but subtle */}
              <span className={`text-label-13 font-medium text-[var(--notion-text-main)] truncate ${!collapsed && 'lg:hidden opacity-0'}`}>
                {setlist.name || 'Untitled Setlist'}
              </span>
            </div>
            {actionIcons}
          </div>
        </div>
      </div>

      {/* ── Document Header ── */}
      <div className="a4-container lg:max-w-4xl mx-auto px-4 lg:px-8 pt-8 pb-6">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--notion-text-main)] m-0 mb-4">
          {setlist.name || 'Untitled Setlist'}
        </h1>

        <div className="flex flex-col gap-2">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-[var(--notion-text-dim)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="text-copy-14">
              {dateStr} {timeStr && `at ${timeStr}`}
            </span>
          </div>

          {/* Location */}
          {setlist.location && (
            <div className="flex items-center gap-2 text-[var(--notion-text-dim)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="text-copy-14">{setlist.location}</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2">
            {(setlist.tags?.length ? setlist.tags : setlist.service ? [setlist.service] : []).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-label-12 bg-[var(--notion-bg-hover)] text-[var(--notion-text-main)] border border-[var(--notion-border)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Set order ── */}
      <div className="a4-container lg:max-w-4xl mx-auto px-4 lg:px-8 pb-4">
        <div className="flex flex-col border border-[var(--notion-border)] rounded-md overflow-hidden bg-[var(--notion-bg)]">
          {setlist.items.map((item, idx) => {
            /* ── Break banner ── separator-style, no song number ── */
            if (item.type === 'break') {
              return (
                <div key={idx} className="flex flex-col items-stretch py-2 bg-[var(--notion-bg-hover)] border-b border-[var(--notion-border)] last:border-b-0" aria-label="Break">
                  <div className="flex items-center gap-3 px-4 lg:px-6">
                    <span className="text-label-12 uppercase tracking-wider font-semibold text-[var(--notion-text-main)]">
                      {item.label || 'Break'}
                    </span>
                    {(item.duration || 0) > 0 && (
                      <span className="text-copy-13 text-[var(--notion-text-dim)] tabular-nums">
                        {item.duration} min
                      </span>
                    )}
                  </div>
                  {item.note && (
                    <p className="text-copy-13 text-[var(--notion-text-dim)] italic m-0 mt-1 px-4 lg:px-6">
                      {item.note}
                    </p>
                  )}
                </div>
              );
            }

            /* ── Song row ── */
            const song = getSong(item.songId, item.songTitle);
            const num = String(songNumberByIdx[idx] || 0).padStart(2, '0');

            if (!song) {
              return (
                <div key={idx} className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-[var(--notion-border)] last:border-b-0 opacity-60">
                  <span className="text-copy-14 text-[var(--notion-text-dim)] tabular-nums w-6 shrink-0">
                    {num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-copy-14 text-[var(--notion-text-dim)] m-0 truncate italic">
                      Missing Song (Waiting for sync)
                    </p>
                  </div>
                </div>
              );
            }

            const displayKey = transposeKey(song.key, item.transpose);

            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 lg:px-6 py-3 border-b border-[var(--notion-border)] last:border-b-0 hover:bg-[var(--notion-bg-hover)] transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-copy-14 text-[var(--notion-text-dim)] tabular-nums w-6 shrink-0">
                    {num}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <p className="text-copy-14 font-medium text-[var(--notion-text-main)] m-0 truncate">
                      {song.title}
                    </p>
                    {song.artist && (
                      <p className="text-copy-13 text-[var(--notion-text-dim)] m-0 truncate">
                        {song.artist}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0 ml-9 sm:ml-0">
                  <span className="flex items-center gap-1.5 text-copy-14 text-[var(--notion-text-main)] w-16 sm:w-20">
                    {(item.capo || 0) > 0 && (
                      <span className="text-[10px] text-[var(--notion-text-dim)] uppercase font-medium bg-[var(--notion-bg-hover)] px-1 rounded border border-[var(--notion-border)]">
                        C{item.capo}
                      </span>
                    )}
                    {displayKey}
                  </span>
                  <span className="text-copy-14 text-[var(--notion-text-dim)] tabular-nums w-16 sm:w-20 text-left sm:text-right">
                    {song.tempo ? `${song.tempo} BPM` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Delete ── */}
      {onDelete && (
        <div className="a4-container flex justify-center pt-2 pb-8">
          <span
            role="button"
            tabIndex={0}
            onClick={handleDelete}
            onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            className="text-label-11 text-[var(--ds-error-600)] hover:text-[var(--ds-error-900)] uppercase tracking-widest cursor-pointer transition-colors select-none"
          >
            Delete Setlist
          </span>
        </div>
      )}

      {/* FABs removed (moved to top header) */}

      {exportOpen && (
        <ExportSetlistDialog
          onClose={() => setExportOpen(false)}
          onExportZip={() => { setExportOpen(false); onExportZip?.(); }}
          onExportPdfOverview={() => { setExportOpen(false); onExportPdfOverview?.(); }}
          onExportPdfFull={() => { setExportOpen(false); onExportPdfFull?.(); }}
        />
      )}

      {showRoster && team && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[2px]" onClick={() => setShowRoster(false)}>
          <div className="h-full" onClick={e => e.stopPropagation()}>
            <RosterPanel
              setlistId={setlist.id}
              setlistDate={setlist.date}
              onClose={() => setShowRoster(false)}
              readOnly={!isAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
}
