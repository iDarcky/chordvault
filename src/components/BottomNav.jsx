import React from 'react';

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
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] grid grid-cols-3 gap-2 sm:hidden"
      style={{
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '10px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center justify-center gap-1 h-14 rounded-xl border-none cursor-pointer p-0 transition-colors duration-200 ${
              active
                ? 'text-[var(--color-brand)] bg-[var(--ds-gray-100)]'
                : 'text-[var(--ds-gray-700)] bg-transparent active:bg-[var(--ds-gray-100)]'
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
    </nav>
  );
}
