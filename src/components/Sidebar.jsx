import React, { useState } from 'react';
import NotificationTray from './NotificationTray';
import { cn } from '../lib/utils';

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

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ds-gray-700)]">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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


const TeamNavIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function Sidebar({ 
  activeView, 
  onNavigate, 
  hasUnreadNotifications, 
  notifications, 
  onMarkRead, 
  onNotificationAction, 
  displayName = 'Guest', 
  plan = 'Free', 
  activeLibrary, 
  setActiveLibrary, 
  team,
  syncState,
  isOnline,
  sidebarOpen,
  setSidebarOpen
}) {
  const [trayOpen, setTrayOpen] = useState(false);

  const planLower = plan.toLowerCase();
  const hasTeamPlan = planLower === 'team' || planLower === 'church';

  // Determine sync label and color
  let syncLabel = 'Local Only';
  let syncColor = 'text-[var(--ds-gray-500)]';
  let isSyncing = false;

  if (syncState?.state === 'syncing') {
    syncLabel = 'Syncing...';
    syncColor = 'text-[var(--ds-blue-700)]';
    isSyncing = true;
  } else if (syncState?.state === 'error') {
    syncLabel = 'Sync Error';
    syncColor = 'text-[var(--ds-red-600)]';
  } else if (syncState?.provider || activeLibrary !== 'personal') {
    syncLabel = 'Cloud Synced';
    syncColor = 'text-[var(--ds-green-700)]';
  }

  const tabs = [
    { id: 'home', label: 'Dashboard', Icon: HomeIcon },
    { id: 'setlists', label: 'Setlists', Icon: SetlistsIcon },
    { id: 'library', label: 'Library', Icon: LibraryIcon },
    ...(hasTeamPlan ? [{ id: 'team', label: 'Team', Icon: TeamNavIcon }] : []),
  ];

  // If sidebar is closed, render nothing on desktop (handled by a hamburger menu in Layout to open it)
  if (!sidebarOpen) {
    return null;
  }

  // Adjusted nav button class for Notion-style sidebar where everything is left-aligned and compact
  const notionNavButtonClass = (active) =>
    `group flex items-center justify-start gap-3 h-9 w-full px-3 mx-0 rounded-md cursor-pointer transition-colors duration-200 border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--notion-border)] ${
      active
        ? 'bg-[var(--notion-bg-hover)] text-[var(--notion-text-main)] font-semibold'
        : 'bg-transparent text-[var(--notion-text-dim)] hover:bg-[var(--notion-bg-hover)] hover:text-[var(--notion-text-main)]'
    }`;

  return (
    <>
      <aside
        className="h-full hidden sm:flex flex-col transition-all duration-300 w-[240px] py-4 px-2 overflow-hidden overscroll-contain border-r"
        style={{
          backgroundColor: 'var(--notion-bg)',
          borderColor: 'var(--notion-border)'
        }}
      >
        {/* Header Actions: Collapse Sidebar & Profile */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button
            onClick={() => onNavigate('account')}
            aria-label="Account"
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer rounded-md focus:outline-none hover:bg-[var(--notion-bg-hover)] py-1 px-1 transition-colors text-left flex-1 min-w-0"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--ds-gray-300)] flex items-center justify-center shrink-0">
              <UserIcon />
            </div>
            <div className="overflow-hidden">
              <p className="text-label-13 font-semibold text-[var(--notion-text-main)] truncate m-0 leading-tight">{displayName}</p>
            </div>
          </button>

          {/* Close Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md text-[var(--notion-text-dim)] hover:bg-[var(--notion-bg-hover)] hover:text-[var(--notion-text-main)] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Library Switcher */}
        {team && (
          <div className="mb-6 flex flex-col gap-1">
            <span className="text-[11px] text-[var(--notion-text-dim)] font-semibold uppercase tracking-wider px-3 mb-1">
              Workspace
            </span>
            <button
              onClick={() => setActiveLibrary('personal')}
              className={notionNavButtonClass(activeLibrary === 'personal')}
              title="Personal Library"
            >
              <UserIcon />
              <span className="text-label-13 truncate">Personal</span>
            </button>

            <button
              onClick={() => setActiveLibrary(team.id)}
              className={notionNavButtonClass(activeLibrary === team.id)}
              title={team.name}
            >
              <TeamNavIcon />
              <span className="text-label-13 truncate">{team.name}</span>
            </button>
          </div>
        )}

        {/* Nav Menu */}
        <nav className="flex-1 min-h-0 flex flex-col gap-1 overflow-hidden">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={notionNavButtonClass(active)}
              >
                <div className="scale-90 opacity-70 group-hover:opacity-100 transition-opacity"><Icon /></div>
                <span className="text-label-13 text-left">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Secondary Nav */}
        <div className="mt-auto flex flex-col gap-1 pt-4 mb-4 shrink-0">
          <button
            onClick={() => setTrayOpen(true)}
            className={notionNavButtonClass(false)}
          >
            <span className="relative flex items-center justify-center scale-90 opacity-70 group-hover:opacity-100 transition-opacity">
              <BellIcon />
              {hasUnreadNotifications && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--ds-red-600)]" />
              )}
            </span>
            <span className="text-label-13 text-left">Notifications</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={notionNavButtonClass(activeView === 'settings')}
          >
            <div className="scale-90 opacity-70 group-hover:opacity-100 transition-opacity"><SettingsIcon /></div>
            <span className="text-label-13 text-left">Settings</span>
          </button>
        </div>

        {/* Sync Status */}
        <div className="flex flex-col gap-2 text-[11px] uppercase font-semibold shrink-0 px-3">
          <div className={cn("flex items-center gap-2", syncColor)}>
            <div className={cn("shrink-0", isSyncing && "animate-spin")}>
              <CloudIcon />
            </div>
            <span>{syncLabel}</span>
          </div>
          <div className={cn("flex items-center gap-2", isOnline ? "text-[var(--ds-green-700)]" : "text-[var(--ds-amber-600)]")}>
            <div className="shrink-0">
              <CheckCircleIcon />
            </div>
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </aside>

      {/* Notification Tray Modal */}
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
