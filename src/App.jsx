import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, generateId } from './parser';
import { loadSongs, saveSongs, loadSetlists, saveSetlists, loadSettings, saveSettings, clearAll } from './storage';
import { DEMO_SONGS_MD } from './data/demos';
import { createSyncEngine } from './sync/engine';
import { getSyncState } from './sync/tokens';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import ChartView from './components/ChartView';
import Editor from './components/Editor';
import SetlistBuilder from './components/SetlistBuilder';
import SetlistPlayer from './components/SetlistPlayer';
import Settings from './components/Settings';
import SetlistOverview from './components/SetlistOverview';
import AppShell from './components/AppShell';
import { exportSetlistZip, importSetlistZip } from './setlist-io';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [view, setView] = useState('loading');
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState({ state: 'idle', lastSync: null, provider: null });
  const syncEngineRef = useRef(null);

  // Initialize sync engine
  if (syncEngineRef.current == null) {
    syncEngineRef.current = createSyncEngine((status) => {
      setSyncState(prev => ({ ...prev, ...status }));
    });
  }

  const triggerSync = useCallback(async () => {
    const state = await getSyncState();
    if (!state?.activeProvider) return;
    const result = await syncEngineRef.current.fullSync(songs, setlists);
    if (result.changed) {
      setSongs(result.songs);
      setSetlists(result.setlists);
    }
  }, [songs, setlists]);

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

      // Initialize sync state from storage
      const storedSync = await getSyncState();
      if (storedSync?.activeProvider) {
        setSyncState({ state: 'idle', lastSync: storedSync.lastSyncTime, provider: storedSync.activeProvider });
      }
    })();
  }, []);

  // Auto-save when data changes + debounced sync push
  useEffect(() => {
    if (loaded) {
      saveSongs(songs);
      syncEngineRef.current?.debouncedPush(songs, setlists);
    }
  }, [songs, loaded]);
  useEffect(() => {
    if (loaded) {
      saveSetlists(setlists);
      syncEngineRef.current?.debouncedPush(songs, setlists);
    }
  }, [setlists, loaded]);
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

  // Navigation handlers
  const goHome = () => { setView('home'); setCurrentSong(null); setCurrentSetlist(null); };
  const goLibrary = () => { setView('library'); setCurrentSong(null); setCurrentSetlist(null); };
  const goChart = (song) => { setCurrentSong(song); setView('chart'); };
  const goEditor = (song = null) => { setCurrentSong(song); setView('editor'); };
  const goSetlistBuild = (sl = null) => { setCurrentSetlist(sl); setView('setlist-build'); };
  const goSetlistView = (sl) => { setCurrentSetlist(sl); setView('setlist-view'); };
  const goSetlistPlay = (sl) => { setCurrentSetlist(sl); setView('setlist-play'); };
  const goSettings = () => setView('settings');

  // Song CRUD
  const handleSaveSong = (song) => {
    setSongs(prev => {
      const idx = prev.findIndex(s => s.id === song.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = song; return n; }
      return [...prev, song];
    });
    goChart(song);
  };

  const handleDeleteSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    goLibrary();
  };

  const handleImportSong = (mdText) => {
    try {
      const song = { ...parseSongMd(mdText), id: generateId() };
      setSongs(prev => [...prev, song]);
    } catch {
      alert('Failed to parse .md file');
    }
  };

  // Setlist CRUD
  const handleSaveSetlist = (sl) => {
    setSetlists(prev => {
      const idx = prev.findIndex(s => s.id === sl.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = sl; return n; }
      return [...prev, sl];
    });
    goLibrary();
  };

  const handleDeleteSetlist = (id) => {
    setSetlists(prev => prev.filter(s => s.id !== id));
    goLibrary();
  };

  const handleClearAll = async () => {
    await clearAll();
    setSongs([]);
    setSetlists([]);
    goLibrary();
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
      const msg = newSongs.length > 0
        ? `Imported "${setlist.name}" with ${newSongs.length} new song${newSongs.length > 1 ? 's' : ''}.`
        : `Imported "${setlist.name}". All songs already in library.`;
      alert(msg);
    } catch {
      alert('Failed to import setlist zip.');
    }
  };

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Loading ChordVault...
        </div>
      </div>
    );
  }

  return (
    <>
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
      {(view === 'home' || view === 'library' || view === 'settings') && settings && (
        <AppShell
          section={view === 'home' ? 'home' : view === 'library' ? 'library' : 'settings'}
          songs={songs}
          setlists={setlists}
          syncState={syncState}
          onHome={goHome}
          onLibrary={goLibrary}
          onSettings={goSettings}
          onSyncNow={triggerSync}
          onSelectSong={goChart}
          onViewSetlist={goSetlistView}
          onPlaySetlist={goSetlistPlay}
        >
          {view === 'home' && (
            <Dashboard
              songs={songs}
              setlists={setlists}
              settings={settings}
              onUpdateSettings={setSettings}
              onSelectSong={goChart}
              onNewSong={() => goEditor()}
              onImportSong={handleImportSong}
              onNewSetlist={() => goSetlistBuild()}
              onViewSetlist={goSetlistView}
              onPlaySetlist={goSetlistPlay}
              onGoLibrary={goLibrary}
            />
          )}
          {view === 'library' && (
            <Library
              embedded
              songs={songs}
              setlists={setlists}
              onBack={goHome}
              onSelectSong={goChart}
              onNewSong={() => goEditor()}
              onImportSong={handleImportSong}
              onNewSetlist={() => goSetlistBuild()}
              onPlaySetlist={goSetlistPlay}
              onViewSetlist={goSetlistView}
              onImportSetlist={handleImportSetlist}
              onSettings={goSettings}
            />
          )}
          {view === 'settings' && (
            <Settings
              embedded
              settings={settings}
              onUpdate={setSettings}
              onBack={goHome}
              onClearAll={handleClearAll}
              songCount={songs.length}
              setlistCount={setlists.length}
              syncState={syncState}
              onSyncStateChange={setSyncState}
              onSyncNow={triggerSync}
            />
          )}
        </AppShell>
      )}
      {view === 'chart' && currentSong && (
        <ChartView
          song={currentSong}
          onBack={goLibrary}
          onEdit={() => goEditor(currentSong)}
          defaultColumns={settings?.defaultColumns}
          defaultFontSize={settings?.defaultFontSize}
        />
      )}
      {view === 'editor' && (
        <Editor
          song={currentSong}
          onSave={handleSaveSong}
          onBack={currentSong ? () => goChart(currentSong) : goLibrary}
          onDelete={currentSong ? handleDeleteSong : null}
        />
      )}
      {view === 'setlist-view' && currentSetlist && (
        <SetlistOverview
          setlist={currentSetlist}
          songs={songs}
          onBack={goLibrary}
          onEdit={() => goSetlistBuild(currentSetlist)}
          onExport={() => handleExportSetlist(currentSetlist)}
          onPlay={() => goSetlistPlay(currentSetlist)}
        />
      )}
      {view === 'setlist-build' && (
        <SetlistBuilder
          songs={songs}
          setlist={currentSetlist}
          onSave={handleSaveSetlist}
          onBack={goLibrary}
          onDelete={currentSetlist ? handleDeleteSetlist : null}
        />
      )}
      {view === 'setlist-play' && currentSetlist && (
        <SetlistPlayer
          setlist={currentSetlist}
          songs={songs}
          onBack={goLibrary}
          defaultColumns={settings?.defaultColumns}
          defaultFontSize={settings?.defaultFontSize}
        />
      )}
    </>
  );
}
