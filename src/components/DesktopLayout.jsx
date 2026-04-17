import React from 'react';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

export default function DesktopLayout({ children, activeView, onNavigate, isFullscreen = false }) {
  const cols = isFullscreen
    ? 'grid-cols-1'
    : 'grid-cols-1 sm:grid-cols-[80px_1fr] xl:grid-cols-[280px_1fr]';
  return (
    <div className={cn('w-full h-[100dvh] grid overflow-hidden', cols)}>
      {!isFullscreen && <Sidebar activeView={activeView} onNavigate={onNavigate} />}
      {/*
        The main content area owns its scroll; the sidebar stays rigidly pinned
        to the viewport so iPad can't drag it. h-[100dvh] tracks iOS Safari's
        dynamic viewport so the layout never extends under the address bar.
      */}
      <main className="h-[100dvh] overflow-y-auto overscroll-contain bg-[var(--ds-background-100)] flex flex-col relative w-full">
        {children}
      </main>
    </div>
  );
}
