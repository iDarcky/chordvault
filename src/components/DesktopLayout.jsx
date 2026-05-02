import React, { useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import TeamBanner from './TeamBanner';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../lib/useMediaQuery';

export default function DesktopLayout({ 
  children, 
  activeView, 
  onNavigate, 
  isFullscreen = false, 
  hasUnreadNotifications, 
  onNotificationClick, 
  notifications, 
  onMarkRead, 
  onNotificationAction, 
  drawerOpen = false, 
  displayName, 
  plan, 
  hideBottomSpacer = false, 
  activeLibrary, 
  setActiveLibrary, 
  team,
  onChangeWorkspace,
  syncState,
  isOnline
}) {
  const mainRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 639.98px)');
  const applyDrawerTransform = drawerOpen && isMobile;

  // Scroll to top whenever the active view changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeView]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // We are removing the sm/xl grid cols and instead controlling layout with flex and sidebar width
  const showBanner = activeLibrary !== 'personal' && team;

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden">
      <div className="flex-1 w-full flex overflow-hidden">
        {!isFullscreen && (
          <Sidebar 
            activeView={activeView} 
            onNavigate={onNavigate} 
            hasUnreadNotifications={hasUnreadNotifications} 
            onNotificationClick={onNotificationClick} 
            notifications={notifications} 
            onMarkRead={onMarkRead} 
            onNotificationAction={onNotificationAction} 
            displayName={displayName} 
            plan={plan} 
            activeLibrary={activeLibrary} 
            setActiveLibrary={setActiveLibrary} 
            team={team} 
            syncState={syncState}
            isOnline={isOnline}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
        {/*
          The main content area owns its scroll; the sidebar stays rigidly pinned
          to the viewport so iPad can't drag it. h-[100dvh] tracks iOS Safari's
          dynamic viewport so the layout never extends under the address bar.

          When the mobile drawer is open, the main content scales down and
          shifts right — mimicking an iOS-style push drawer.
        */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 h-full overflow-y-auto overscroll-contain bg-[var(--ds-background-100)] relative transition-transform duration-300 ease-out"
          style={{
            transform: applyDrawerTransform ? 'translateX(72%) scale(0.92)' : undefined,
            transformOrigin: 'left center',
            willChange: applyDrawerTransform ? 'transform' : undefined,
            borderRadius: applyDrawerTransform ? '24px' : undefined,
            boxShadow: applyDrawerTransform ? '0 30px 60px rgba(0,0,0,0.45)' : undefined,
          }}
        >
          {/* Hamburger Menu for expanding sidebar when collapsed - Desktop Only */}
          {!isFullscreen && !sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-50 p-2 hidden sm:flex items-center justify-center rounded-md text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Expand sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}

          {children}
          {/* Mobile Spacer: Guaranteed scrollable space to prevent bottom-nav obstruction */}
          {!hideBottomSpacer && (
            <div
              className="shrink-0 sm:hidden"
              style={{ height: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
              aria-hidden="true"
            />
          )}
        </main>
      </div>
    </div>
  );
}
