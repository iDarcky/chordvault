import React, { useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../lib/useMediaQuery';

export default function DesktopLayout({ children, activeView, onNavigate, isFullscreen = false, hasUnreadNotifications, onNotificationClick, notifications, onMarkRead, onNotificationAction, drawerOpen = false }) {
  const mainRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 639.98px)');
  const applyDrawerTransform = drawerOpen && isMobile;

  // Scroll to top whenever the active view changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeView]);

  useEffect(() => {
    // Expose a global hook so nested components can trigger global nav if necessary
    window.appNavigation = onNavigate;
    return () => {
      delete window.appNavigation;
    };
  }, [onNavigate]);

  return (
    <div className="w-full h-[100dvh] bg-[var(--ds-background-100)] overflow-hidden flex flex-col relative">
      {/* We MUST keep the Sidebar for mobile Drawer functionality! We just hide it visually on Desktop (sm:hidden) */}
      {!isFullscreen && (
        <div className="sm:hidden absolute inset-0 z-0 pointer-events-none">
          <div className="pointer-events-auto h-full">
            <Sidebar activeView={activeView} onNavigate={onNavigate} hasUnreadNotifications={hasUnreadNotifications} onNotificationClick={onNotificationClick} notifications={notifications} onMarkRead={onMarkRead} onNotificationAction={onNotificationAction} />
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="hidden sm:flex items-center justify-between px-10 py-6 bg-[var(--ds-background-100)] z-[110]">
          <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => onNavigate('dashboard')}>
            <span className="text-heading-20 font-serif font-bold text-[var(--text-1)] tracking-tight">
              Setlists<span className="text-[var(--color-brand)] ml-0.5">MD</span>
            </span>
          </div>

          <div className="flex items-center gap-8 text-label-14 font-semibold text-[var(--text-2)]">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`bg-transparent border-none cursor-pointer transition-colors ${activeView === 'dashboard' ? 'text-[var(--text-1)]' : 'hover:text-[var(--text-1)]'}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('library')}
              className={`bg-transparent border-none cursor-pointer transition-colors ${activeView === 'library' ? 'text-[var(--text-1)]' : 'hover:text-[var(--text-1)]'}`}
            >
              Library
            </button>
            <button
              onClick={() => onNavigate('setlists')}
              className={`bg-transparent border-none cursor-pointer transition-colors ${activeView === 'setlists' ? 'text-[var(--text-1)]' : 'hover:text-[var(--text-1)]'}`}
            >
              Shows
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`bg-transparent border-none cursor-pointer transition-colors ${activeView === 'settings' ? 'text-[var(--text-1)]' : 'hover:text-[var(--text-1)]'}`}
            >
              Settings
            </button>
            {hasUnreadNotifications && (
               <div className="w-2 h-2 bg-[var(--color-brand)] rounded-full -ml-6 mb-3" />
            )}
          </div>
        </div>
      )}

      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overscroll-contain bg-[var(--ds-background-100)] relative w-full transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: applyDrawerTransform ? 'translateX(72%) scale(0.92)' : undefined,
          transformOrigin: 'left center',
          borderRadius: applyDrawerTransform ? '24px' : undefined,
          boxShadow: applyDrawerTransform ? '0 30px 60px rgba(0,0,0,0.45)' : undefined,
        }}
      >
        {children}
        {/* Mobile Spacer */}
        <div
          className="shrink-0 sm:hidden"
          style={{ height: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
          aria-hidden="true"
        />
      </main>
    </div>
  );
}
