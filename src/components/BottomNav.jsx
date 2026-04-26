import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { homeOutline, listOutline, musicalNotesOutline } from 'ionicons/icons';

const tabs = [
  { id: 'home', label: 'Dashboard', icon: homeOutline },
  { id: 'setlists', label: 'Setlists', icon: listOutline },
  { id: 'library', label: 'Songs', icon: musicalNotesOutline },
];

export default function BottomNav({ activeView, onNavigate }) {
  const activeId = tabs.some(t => t.id === activeView) ? activeView : 'home';

  const handleTileClick = (id) => {
    onNavigate(id);
  };

  return (
    <>
      {/* Fade above the nav so scrolling content doesn't hard-cut at the edge */}
      <div
        aria-hidden="true"
        className="fixed left-0 right-0 z-[99] h-10 pointer-events-none sm:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 56px)',
          background: 'linear-gradient(to top, var(--ds-background-100) 0%, transparent 100%)',
        }}
      />
      <IonTabBar
        slot="bottom"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-[100]"
        style={{
          '--background': 'var(--ds-background-100)',
          '--border': 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {tabs.map(({ id, label, icon }) => {
          const active = id === activeId;
          return (
            <IonTabButton
              key={id}
              tab={id}
              onClick={() => handleTileClick(id)}
              className={active ? 'text-[var(--color-brand)]' : 'text-[var(--ds-gray-700)]'}
              style={{
                 '--color-selected': 'var(--color-brand)',
                 '--color': 'var(--ds-gray-700)',
                 backgroundColor: 'transparent'
              }}
            >
              <IonIcon icon={icon} />
              <IonLabel className={active ? 'font-semibold' : 'font-medium'}>{label}</IonLabel>
            </IonTabButton>
          );
        })}
      </IonTabBar>
    </>
  );
}
