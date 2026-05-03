import React, { useRef, useEffect, useState } from 'react';
import TeamBanner from './TeamBanner';
import TopHeader from './TopHeader';
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
  isOnline,
  onSignOut
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

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden">
      {!isFullscreen && (
        <TopHeader
          activeView={activeView}
          onNavigate={onNavigate}
          hasUnreadNotifications={hasUnreadNotifications}
          notifications={notifications}
          onMarkRead={onMarkRead}
          onNotificationAction={onNotificationAction}
          displayName={displayName}
          activeLibrary={activeLibrary}
          setActiveLibrary={setActiveLibrary}
          team={team}
          onSignOut={onSignOut}
        />
      )}
      <div className="flex-1 w-full flex overflow-hidden">
        {/*
          The main content area owns its scroll.
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
