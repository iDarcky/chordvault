import React, { useEffect, useRef } from 'react';
import { IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButton, IonButtons } from '@ionic/react';
import { settingsOutline, helpCircleOutline, notificationsOutline, downloadOutline, closeOutline } from 'ionicons/icons';
import {
  StageGreeting,
  AccountSummary,
  PlanLabel,
  UpgradePill,
  SignInButton,
  CreateAccountButton,
  StatCards,
} from './account/AccountPanel';

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

const InstallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function MobileDrawer({
  open,
  openKey = 0,
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
  onUpgrade,
  onSignIn,
  onCreateAccount,
  onSignOut,
  canInstall = false,
  isIOS = false,
  isStandalone = false,
  onInstall,
}) {
  const menuRef = useRef(null);

  const displayName = userName?.trim() || 'Guest';
  const displayEmail = email || 'guest@setlists.md';

  // Sync Ionic menu state with external `open` prop
  useEffect(() => {
    if (menuRef.current) {
      if (open) {
        menuRef.current.open();
      } else {
        menuRef.current.close();
      }
    }
  }, [open]);

  // Prevent background scrolling when Ionic menu opens
  useEffect(() => {
    const handleMenuOpen = () => { document.body.style.overflow = 'hidden'; };
    const handleMenuClose = () => {
      document.body.style.overflow = '';
      if (open) onClose?.(); // notify parent if closed by swipe/backdrop
    };

    document.addEventListener('ionMenuDidOpen', handleMenuOpen);
    document.addEventListener('ionMenuDidClose', handleMenuClose);

    return () => {
      document.removeEventListener('ionMenuDidOpen', handleMenuOpen);
      document.removeEventListener('ionMenuDidClose', handleMenuClose);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <IonMenu
      ref={menuRef}
      contentId="main-content"
      menuId="mobile-menu"
      type="overlay"
      className="sm:hidden"
      style={{
        '--background': 'var(--ds-background-100)',
        '--width': '85vw',
        '--max-width': '360px'
      }}
    >
      <IonHeader className="ion-no-border pt-[env(safe-area-inset-top,0px)] bg-transparent">
        <IonToolbar className="bg-transparent" style={{ '--background': 'transparent' }}>
          <IonButtons slot="end" className="mr-2">
            {onOpenNotifications && (
              <IonButton onClick={onOpenNotifications} className="relative">
                <IonIcon icon={notificationsOutline} className="text-[var(--ds-gray-700)]" />
                {hasUnreadNotifications && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-brand)]"
                  />
                )}
              </IonButton>
            )}
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} className="text-[var(--ds-gray-700)]" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': 'transparent' }} className="px-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">

        {/* Greeting */}
        <div className="px-5 pt-4 pb-6">
          <StageGreeting key={openKey} displayName={displayName} tone="drawer" />
        </div>

        {/* Account */}
        {isSignedIn && (
          <div className="px-5">
            <AccountSummary
              isSignedIn={isSignedIn}
              displayEmail={displayEmail}
              onSignOut={onSignOut}
              tone="drawer"
            />
          </div>
        )}

        {/* Plan */}
        <div className={`px-5 ${isSignedIn ? 'mt-5' : ''}`}>
          <PlanLabel plan={plan} tone="drawer" />
        </div>

        {/* Sign-in CTA stack for guests — big brand Sign in, smaller
            Create account below. Upgrade pill sits above for context. */}
        <div className="px-5 mt-6 flex flex-col gap-2">
          <UpgradePill onUpgrade={onUpgrade} />
          {!isSignedIn && (
            <>
              <SignInButton onSignIn={onSignIn} />
              <CreateAccountButton onCreateAccount={onCreateAccount} />
            </>
          )}
        </div>

        {/* Library stats */}
        <div className="px-5 mt-6">
          <StatCards songCount={songCount} setlistCount={setlistCount} tone="drawer" />
        </div>

        {/* Nav rows */}
        <div className="px-5 mt-6 flex flex-col gap-2 mb-8">
          <IonItem button onClick={onOpenSettings} lines="none" className="rounded-xl" style={{ '--background': 'transparent' }}>
            <IonIcon icon={settingsOutline} slot="start" className="text-[var(--ds-gray-700)]" />
            <IonLabel className="text-[var(--ds-gray-1000)] font-medium">Preferences</IonLabel>
          </IonItem>

          <IonItem button onClick={onOpenHelp} lines="none" className="rounded-xl" style={{ '--background': 'transparent' }}>
            <IonIcon icon={helpCircleOutline} slot="start" className="text-[var(--ds-gray-700)]" />
            <IonLabel className="text-[var(--ds-gray-1000)] font-medium">Help</IonLabel>
          </IonItem>

          {!isStandalone && (canInstall || isIOS) && onInstall && (
            <IonItem button onClick={onInstall} lines="none" className="rounded-xl" style={{ '--background': 'transparent' }}>
              <IonIcon icon={downloadOutline} slot="start" className="text-[var(--ds-gray-700)]" />
              <IonLabel className="text-[var(--ds-gray-1000)] font-medium">{isIOS ? 'Add to Home Screen' : 'Install app'}</IonLabel>
            </IonItem>
          )}
        </div>

        {/* Footer — surfaces the signed-in account name as the primary brand
            label; falls back to the app name for guests. */}
        <div className="mt-auto px-5 pt-8 text-center pb-4">
          <div className="text-label-11 text-[var(--drawer-text-faint)]">
            {isSignedIn ? displayName : 'Setlists MD'}
          </div>
        </div>
      </IonContent>
    </IonMenu>
  );
}
