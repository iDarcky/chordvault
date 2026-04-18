import React, { useEffect, useRef, useState } from 'react';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DesignIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.39 5.96L20.5 10l-5.58 2.72L12 19l-2.92-6.28L3.5 10l6.11-2.04L12 2z" />
  </svg>
);

function Row({ icon: Icon, label, onClick, accessory }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.06)] cursor-pointer active:scale-[0.98] transition-all duration-150 text-left"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="text-white/80"><Icon /></span>
      <span className="flex-1 text-copy-15 text-white font-medium">{label}</span>
      {accessory}
    </button>
  );
}

export default function MobileDrawer({
  open,
  onClose,
  userName,
  email,
  plan = 'Free',
  isSignedIn = false,
  songCount = 0,
  setlistCount = 0,
  hasUnreadNotifications = false,
  onOpenSettings,
  onOpenNotifications,
  onOpenHelp,
  onOpenDesign,
  onUpgrade,
  onCreateAccount,
}) {
  const panelRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const onTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setDragX(0);
    setDragging(true);
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startXRef.current;
    // Only allow dragging left (closing)
    if (dx < 0) setDragX(dx);
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const width = panelRef.current?.offsetWidth || 320;
    if (dragX < -width * 0.35) {
      onClose?.();
    } else {
      setDragX(0);
    }
  };

  // Drawer visual shifts with dragX while being dragged
  const translateX = open
    ? (dragging ? `${dragX}px` : '0px')
    : '-100%';

  const displayName = userName?.trim() || 'Guest';
  const displayEmail = email || 'guest@setlists.md';

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[200] sm:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="fixed top-0 left-0 bottom-0 z-[210] sm:hidden w-[85vw] max-w-[360px] flex flex-col overflow-y-auto overscroll-contain text-white"
        style={{
          transform: `translateX(${translateX})`,
          transition: dragging ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          background:
            'radial-gradient(130% 70% at 8% 0%, rgba(92, 138, 128, 0.55) 0%, rgba(22, 18, 32, 0.92) 38%, #0b0910 100%), radial-gradient(90% 60% at 100% 100%, rgba(130, 50, 90, 0.35) 0%, rgba(11, 9, 16, 0) 60%)',
          backgroundBlendMode: 'screen, normal',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}
      >
        {/* Close button */}
        <div className="px-5 flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white/80 hover:bg-white/15 cursor-pointer border-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Greeting */}
        <div className="px-5 pt-4 pb-6">
          <h1 className="text-[34px] leading-[40px] font-serif text-white m-0 tracking-tight">
            You have a beautiful{' '}
            <span className="italic">library</span>,{' '}
            <span className="whitespace-nowrap">{displayName}</span>
          </h1>
        </div>

        {/* Account */}
        <div className="px-5">
          <div className="text-label-11 uppercase tracking-[0.15em] text-white/50 mb-1.5">
            Your Account
          </div>
          <div className="text-copy-16 text-white truncate">{displayEmail}</div>
        </div>

        {/* Plan */}
        <div className="px-5 mt-5">
          <div className="text-label-11 uppercase tracking-[0.15em] text-white/50 mb-1.5">
            Your Plan
          </div>
          <div className="text-copy-16 text-white">{plan} Plan</div>
        </div>

        {/* Upgrade pill */}
        <div className="px-5 mt-6">
          <button
            onClick={onUpgrade}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none relative overflow-hidden"
            style={{
              background:
                'linear-gradient(110deg, #fef3c7 0%, #f5d0fe 35%, #a5f3fc 70%, #fef3c7 100%)',
              backgroundSize: '200% 100%',
              animation: 'drawer-shimmer 4s linear infinite',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className="text-fuchsia-700"><SparkleIcon /></span>
            <span className="text-copy-15 font-semibold bg-gradient-to-r from-amber-700 via-fuchsia-700 to-cyan-700 bg-clip-text text-transparent">
              Upgrade to Pro
            </span>
            <span className="text-fuchsia-700"><SparkleIcon /></span>
          </button>
          {!isSignedIn && (
            <button
              onClick={onCreateAccount}
              className="mt-2 w-full h-11 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-transparent border border-white/15 text-white/85 hover:bg-white/5 active:scale-[0.98] transition-all duration-150"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="text-copy-14 font-medium">Create account</span>
            </button>
          )}
        </div>

        {/* Library stats */}
        <div className="px-5 mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-label-11 uppercase tracking-[0.15em] text-white/50">Songs</div>
            <div className="text-heading-24 text-white font-semibold mt-1">{songCount}</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-label-11 uppercase tracking-[0.15em] text-white/50">Setlists</div>
            <div className="text-heading-24 text-white font-semibold mt-1">{setlistCount}</div>
          </div>
        </div>

        {/* Nav rows */}
        <div className="px-5 mt-6 flex flex-col gap-2">
          <Row icon={SettingsIcon} label="Settings" onClick={onOpenSettings} />
          <Row
            icon={BellIcon}
            label="Notifications"
            onClick={onOpenNotifications}
            accessory={hasUnreadNotifications ? (
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand)]" />
            ) : null}
          />
          <Row icon={HelpIcon} label="Help" onClick={onOpenHelp} />
          <Row icon={DesignIcon} label="Design" onClick={onOpenDesign} />
        </div>

        {/* Footer */}
        <div className="mt-auto px-5 pt-8 text-center">
          <div className="text-label-11 text-white/40">Setlists MD</div>
        </div>
      </aside>

      {/* Local keyframes for shimmer */}
      <style>{`
        @keyframes drawer-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
