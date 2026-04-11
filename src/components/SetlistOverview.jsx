import { useMemo, useState, useEffect } from 'react';
import { transposeKey } from '../music';
import { Chip } from './ui/Chip';
import { IconButton } from './ui/IconButton';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay, onDelete }) {
  const getSong = (id) => songs.find(s => s.id === id);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { songCount, breakCount } = useMemo(() => {
    let sc = 0, bc = 0;
    for (const it of setlist.items) {
      if (it.type === 'break') bc++;
      else sc++;
    }
    return { songCount: sc, breakCount: bc };
  }, [setlist, songs]);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this setlist? This cannot be undone.')) {
      onDelete?.();
    }
  };

  const actionIcons = (
    <div className="flex items-center gap-1 shrink-0">
      <IconButton variant="ghost" size="sm" onClick={onExport} aria-label="Export setlist">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </IconButton>
      <IconButton variant="ghost" size="sm" onClick={onEdit} aria-label="Edit setlist">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </IconButton>
      <IconButton variant="ghost" size="sm" onClick={onBack} aria-label="Close">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );

  return (
    <div className="min-h-screen material-page pb-32">

      {/* ── Sticky header ── */}
      <div className="material-header transition-all duration-200">
        <div className="max-w-3xl mx-auto px-5">

          {collapsed ? (
            /* ── Collapsed: title + actions in one row ── */
            <div className="flex items-center justify-between gap-3 py-2.5">
              <h1 className="text-heading-16 text-foreground m-0 truncate flex-1 min-w-0">
                {setlist.name || 'Untitled Setlist'}
              </h1>
              {actionIcons}
            </div>
          ) : (
            /* ── Expanded: date row, title, chip row ── */
            <>
              {/* Row 1: date + actions */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <span className="text-label-11 text-default-600 uppercase tracking-widest">
                  {dateStr}
                </span>
                {actionIcons}
              </div>

              {/* Row 2: setlist name */}
              <h1 className="text-heading-24 text-foreground m-0 mb-2 truncate">
                {setlist.name || 'Untitled Setlist'}
              </h1>

              {/* Row 3: tags + song count */}
              <div className="flex items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(setlist.tags?.length ? setlist.tags : setlist.service ? [setlist.service] : []).map((tag, i) => (
                    <Chip key={i} variant="success">{tag}</Chip>
                  ))}
                </div>
                <span className="text-label-12 text-default-600 shrink-0">
                  {songCount} song{songCount !== 1 ? 's' : ''}
                  {breakCount > 0 && ` + ${breakCount} break${breakCount !== 1 ? 's' : ''}`}
                </span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Set order ── */}
      <div className="max-w-3xl mx-auto px-5 pt-6 pb-4">
        <p className="section-title m-0 mb-4">Set Order</p>

        <div className="flex flex-col gap-2">
          {setlist.items.map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');

            /* ── Break row ── */
            if (item.type === 'break') {
              return (
                <div
                  key={idx}
                  className="material-card flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-label-14 text-default-400 tabular-nums w-7 text-center shrink-0">
                    {num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-copy-14 text-foreground italic">
                      {item.label || 'Break'}
                    </span>
                    {item.note && (
                      <p className="text-copy-12 text-default-600 m-0 mt-0.5 truncate">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {(item.duration || 0) > 0 && (
                    <span className="text-label-12 text-default-500 shrink-0">
                      {item.duration} min
                    </span>
                  )}
                </div>
              );
            }

            /* ── Song row ── */
            const song = getSong(item.songId);
            if (!song) return null;
            const displayKey = transposeKey(song.key, item.transpose);

            return (
              <div
                key={idx}
                className="material-card flex items-center gap-3 px-4 py-3"
              >
                <span className="text-label-14 text-default-400 tabular-nums w-7 text-center shrink-0">
                  {num}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-heading-14 text-foreground m-0 truncate">
                    {song.title}
                  </p>
                  <p className="text-copy-12 text-default-600 m-0 mt-0.5 truncate">
                    {song.artist}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-0.5">
                  <span className="text-label-14 text-foreground font-semibold flex items-center gap-1.5">
                    {(item.capo || 0) > 0 && (
                      <span className="text-label-10 text-default-500 uppercase font-normal">
                        Capo {item.capo}
                      </span>
                    )}
                    {displayKey}
                  </span>
                  <span className="text-label-11 text-default-500 tabular-nums">
                    {song.tempo} BPM
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Delete ── */}
      {onDelete && (
        <div className="max-w-3xl mx-auto flex justify-center pt-2 pb-8">
          <span
            role="button"
            tabIndex={0}
            onClick={handleDelete}
            onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            className="text-label-11 text-danger-500 hover:text-danger-800 uppercase tracking-widest cursor-pointer transition-colors select-none"
          >
            Delete Setlist
          </span>
        </div>
      )}

      {/* ── FAB play button ── */}
      <div
        className="fixed right-6 z-[150]"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={onPlay}
          onKeyDown={(e) => e.key === 'Enter' && onPlay?.()}
          className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all duration-150 active:scale-95"
          aria-label="Play setlist"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
