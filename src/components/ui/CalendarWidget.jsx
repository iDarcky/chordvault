import React, { useRef } from 'react';
import { Button } from './Button';

// Cycle: none → available → unavailable → none
function nextAvailability(curr) {
  if (curr === 'available') return 'unavailable';
  if (curr === 'unavailable') return null;
  return 'available';
}

function toLocalDateStr(date) {
  // Use local date (not UTC) so "today" matches the user's calendar.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarWidget({
  setlists,
  schedules,
  userId,
  onDateClick,
  availability,
  onToggleAvailability,
}) {
  const scrollRef = useRef(null);

  // Generate an array of dates starting from 2 days ago up to 12 days ahead
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = -2; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const myAvailabilityFor = (date) => {
    if (!availability || !userId) return null;
    const dateStr = toLocalDateStr(date);
    const row = availability.find(a => a.user_id === userId && a.date === dateStr);
    return row?.status || null;
  };

  // Helper to get schedules and setlists for a specific date
  const getDataForDate = (date) => {
    const dateStr = toLocalDateStr(date);

    // Find all setlists on this date
    const daySetlists = setlists.filter(sl => sl.date === dateStr);

    // Find any user schedules tied to these setlists
    const daySchedules = schedules?.filter(s =>
      s.user_id === userId && daySetlists.some(sl => sl.id === s.setlist_id)
    ) || [];

    return { daySetlists, daySchedules };
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const canMarkAvailability = typeof onToggleAvailability === 'function';

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-20 font-bold text-[var(--modes-text)]">
          My Schedule
        </h2>
        <div className="flex items-center gap-1 hidden sm:flex">
          <Button variant="ghost" size="sm" onClick={scrollLeft} className="px-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={scrollRight} className="px-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-start gap-2 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((date, i) => {
            const { daySetlists, daySchedules } = getDataForDate(date);
            const isToday = date.getTime() === today.getTime();
            const myAvail = myAvailabilityFor(date);
            const hasSetlist = daySetlists.length > 0;

            // Determine status (setlist takes priority over availability)
            let status = 'none'; // none, pending, available, playing, avail-yes, avail-no
            let roles = [];

            if (hasSetlist) {
              if (daySchedules.length > 0) {
                const s = daySchedules[0];
                if (s.availability === 'pending') status = 'pending';
                else if (s.availability === 'available') status = 'playing';
                else if (s.availability === 'maybe') status = 'maybe';
                if (s.role) roles.push(s.role);
              } else {
                // Setlist exists but user isn't explicitly scheduled.
                // In personal mode, they are "playing" their own setlists.
                // In team mode, maybe they aren't on the roster.
                // We'll mark as 'playing' if no schedules are passed in at all (personal mode)
                status = schedules ? 'none' : 'playing';
              }
            } else if (myAvail === 'available') {
              status = 'avail-yes';
            } else if (myAvail === 'unavailable') {
              status = 'avail-no';
            }

            // Visual styling based on status
            let bgClass = "bg-[var(--ds-background-200)] border-[var(--ds-gray-300)]";
            let textClass = "text-[var(--ds-gray-900)]";
            let dotClass = "bg-transparent";

            if (isToday && status === 'none') {
              bgClass = "bg-[var(--ds-background-100)] border-[var(--color-brand)]";
            } else if (status === 'playing') {
              bgClass = "bg-[var(--color-brand-soft)] border-[var(--color-brand)]";
              textClass = "text-[var(--color-brand)] font-bold";
              dotClass = "bg-[var(--color-brand)]";
            } else if (status === 'pending') {
              bgClass = "bg-[var(--ds-orange-100)] border-[var(--ds-orange-300)]";
              textClass = "text-[var(--ds-orange-900)]";
              dotClass = "bg-[var(--ds-orange-600)]";
            } else if (status === 'avail-yes') {
              bgClass = "bg-[var(--ds-green-100)] border-[var(--ds-green-300)]";
              textClass = "text-[var(--ds-green-900)]";
              dotClass = "bg-[var(--ds-green-600)]";
            } else if (status === 'avail-no') {
              bgClass = "bg-[var(--ds-background-200)] border-[var(--ds-gray-400)] opacity-60";
              textClass = "text-[var(--ds-gray-700)] line-through";
              dotClass = "bg-[var(--ds-gray-500)]";
            }

            const handleClick = () => {
              if (hasSetlist) {
                if (onDateClick) onDateClick(daySetlists[0]);
              } else if (canMarkAvailability) {
                onToggleAvailability(date, nextAvailability(myAvail));
              }
            };

            const interactive = hasSetlist || canMarkAvailability;

            return (
              <button
                key={i}
                onClick={handleClick}
                className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-transform duration-150 active:scale-95 ${bgClass} ${interactive ? 'cursor-pointer hover:shadow-md' : 'cursor-default opacity-80'}`}
                title={
                  hasSetlist
                    ? 'Open setlist'
                    : canMarkAvailability
                      ? (myAvail === 'available' ? 'Mark unavailable' : myAvail === 'unavailable' ? 'Clear availability' : 'Mark available')
                      : ''
                }
              >
                <span className={`text-label-12 font-semibold uppercase tracking-wider mb-1 ${status !== 'none' ? textClass : 'text-[var(--ds-gray-500)]'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-heading-20 m-0 leading-none ${textClass}`}>
                  {date.getDate()}
                </span>
                <div className="h-2 mt-1">
                  {status !== 'none' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll gradients */}
        <div className="absolute top-0 bottom-4 left-0 w-8 bg-gradient-to-r from-[var(--ds-background-100)] to-transparent pointer-events-none sm:hidden"></div>
        <div className="absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-[var(--ds-background-100)] to-transparent pointer-events-none"></div>
      </div>

      {canMarkAvailability && (
        <div className="flex items-center gap-3 text-label-11 text-[var(--ds-gray-600)] flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-brand)]"></span>
            Playing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--ds-green-600)]"></span>
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--ds-orange-600)]"></span>
            Pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--ds-gray-500)]"></span>
            Unavailable
          </span>
          <span className="opacity-70 ml-auto">Tap an empty day to mark availability</span>
        </div>
      )}
    </div>
  );
}
