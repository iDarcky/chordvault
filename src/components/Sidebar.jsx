import React from 'react';

const HomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const SetlistsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BellIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function Sidebar({ activeView, onNavigate }) {
  const tabs = [
    { id: 'home', label: 'Dashboard', Icon: HomeIcon },
    { id: 'setlists', label: 'Setlists', Icon: SetlistsIcon },
    { id: 'library', label: 'Library', Icon: LibraryIcon },
  ];

  return (
    <aside className="h-[100dvh] hidden sm:flex flex-col bg-[var(--ds-background-200)] transition-all duration-300 w-[80px] xl:w-[280px] py-6 px-4 overflow-hidden overscroll-contain">
      {/* Guest Profile Dummy */}
      <div className="flex items-center gap-3 mb-8 xl:px-2 shrink-0">
        <div className="min-w-[36px] h-[36px] rounded-full bg-[var(--ds-gray-300)] overflow-hidden shrink-0">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--ds-gray-600)] mt-2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="hidden xl:block overflow-hidden">
          <p className="text-label-14 font-semibold text-[var(--ds-gray-1000)] truncate">Guest</p>
          <p className="text-label-12 text-[var(--ds-teal-800)] font-medium truncate uppercase tracking-widest text-[10px]">FREE TIER</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-4 h-[44px] rounded-lg cursor-pointer transition-colors duration-200 px-3 w-full border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-teal-600)]
                ${active
                  ? 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)]'
                  : 'bg-transparent text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
                }`}
            >
              <div className="flex-none flex items-center justify-center w-[28px]">
                <Icon />
              </div>
              <span className={`hidden xl:block text-label-14 text-left ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Secondary Nav */}
      <div className="mt-auto flex flex-col gap-2 pt-6 mb-6 border-t border-[var(--ds-gray-200)] xl:-mx-2 xl:px-2 shrink-0">
        <button
          className="flex items-center gap-4 h-[44px] rounded-lg cursor-pointer transition-colors duration-200 px-3 w-full border-none bg-transparent text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)] relative"
        >
          <div className="flex-none flex items-center justify-center w-[28px]">
            <BellIcon />
            <span className="absolute left-[26px] top-[14px] w-2 h-2 rounded-full bg-[var(--ds-red-600)]" />
          </div>
          <span className="hidden xl:block text-label-14 text-left font-medium">Notifications</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-4 h-[44px] rounded-lg cursor-pointer transition-colors duration-200 px-3 w-full border-none
            ${activeView === 'settings'
              ? 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-900)]'
              : 'bg-transparent text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)]'
            }`}
        >
          <div className="flex-none flex items-center justify-center w-[28px]">
            <SettingsIcon />
          </div>
          <span className={`hidden xl:block text-label-14 text-left ${activeView === 'settings' ? 'font-bold' : 'font-medium'}`}>Settings</span>
        </button>
      </div>

      {/* Sync Status Dummy */}
      <div className="hidden xl:flex flex-col gap-2 text-[var(--ds-gray-500)] text-label-12 uppercase font-semibold shrink-0">
        <div className="flex items-center gap-2">
          <CloudIcon />
          <span>Cloud Synced</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircleIcon />
          <span>Offline Ready</span>
        </div>
      </div>
    </aside>
  );
}
