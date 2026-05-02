import { useEffect } from 'react';

const STATUS_OPTIONS = [
  {
    value: 'available',
    label: 'Available',
    description: "I can serve on this date.",
    bg: 'var(--ds-green-100)',
    border: 'var(--ds-green-300)',
    fg: 'var(--ds-green-800)',
    activeBg: 'var(--ds-green-600)',
    activeFg: '#fff',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    description: 'Tentative — confirm closer to the date.',
    bg: 'var(--ds-orange-100)',
    border: 'var(--ds-orange-300)',
    fg: 'var(--ds-orange-800)',
    activeBg: 'var(--ds-orange-600)',
    activeFg: '#fff',
  },
  {
    value: 'unavailable',
    label: 'Unavailable',
    description: "I can't serve on this date.",
    bg: 'var(--ds-red-100)',
    border: 'var(--ds-red-300)',
    fg: 'var(--ds-red-800)',
    activeBg: 'var(--ds-red-700)',
    activeFg: '#fff',
  },
];

/**
 * Modal for picking the user's availability on a single date.
 * Replaces the previous "tap to cycle" interaction with explicit choices.
 */
export default function DateStatusModal({
  date,
  currentStatus,
  availableCount,
  totalMembers,
  onSetStatus,
  onClear,
  onClose,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!date) return null;

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const longDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[var(--ds-background-100)] border border-[var(--ds-gray-300)] rounded-2xl shadow-xl flex flex-col gap-4 p-5"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={`Set availability for ${longDate}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-label-12 uppercase tracking-wider text-[var(--ds-gray-600)]">
              {weekday}
            </span>
            <span className="text-heading-20 font-bold text-[var(--ds-gray-1000)]">
              {longDate}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border-none text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)] cursor-pointer"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-copy-13 text-[var(--ds-gray-700)] m-0">
          Mark your availability so the worship leader can plan around it.
        </p>

        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map(opt => {
            const active = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSetStatus(opt.value)}
                className="text-left rounded-xl border p-3 cursor-pointer transition-colors"
                style={{
                  background: active ? opt.activeBg : opt.bg,
                  borderColor: active ? opt.activeBg : opt.border,
                  color: active ? opt.activeFg : opt.fg,
                }}
              >
                <div className="text-copy-14 font-bold">
                  {opt.label} {active && '✓'}
                </div>
                <div className="text-copy-12 mt-0.5 opacity-80">
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>

        {currentStatus && (
          <button
            type="button"
            onClick={onClear}
            className="text-copy-13 text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-1000)] underline underline-offset-2 self-start cursor-pointer bg-transparent border-none p-0"
          >
            Clear my status for this date
          </button>
        )}

        {typeof availableCount === 'number' && totalMembers > 0 && (
          <div className="text-label-12 text-[var(--ds-gray-600)] flex items-center gap-2 pt-2 border-t border-[var(--ds-gray-200)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {availableCount} of {totalMembers} teammates available
          </div>
        )}
      </div>
    </div>
  );
}
