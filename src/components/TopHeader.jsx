import React, { useState, useRef, useEffect } from 'react';
import NotificationTray from './NotificationTray';
import { cn } from '../lib/utils';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const SetlistsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TeamNavIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function TopHeader({
  activeView,
  onNavigate,
  hasUnreadNotifications,
  notifications,
  onMarkRead,
  onNotificationAction,
  displayName = 'Guest',
  activeLibrary,
  setActiveLibrary,
  team,
  onSignOut
}) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'setlists', label: 'Setlists' },
    { id: 'library', label: 'Library' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 hidden sm:flex w-full h-14 bg-[var(--ds-background-100)]/80 backdrop-blur-md items-center justify-between px-6">
        <div className="flex h-full items-center gap-8">
          {tabs.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={cn(
                  "relative h-full flex items-center justify-center bg-transparent border-none cursor-pointer px-1 outline-none",
                  active ? "text-[var(--ds-gray-1000)]" : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] group"
                )}
              >
                <span className="text-[14px] font-medium transition-colors">
                  {tab.label}
                </span>

                {/* Active Brand Indicator */}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--color-brand)] rounded-t-sm" />
                )}

                {/* Hover Indicator */}
                {!active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--ds-gray-300)] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex h-full items-center gap-6">
          <button
            onClick={() => setTrayOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-full text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)] transition-colors cursor-pointer border-none bg-transparent"
          >
            <BellIcon />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[var(--ds-red-600)] ring-2 ring-[var(--ds-background-100)]" />
            )}
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer border-none bg-transparent",
              activeView === 'settings'
                ? "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-200)]"
                : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)]"
            )}
          >
            <SettingsIcon />
            <span className="text-[14px] font-medium">Settings</span>
          </button>

          <div className="relative flex items-center h-full" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer border-none bg-transparent",
                profileDropdownOpen
                  ? "text-[var(--ds-gray-1000)] bg-[var(--ds-gray-200)]"
                  : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-200)]"
              )}
            >
              <UserIcon />
              <span className="text-[14px] font-medium">Profile</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute top-[calc(100%-8px)] right-0 w-56 bg-[var(--ds-background-200)] border border-[var(--ds-gray-300)] rounded-xl shadow-lg py-2 flex flex-col z-50">
                <div className="px-3 py-2 border-b border-[var(--ds-gray-300)] mb-1">
                  <p className="text-[13px] text-[var(--ds-gray-900)] font-medium truncate">{displayName}</p>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigate('account');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-[14px] text-[var(--ds-gray-800)] hover:text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-300)] border-none bg-transparent cursor-pointer text-left w-full transition-colors"
                >
                  <UserIcon />
                  Account
                </button>

                {team && (
                  <div className="mt-2 mb-1">
                    <p className="px-3 text-[11px] text-[var(--ds-gray-500)] font-semibold uppercase tracking-wider mb-1">Workspace</p>
                    <button
                      onClick={() => {
                        setActiveLibrary('personal');
                        setProfileDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-[14px] w-full text-left border-none cursor-pointer transition-colors",
                        activeLibrary === 'personal'
                          ? "bg-[var(--ds-blue-600)]/10 text-[var(--ds-blue-600)] font-medium"
                          : "text-[var(--ds-gray-800)] hover:text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-300)] bg-transparent"
                      )}
                    >
                      <UserIcon />
                      <span className="truncate">Personal</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveLibrary(team.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-[14px] w-full text-left border-none cursor-pointer transition-colors",
                        activeLibrary === team.id
                          ? "bg-[var(--ds-blue-600)]/10 text-[var(--ds-blue-600)] font-medium"
                          : "text-[var(--ds-gray-800)] hover:text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-300)] bg-transparent"
                      )}
                    >
                      <TeamNavIcon />
                      <span className="truncate">{team.name}</span>
                    </button>
                  </div>
                )}

                <div className="mt-1 border-t border-[var(--ds-gray-300)] pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSignOut?.();
                    }}
                    className="flex items-center px-3 py-1.5 text-[14px] text-[var(--ds-red-600)] hover:bg-[var(--ds-red-600)]/10 border-none bg-transparent cursor-pointer text-left w-full transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationTray
        open={trayOpen}
        onClose={() => setTrayOpen(false)}
        notifications={notifications || []}
        onMarkRead={onMarkRead}
        onAction={(action) => {
          onNotificationAction?.(action);
          setTrayOpen(false);
        }}
      />
    </>
  );
}
