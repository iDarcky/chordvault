import React from 'react';
import Sidebar from './Sidebar';

export default function DesktopLayout({ children, activeView, onNavigate }) {
  return (
    <div className="w-full min-h-screen grid grid-cols-1 sm:grid-cols-[80px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      {/* 
        The main content area must handle its own intrinsic scrolling. 
        We separate it so the Sidebar stays rigidly fixed.
      */}
      <main className="h-screen overflow-y-auto bg-[var(--ds-background-100)] flex flex-col relative w-full">
        {children}
      </main>
    </div>
  );
}
