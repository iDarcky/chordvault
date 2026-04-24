export default function FloatingNavPill({ current, total, nextLabel, onPrev, onNext, hasPrev, hasNext }) {
  return (
    <div
      className="fixed left-0 right-0 flex justify-center z-[100] pointer-events-none"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="pointer-events-auto flex items-stretch h-12 rounded-full border border-[var(--ds-gray-400)] shadow-lg overflow-hidden select-none"
        style={{
          background: 'var(--ds-background-200)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          minWidth: '200px',
          maxWidth: '90vw',
        }}
      >
        {/* Prev button — left half */}
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous song"
          style={{ minWidth: 52, border: 'none', background: 'transparent', cursor: hasPrev ? 'pointer' : 'default' }}
          className="flex items-center justify-center px-4 transition-colors duration-150 disabled:opacity-25 hover:bg-[var(--ds-gray-100)] active:bg-[var(--ds-gray-200)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--ds-gray-900)]">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <div className="w-px shrink-0 bg-[var(--ds-gray-400)]" />

        {/* Center: position + optional next label */}
        <div className="flex items-center gap-2 px-4 min-w-0">
          <span className="text-label-13 font-semibold text-[var(--ds-gray-1000)] tabular-nums whitespace-nowrap">
            {current} / {total}
          </span>
          {nextLabel && hasNext && (
            <span className="hidden sm:block text-label-12 text-[var(--ds-gray-600)] truncate max-w-[160px] whitespace-nowrap">
              · Next: {nextLabel}
            </span>
          )}
        </div>

        <div className="w-px shrink-0 bg-[var(--ds-gray-400)]" />

        {/* Next button — right half */}
        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next song"
          style={{ minWidth: 52, border: 'none', background: 'transparent', cursor: hasNext ? 'pointer' : 'default' }}
          className="flex items-center justify-center px-4 transition-colors duration-150 disabled:opacity-25 hover:bg-[var(--ds-gray-100)] active:bg-[var(--ds-gray-200)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--ds-gray-900)]">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
