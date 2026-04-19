import React from 'react';
import GlobalInputBar from './GlobalInputBar';

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

export default function MobileTopBar({
  onOpenDrawer,
  onNewSong,
  onNewSetlist,
  setGlobalSearchQuery,
}) {
  return (
    <div
      className="shrink-0 z-[110] sm:hidden bg-[var(--ds-background-100)] border-b border-[var(--ds-gray-200)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          onClick={onOpenDrawer}
          aria-label="Open menu"
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-1)] cursor-pointer active:bg-[rgba(0,0,0,0.05)] transition-colors border-none bg-transparent"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <HamburgerIcon />
        </button>

        <GlobalInputBar
          onSearch={(q) => setGlobalSearchQuery && setGlobalSearchQuery(q)}
          onNewSong={onNewSong}
          onNewSetlist={onNewSetlist}
        />
      </div>
    </div>
  );
}
