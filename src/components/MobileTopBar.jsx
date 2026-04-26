import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonHeader, IonToolbar, IonSearchbar, IonButtons, IonButton, IonIcon, IonMenuButton, IonPopover, IonList, IonItem, IonLabel, IonContent } from '@ionic/react';
import { addOutline, musicalNotesOutline, listOutline } from 'ionicons/icons';
import SongCard from './SongCard';

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);

const PlusIcon = ({ open = false }) => (
  <svg
    width="26" height="26" viewBox="0 0 24 24"
    fill="none" stroke="white" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MobileTopBar({
  view,
  songs,
  setlists,
  onOpenDrawer,
  onSelectSong,
  onSelectSetlist,
  onNewSong,
  onNewSetlist,
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const inputRef = useRef(null);
  const addRef = useRef(null);
  const containerRef = useRef(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return { songs: [], setlists: [] };
    const matchedSongs = songs
      .filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        (s.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
    const matchedSetlists = setlists
      .filter(sl =>
        (sl.name || '').toLowerCase().includes(q) ||
        (sl.service || '').toLowerCase().includes(q) ||
        (sl.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .slice(0, 4);
    return { songs: matchedSongs, setlists: matchedSetlists };
  }, [q, songs, setlists]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
      if (addRef.current && !addRef.current.contains(e.target)) {
        setAddOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setFocused(false);
        setAddOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const placeholder =
    view === 'setlists' ? 'Search setlists & songs…'
    : view === 'library' ? 'Search songs & setlists…'
    : 'Search my library…';

  const [popoverEvent, setPopoverEvent] = useState(null);

  const handlePlusClick = (e) => {
    if (view === 'library') {
      onNewSong?.();
    } else if (view === 'setlists') {
      onNewSetlist?.();
    } else {
      e.persist();
      setPopoverEvent(e);
      setAddOpen(true);
    }
  };

  const closeSearch = () => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
  };

  const showResults = focused && q.length > 0;
  const hasAnyResults = results.songs.length > 0 || results.setlists.length > 0;

  return (
    <IonHeader
      ref={containerRef}
      className="sm:hidden ion-no-border"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <IonToolbar style={{ '--background': 'var(--ds-background-200)', '--padding-top': '4px', '--padding-bottom': '4px' }}>
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} onClick={onOpenDrawer} />
        </IonButtons>

        <IonSearchbar
          value={query}
          onIonInput={e => setQuery(e.detail.value)}
          onIonFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="custom-searchbar px-0 pb-0 pt-0"
          style={{ '--background': 'var(--ds-background-100)', '--color': 'var(--text-1)', '--icon-color': 'var(--text-2)', '--clear-button-color': 'var(--text-2)', '--border-radius': '12px' }}
        />

        <IonButtons slot="end" className="mr-2 relative" ref={addRef}>
          <IonButton
            id="mobile-add-btn"
            onClick={handlePlusClick}
            className="w-10 h-10 m-0"
            style={{ '--background': 'var(--color-brand)', '--border-radius': '12px', '--color': 'white' }}
          >
            <IonIcon icon={addOutline} />
          </IonButton>
          <IonPopover isOpen={addOpen} onDidDismiss={() => setAddOpen(false)} event={popoverEvent}>
            <IonContent className="ion-padding-0">
              <IonList lines="full" className="m-0 bg-transparent">
                <IonItem button onClick={() => { setAddOpen(false); onNewSong?.(); }} detail={false}>
                  <IonIcon icon={musicalNotesOutline} slot="start" />
                  <IonLabel>New Song</IonLabel>
                </IonItem>
                <IonItem button onClick={() => { setAddOpen(false); onNewSetlist?.(); }} detail={false} lines="none">
                  <IonIcon icon={listOutline} slot="start" />
                  <IonLabel>New Setlist</IonLabel>
                </IonItem>
              </IonList>
            </IonContent>
          </IonPopover>
        </IonButtons>
      </IonToolbar>

      {/* Search results dropdown */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full bg-[var(--ds-background-100)] border-b border-[var(--ds-gray-200)] shadow-lg max-h-[70vh] overflow-y-auto z-50">
          {hasAnyResults ? (
            <div className="divide-y divide-[var(--border-1)]">
              {results.songs.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-label-12 uppercase tracking-wider text-[var(--text-2)]">
                    Songs
                  </div>
                  <div className="divide-y divide-[var(--border-1)]">
                    {results.songs.map(song => (
                      <div key={song.id} className="active:bg-[var(--bg-2)]">
                        <SongCard
                          song={song}
                          variant="row"
                          onClick={() => {
                            closeSearch();
                            onSelectSong?.(song);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.setlists.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-label-12 uppercase tracking-wider text-[var(--text-2)]">
                    Setlists
                  </div>
                  <div className="divide-y divide-[var(--border-1)]">
                    {results.setlists.map(sl => (
                      <button
                        key={sl.id}
                        onClick={() => {
                          closeSearch();
                          onSelectSetlist?.(sl);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-transparent border-none cursor-pointer active:bg-[var(--bg-2)] text-left"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-copy-14 text-[var(--text-1)] truncate">
                            {sl.name || 'Untitled setlist'}
                          </span>
                          <span className="text-label-12 text-[var(--text-2)] truncate">
                            {(sl.items?.length || 0)} songs{sl.date ? ` • ${formatDateShort(sl.date)}` : ''}
                          </span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-2)] shrink-0">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-copy-14 text-[var(--text-2)]">
              No matches for "<span className="text-[var(--text-1)]">{query}</span>".
            </div>
          )}
        </div>
      )}
    </IonHeader>
  );
}
