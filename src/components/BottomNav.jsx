import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const SetlistsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const SongsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const tabs = [
  { id: 'home', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'setlists', label: 'Setlists', Icon: SetlistsIcon },
  { id: 'library', label: 'Songs', Icon: SongsIcon },
];

export default function BottomNav({ activeView, onNavigate }) {
  const containerRef = useRef(null);
  const tileRefs = useRef({});
  const [pill, setPill] = useState(null); // { left, width }
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState([]); // [{ id, left, width }]
  const nextRippleId = useRef(0);

  const activeId = tabs.some(t => t.id === activeView) ? activeView : 'home';

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = tileRefs.current[activeId];
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPill({ left: eRect.left - cRect.left, width: eRect.width });
  }, [activeId]);

  useLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const el = tileRefs.current[activeId];
      if (!container || !el) return;
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setPill({ left: eRect.left - cRect.left, width: eRect.width });
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeId]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleTileClick = (id) => {
    const el = tileRefs.current[id];
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      const rid = nextRippleId.current++;
      setRipples(rs => [...rs, { id: rid, left: eRect.left - cRect.left, width: eRect.width }]);
      setTimeout(() => setRipples(rs => rs.filter(r => r.id !== rid)), 500);
    }
    onNavigate(id);
  };

  return (
    <>
      {/* Fade above the nav so scrolling content doesn't hard-cut at the edge */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 z-[99] h-10 pointer-events-none sm:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
          background: 'linear-gradient(to top, #14161e 0%, rgba(20, 22, 30, 0) 100%)',
        }}
      />
      <nav
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden"
        style={{
          background: '#14161e',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '10px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        }}
      >
        <div className="relative grid grid-cols-3 gap-2">
          {/* Sliding active indicator pill */}
          {pill && (
            <span
              aria-hidden="true"
              className="absolute top-0 h-14 rounded-xl pointer-events-none"
              style={{
                left: 0,
                width: pill.width,
                transform: `translateX(${pill.left}px)`,
                background: 'var(--ds-gray-100)',
                transition: mounted ? 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1), width 320ms cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
              }}
            />
          )}

          {/* Ripples (rendered in container so they pick up each tile's bounds) */}
          {ripples.map(r => (
            <span
              key={r.id}
              aria-hidden="true"
              className="absolute top-0 h-14 pointer-events-none overflow-hidden"
              style={{ left: r.left, width: r.width }}
            >
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'var(--color-brand)',
                  animation: 'nav-tile-ripple 450ms ease-out forwards',
                  transformOrigin: 'center',
                }}
              />
            </span>
          ))}

          {tabs.map(({ id, label, Icon }) => {
            const active = id === activeId;
            return (
              <button
                key={id}
                ref={el => { tileRefs.current[id] = el; }}
                onClick={() => handleTileClick(id)}
                className={`relative z-[1] flex flex-col items-center justify-center gap-1 h-14 rounded-xl border-none cursor-pointer p-0 transition-[color,transform] duration-200 active:scale-[0.97] bg-transparent ${
                  active ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon />
                <span className={`text-[11px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes nav-tile-ripple {
          0% { transform: scale(0.3); opacity: 0.35; }
          60% { opacity: 0.2; }
          100% { transform: scale(1.05); opacity: 0; }
        }
      `}</style>
    </>
  );
}
