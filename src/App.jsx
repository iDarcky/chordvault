import { Toaster } from "./components/ui/Toaster";
import { toast } from "./components/ui/use-toast";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { parseSongMd, songToMd, generateId } from './parser';
import { loadSongs, saveSongs, loadSetlists, saveSetlists, loadSettings, saveSettings, loadTombstones, saveTombstones, clearAll } from './storage';
import { DEMO_SONGS_MD } from './data/demos';
import { createSyncEngine } from './sync/engine';
import { getSyncState } from './sync/tokens';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Settings from './components/Settings';
import Setlists from './components/Setlists';
import BottomNav from './components/BottomNav';
import DesktopLayout from './components/DesktopLayout';
import { exportSetlistZip, importSetlistZip } from './setlist-io';

function notifyConflicts(conflicts) {
  const titles = conflicts
    .map(c => c.title || (c.kind === 'song' ? 'Untitled song' : 'Untitled setlist'))
    .slice(0, 3)
    .join(', ');
  const extra = conflicts.length > 3 ? ` and ${conflicts.length - 3} more` : '';
  toast({
    title: 'Cloud overwrote local changes',
    description: `Your edits to ${titles}${extra} were replaced with the cloud version.`,
    variant: 'error',
  });
}

// Lazy-loaded: heavy secondary views not needed on initial render
const ChartView = lazy(() => import('./components/ChartView'));
const Editor = lazy(() => import('./components/Editor'));
const SetlistBuilder = lazy(() => import('./components/SetlistBuilder'));
const SetlistPlayer = lazy(() => import('./components/SetlistPlayer'));
const SetlistOverview = lazy(() => import('./components/SetlistOverview'));
const DesignShowcase = lazy(() => import('./components/DesignShowcase'));

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [tombstones, setTombstones] = useState({ songs: [], setlists: [] });
  const [view, setView] = useState('loading');
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState({ state: 'idle', lastSync: null, provider: null });
  const syncEngineRef = useRef(null);
  const historyRef = useRef([]);

  // Initialize sync engine
  if (syncEngineRef.current == null) {
    syncEngineRef.current = createSyncEngine((status) => {
      setSyncState(prev => ({ ...prev, ...status }));
    });
  }

  const triggerSync = useCallback(async () => {
    const state = await getSyncState();
    if (!state?.activeProvider) return;
    const result = await syncEngineRef.current.fullSync(songs, setlists, tombstones);
    if (result.changed) {
      setSongs(result.songs);
      setSetlists(result.setlists);
    }
    if (result.tombstonesChanged) {
      setTombstones(result.tombstones);
    }
    if (result.conflicts?.length > 0) {
      notifyConflicts(result.conflicts);
    }
  }, [songs, setlists, tombstones]);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const savedSongs = await loadSongs();
      if (savedSongs.length > 0) {
        setSongs(savedSongs);
      } else {
        // First time — load demo songs
        const demos = DEMO_SONGS_MD.map(md => ({
          ...parseSongMd(md),
          id: generateId(),
        }));
        setSongs(demos);
        await saveSongs(demos);
      }

      const savedSetlists = await loadSetlists();
      if (savedSetlists) setSetlists(savedSetlists);

      const savedTombstones = await loadTombstones();
      setTombstones(savedTombstones);

      const savedSettings = await loadSettings();
      setSettings(savedSettings);

      // Determine initial view based on onboarding state
      if (savedSongs.length === 0 && !savedSettings.onboardingComplete) {
        setView('welcome');
      } else if (!savedSettings.onboardingComplete) {
        // Existing user who predates onboarding — skip it, go to home
        savedSettings.onboardingComplete = true;
        setSettings(savedSettings);
        await saveSettings(savedSettings);
        setView('home');
      } else {
        setView('home');
      }

      setLoaded(true);

      // Initialize sync state from storage and trigger initial pull
      const storedSync = await getSyncState();
      if (storedSync?.activeProvider) {
        setSyncState({ state: 'idle', lastSync: storedSync.lastSyncTime, provider: storedSync.activeProvider });
        // Pull from cloud on startup — but we need to pass the just-loaded data directly
        // since React state (songs/setlists) hasn't settled yet
        const engine = syncEngineRef.current;
        if (engine) {
          const currentSongs = savedSongs.length > 0 ? savedSongs : [];
          const currentSetlists = savedSetlists || [];
          engine.fullSync(currentSongs, currentSetlists, savedTombstones).then(result => {
            if (result.changed) {
              setSongs(result.songs);
              setSetlists(result.setlists);
            }
            if (result.tombstonesChanged) {
              setTombstones(result.tombstones);
            }
            if (result.conflicts?.length > 0) {
              notifyConflicts(result.conflicts);
            }
          }).catch(err => console.error('Startup sync failed:', err));
        }
      }
    })();
  }, []);

  // Auto-save when data changes + debounced sync push
  useEffect(() => {
    if (loaded) {
      saveSongs(songs);
      syncEngineRef.current?.debouncedPush(songs, setlists, tombstones, setTombstones);
    }
  }, [songs, loaded]);
  useEffect(() => {
    if (loaded) {
      saveSetlists(setlists);
      syncEngineRef.current?.debouncedPush(songs, setlists, tombstones, setTombstones);
    }
  }, [setlists, loaded]);
  useEffect(() => { if (loaded) saveTombstones(tombstones); }, [tombstones, loaded]);
  useEffect(() => { if (loaded && settings) saveSettings(settings); }, [settings, loaded]);

  // Sync on tab focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && loaded) {
        triggerSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loaded, triggerSync]);

  // Apply theme to document
  useEffect(() => {
    if (!settings) return;
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings?.theme]);

  // Navigation with history stack
  const navigate = useCallback((nextView, { song, setlist, replace } = {}) => {
    if (!replace) {
      historyRef.current.push({ view, song: currentSong, setlist: currentSetlist });
      window.history.pushState(null, '');
    }
    if (song !== undefined) setCurrentSong(song);
    if (setlist !== undefined) setCurrentSetlist(setlist);
    setView(nextView);
  }, [view, currentSong, currentSetlist]);

  const goBack = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      setView(prev.view);
      setCurrentSong(prev.song);
      setCurrentSetlist(prev.setlist);
    } else {
      setView('home');
      setCurrentSong(null);
      setCurrentSetlist(null);
    }
  }, []);

  // Browser back button support
  useEffect(() => {
    const handler = (e) => {
      if (historyRef.current.length > 0) {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [goBack]);

  // Navigate between main pages (no history push)
  const goToMainView = (viewName) => {
    setView(viewName);
    setCurrentSong(null);
    setCurrentSetlist(null);
  };

  // Navigation shortcuts
  const goLibrary = () => goToMainView('library');
  const goSetlists = () => goToMainView('setlists');
  const goChart = (song) => navigate('chart', { song });
  const goEditor = (song = null) => navigate('editor', { song });
  const goSetlistBuild = (sl = null) => navigate('setlist-build', { setlist: sl });
  const goSetlistView = (sl) => navigate('setlist-view', { setlist: sl });
  const goSetlistPlay = (sl) => navigate('setlist-play', { setlist: sl });

  // Song CRUD
  const handleSaveSong = (song) => {
    const stamped = { ...song, updatedAt: Date.now() };
    setSongs(prev => {
      const idx = prev.findIndex(s => s.id === song.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = stamped; return n; }
      return [...prev, stamped];
    });
    // After save, pop the stale chart entry that was pushed when entering the editor,
    // then navigate to chart with the updated song (no new history entry)
    historyRef.current.pop();
    navigate('chart', { song, replace: true });
  };

  const handleDeleteSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setTombstones(prev => ({
      ...prev,
      songs: [...prev.songs.filter(t => t.id !== id), { id, deletedAt: Date.now() }],
    }));
    // After delete, go back two steps (skip the chart for the deleted song)
    historyRef.current.pop(); // discard the chart entry
    goBack();
  };

  const handleImportSong = (mdText) => {
    try {
      const song = { ...parseSongMd(mdText), id: generateId(), updatedAt: Date.now() };
      setSongs(prev => [...prev, song]);
    } catch {
      toast({ title: 'Import failed', description: 'Could not parse .md file.', variant: 'error' });
    }
  };

  // Setlist CRUD
  const handleSaveSetlist = (sl) => {
    setSetlists(prev => {
      const idx = prev.findIndex(s => s.id === sl.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = sl; return n; }
      return [...prev, sl];
    });
    goBack();
  };

  const handleDeleteSetlist = (id) => {
    setSetlists(prev => prev.filter(s => s.id !== id));
    setTombstones(prev => ({
      ...prev,
      setlists: [...prev.setlists.filter(t => t.id !== id), { id, deletedAt: Date.now() }],
    }));
    historyRef.current.pop();
    goBack();
  };

  const handleClearAll = async () => {
    await clearAll();
    setSongs([]);
    setSetlists([]);
    setTombstones({ songs: [], setlists: [] });
    historyRef.current = [];
    setView('home');
  };

  // Setlist export/import
  const handleExportSetlist = async (sl) => {
    const blob = await exportSetlistZip(sl, songs);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (sl.name || 'setlist').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase() + '.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSetlist = async (file) => {
    try {
      const { setlist, newSongs } = await importSetlistZip(file, songs);
      if (newSongs.length > 0) {
        setSongs(prev => [...prev, ...newSongs]);
      }
      setSetlists(prev => [...prev, setlist]);
      const description = newSongs.length > 0
        ? `Added ${newSongs.length} new song${newSongs.length > 1 ? 's' : ''} to your library.`
        : 'All songs were already in your library.';
      toast({ title: `Imported "${setlist.name}"`, description });
    } catch {
      toast({ title: 'Import failed', description: 'Could not read setlist zip.', variant: 'error' });
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--ds-background-200)] flex items-center justify-center">
        <div className="text-copy-14 text-[var(--text-2)]">
          Loading ChordVault...
        </div>
      </div>
    );
  }

  const lazyFallback = (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex items-center justify-center">
      <div className="text-copy-14 text-[var(--text-2)]">Loading…</div>
    </div>
  );

  return (
    <Suspense fallback={lazyFallback}>
      <Toaster />
      {view === 'welcome' && (
        <Welcome
          onGetStarted={() => {
            const demos = DEMO_SONGS_MD.map(md => ({
              ...parseSongMd(md),
              id: generateId(),
            }));
            setSongs(demos);
            saveSongs(demos);
            setView('onboarding');
          }}
          onImport={(mdText) => {
            handleImportSong(mdText);
            setSettings(prev => ({ ...prev, onboardingComplete: true }));
            setView('home');
          }}
        />
      )}
      {view === 'onboarding' && (
        <Onboarding
          onComplete={() => {
            setSettings(prev => ({ ...prev, onboardingComplete: true }));
            setView('home');
          }}
        />
      )}
      {!['welcome', 'onboarding'].includes(view) && (
        <DesktopLayout activeView={view === 'setlist-view' ? 'setlists' : view === 'design' ? 'settings' : view} onNavigate={goToMainView}>
          {view === 'home' && (
            <Dashboard
              songs={songs}
              setlists={setlists}
              settings={settings}
              onSelectSong={goChart}
              onNewSong={() => goEditor()}
              onNewSetlist={() => goSetlistBuild()}
              onViewSetlist={goSetlistView}
              onPlaySetlist={goSetlistPlay}
              onGoLibrary={goLibrary}
              onGoSetlists={goSetlists}
            />
          )}
          {view === 'library' && (
            <Library
              songs={songs}
              loaded={loaded}
              onSelectSong={goChart}
              onNewSong={() => goEditor()}
              onImportSong={handleImportSong}
            />
          )}
          {view === 'setlists' && (
            <Setlists
              songs={songs}
              setlists={setlists}
              loaded={loaded}
              onViewSetlist={goSetlistView}
              onPlaySetlist={goSetlistPlay}
              onNewSetlist={() => goSetlistBuild()}
              onImportSetlist={handleImportSetlist}
            />
          )}
          {view === 'chart' && currentSong && (
            <ChartView
              song={currentSong}
              onBack={goBack}
              onEdit={() => goEditor(currentSong)}
              defaultColumns={settings?.defaultColumns}
              defaultFontSize={settings?.defaultFontSize}
              showInlineNotes={settings?.showInlineNotes !== false}
              inlineNoteStyle={settings?.inlineNoteStyle || 'dashes'}
              displayRole={settings?.displayRole || 'leader'}
              duplicateSections={settings?.duplicateSections || 'full'}
              chartLayout={settings?.chartLayout || 'columns'}
            />
          )}
          {view === 'editor' && (
            <Editor
              song={currentSong}
              onSave={handleSaveSong}
              onBack={goBack}
              onDelete={currentSong ? handleDeleteSong : null}
            />
          )}
          {view === 'setlist-view' && currentSetlist && (
            <SetlistOverview
              setlist={currentSetlist}
              songs={songs}
              onBack={goBack}
              onEdit={() => goSetlistBuild(currentSetlist)}
              onExport={() => handleExportSetlist(currentSetlist)}
              onPlay={() => goSetlistPlay(currentSetlist)}
              onDelete={() => handleDeleteSetlist(currentSetlist.id)}
            />
          )}
          {view === 'setlist-build' && (
            <SetlistBuilder
              songs={songs}
              setlist={currentSetlist}
              onSave={handleSaveSetlist}
              onBack={goBack}
              onDelete={currentSetlist ? handleDeleteSetlist : null}
            />
          )}
          {view === 'setlist-play' && currentSetlist && (
            <SetlistPlayer
              setlist={currentSetlist}
              songs={songs}
              onBack={goBack}
              defaultColumns={settings?.defaultColumns}
              defaultFontSize={settings?.defaultFontSize}
              showInlineNotes={settings?.showInlineNotes !== false}
              inlineNoteStyle={settings?.inlineNoteStyle || 'dashes'}
              displayRole={settings?.displayRole || 'leader'}
              duplicateSections={settings?.duplicateSections || 'full'}
            />
          )}
          {view === "design" && (
            <DesignShowcase onBack={() => setView("settings")} />
          )}
          {view === "settings" && settings && (
            <Settings
              settings={settings}
              onUpdate={setSettings}
              onClearAll={handleClearAll}
              onDownloadSongs={() => {
                songs.forEach(s => {
                  const md = songToMd(s);
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = s.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase() + '.md';
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              songCount={songs.length}
              setlistCount={setlists.length}
              syncState={syncState}
              onSyncStateChange={setSyncState}
              onSyncNow={triggerSync} onDesign={() => setView("design")}
            />
          )}
          {['home', 'library', 'setlists', 'settings', 'setlist-view'].includes(view) && (
            <BottomNav activeView={view === 'setlist-view' ? 'setlists' : view} onNavigate={goToMainView} />
          )}
        </DesktopLayout>
      )}
    </Suspense>
  );
}
