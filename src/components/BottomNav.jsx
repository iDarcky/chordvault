import React, { useRef, useState } from 'react';

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

function NavTile({ id, label, Icon, active, onClick }) {
  const [ripples, setRipples] = useState([]);
  const nextId = useRef(0);

  const handleClick = () => {
    const rid = nextId.current++;
    setRipples(rs => [...rs, rid]);
    setTimeout(() => setRipples(rs => rs.filter(r => r !== rid)), 500);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden flex flex-col items-center justify-center gap-1 h-14 rounded-xl border-none cursor-pointer p-0 transition-[background-color,transform] duration-200 active:scale-[0.97] ${
        active
          ? 'text-[var(--color-brand)] bg-[var(--ds-gray-100)]'
          : 'text-[var(--ds-gray-700)] bg-transparent'
      }`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {ripples.map(r => (
        <span
          key={r}
          aria-hidden="true"
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'var(--color-brand)',
            animation: 'nav-tile-ripple 450ms ease-out forwards',
          }}
        />
      ))}
      <Icon />
      <span className={`relative text-[11px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  );
}

export default function BottomNav({ activeView, onNavigate }) {
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
        className="fixed bottom-0 left-0 right-0 z-[100] grid grid-cols-3 gap-2 sm:hidden"
        style={{
          background: '#14161e',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '10px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        }}
      >
        {tabs.map(({ id, label, Icon }) => (
          <NavTile
            key={id}
            id={id}
            label={label}
            Icon={Icon}
            active={activeView === id}
            onClick={() => onNavigate(id)}
          />
        ))}
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
