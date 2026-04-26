import React from 'react';
import { IonSplitPane, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { homeOutline, listOutline, musicalNotesOutline, settingsOutline, notificationsOutline, helpCircleOutline } from 'ionicons/icons';

export default function DesktopLayout({ children, activeView, onNavigate, isFullscreen = false, hasUnreadNotifications, onNotificationClick, displayName, plan }) {
  if (isFullscreen) {
    return (
      <div id="main-content-wrapper" className="w-full h-[100dvh]">
        <div id="main-content" className="ion-page w-full h-[100dvh] overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  const navigate = (id) => {
    onNavigate(id);
  };

  return (
    <IonSplitPane contentId="main-content" when="sm" className="w-full h-[100dvh]">
      {/* Side Menu (Visible on lg/xl screens) */}
      <IonMenu contentId="main-content" menuId="desktop-menu" type="overlay" className="hidden sm:block max-w-[280px]">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'var(--ds-background-100)' }}>
            <IonTitle className="font-serif">Setlists MD</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': 'var(--ds-background-100)' }}>
          <div className="flex flex-col h-full py-4">
            <IonList className="bg-transparent" lines="none">
              <IonItem button onClick={() => navigate('home')} className={activeView === 'home' ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}>
                <IonIcon icon={homeOutline} slot="start" />
                <IonLabel>Dashboard</IonLabel>
              </IonItem>
              <IonItem button onClick={() => navigate('setlists')} className={activeView === 'setlists' ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}>
                <IonIcon icon={listOutline} slot="start" />
                <IonLabel>Setlists</IonLabel>
              </IonItem>
              <IonItem button onClick={() => navigate('library')} className={activeView === 'library' ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}>
                <IonIcon icon={musicalNotesOutline} slot="start" />
                <IonLabel>Songs</IonLabel>
              </IonItem>
            </IonList>

            <div className="mt-auto">
              <IonList className="bg-transparent" lines="none">
                <IonItem button onClick={onNotificationClick} className="text-[var(--ds-gray-700)]">
                  <IonIcon icon={notificationsOutline} slot="start" />
                  <IonLabel>Notifications</IonLabel>
                  {hasUnreadNotifications && <IonBadge color="danger" slot="end">New</IonBadge>}
                </IonItem>
                <IonItem button onClick={() => navigate('settings')} className={activeView === 'settings' ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}>
                  <IonIcon icon={settingsOutline} slot="start" />
                  <IonLabel>Settings</IonLabel>
                </IonItem>
                <IonItem button onClick={() => navigate('help')} className={activeView === 'help' ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}>
                  <IonIcon icon={helpCircleOutline} slot="start" />
                  <IonLabel>Help</IonLabel>
                </IonItem>
              </IonList>

              <div className="px-4 py-6 text-center border-t border-[var(--ds-gray-200)] mt-2 mx-4">
                <div className="text-sm font-medium text-[var(--ds-gray-1000)] truncate">
                  {displayName || 'Guest User'}
                </div>
                {plan && (
                  <div className="text-xs text-[var(--ds-gray-600)] mt-1 uppercase tracking-wider">
                    {plan}
                  </div>
                )}
              </div>
            </div>
          </div>
        </IonContent>
      </IonMenu>

      {/* Main Content Area */}
      <div id="main-content" className="ion-page h-[100dvh] overflow-y-auto overscroll-contain bg-[var(--ds-background-100)] w-full relative z-0">
        {children}
        <div
          className="shrink-0 sm:hidden"
          style={{ height: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
          aria-hidden="true"
        />
      </div>
    </IonSplitPane>
  );
}
