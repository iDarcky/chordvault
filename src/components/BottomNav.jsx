import React from 'react';

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
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

const tabs = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'library', label: 'Library', Icon: LibraryIcon },
  { id: 'setlists', label: 'Setlists', Icon: SetlistsIcon },
];

function ProfileAvatar({ initial, active }) {
  return (
    <span className="relative inline-flex">
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center text-label-12 font-bold transition-colors duration-200 ${
          active
            ? 'bg-[var(--color-brand)] text-white'
            : 'bg-[var(--ds-gray-300)] text-[var(--ds-gray-700)]'
        }`}
      >
        {initial}
      </span>
    </span>
  );
}

export default function BottomNav({ activeView, onNavigate, userName }) {
  const initial = (userName || 'G').charAt(0).toUpperCase();
  const profileActive = activeView === 'settings';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex z-[100] bg-[var(--ds-background-200)] border-t border-[var(--ds-gray-200)] sm:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = activeView === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-16 bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 ${
              active ? 'text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-600)]'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Icon />
            <span className={`text-label-12 ${active ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        );
      })}

      {/* Profile tab */}
      <button
        onClick={() => onNavigate('settings')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 h-16 bg-transparent border-none cursor-pointer p-0 transition-colors duration-200 ${
          profileActive ? 'text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-600)]'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ProfileAvatar
          initial={initial}
          active={profileActive}
        />
        <span className={`text-label-12 ${profileActive ? 'font-semibold' : 'font-medium'}`}>
          Profile
        </span>
      </button>
    </nav>
  );
}
