import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, songToMd, generateId } from './parser';
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
import Setlists from './components/Setlists';
import BottomNav from './components/BottomNav';
import { exportSetlistZip, importSetlistZip } from './setlist-io';
import { Badge } from './components/ui/Badge';

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

      if (savedSongs.length === 0 && !savedSettings.onboardingComplete) {
        setView('welcome');
      } else if (!savedSettings.onboardingComplete) {
        savedSettings.onboardingComplete = true;
        setSettings(savedSettings);
        await saveSettings(savedSettings);
        setView('home');
      } else {
        setView('home');
      }

      setLoaded(true);

      const storedSync = await getSyncState();
      if (storedSync?.activeProvider) {
        setSyncState({ state: 'idle', lastSync: storedSync.lastSyncTime, provider: storedSync.activeProvider });
        const engine = syncEngineRef.current;
        if (engine) {
          const currentSongs = savedSongs.length > 0 ? savedSongs : [];
          const currentSetlists = savedSetlists || [];
          engine.fullSync(currentSongs, currentSetlists).then(result => {
            if (result.changed) {
              setSongs(result.songs);
              setSetlists(result.setlists);
            }
          }).catch(err => console.error('Startup sync failed:', err));
        }
      }
    })();
  }, []);

  // Auto-save
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

  // Apply theme
  useEffect(() => {
    if (!settings) return;
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings?.theme]);

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

  const goToMainView = (viewName) => {
    setView(viewName);
    setCurrentSong(null);
    setCurrentSetlist(null);
  };

  const goLibrary = () => goToMainView('library');
  const goSetlists = () => goToMainView('setlists');
  const goChart = (song) => navigate('chart', { song });
  const goEditor = (song = null) => navigate('editor', { song });
  const goSetlistBuild = (sl = null) => navigate('setlist-build', { setlist: sl });
  const goSetlistView = (sl) => navigate('setlist-view', { setlist: sl });
  const goSetlistPlay = (sl) => navigate('setlist-play', { setlist: sl });

  const handleSaveSong = (song) => {
    setSongs(prev => {
      const idx = prev.findIndex(s => s.id === song.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = song; return n; }
      return [...prev, song];
    });
    navigate('chart', { song, replace: true });
  };

  const handleDeleteSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    historyRef.current.pop();
    goBack();
  };

  const handleImportSong = (mdText) => {
    try {
      const song = { ...parseSongMd(mdText), id: generateId() };
      setSongs(prev => [...prev, song]);
    } catch {
      alert('Failed to parse .md file');
    }
  };

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
    historyRef.current.pop();
    goBack();
  };

  const handleClearAll = async () => {
    await clearAll();
    setSongs([]);
    setSetlists([]);
    historyRef.current = [];
    setView('home');
  };

  const handleExportSetlist = async (sl) => {
    const blob = await exportSetlistZip(sl, songs);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (sl.name || 'setlist').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\\s+/g, '-').toLowerCase() + '.zip';
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center text-background text-2xl font-black shadow-xl animate-pulse">
          SM
        </div>
        <div className="flex flex-col items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] tracking-widest text-accents-4 border-accents-2">
            INITIALIZING
          </Badge>
          <div className="text-sm font-bold text-foreground tracking-tight italic">
            Setlists MD
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans min-h-screen selection:bg-geist-link/20">
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
      {view === 'home' && (
        <Dashboard
          songs={songs}
          setlists={setlists}
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
          onSelectSong={goChart}
          onNewSong={() => goEditor()}
          onImportSong={handleImportSong}
        />
      )}
      {view === 'setlists' && (
        <Setlists
          songs={songs}
          setlists={setlists}
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
      {view === 'settings' && settings && (
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
              a.download = s.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\\s+/g, '-').toLowerCase() + '.md';
              a.click();
              URL.revokeObjectURL(url);
            });
          }}
          songCount={songs.length}
          setlistCount={setlists.length}
          syncState={syncState}
          onSyncStateChange={setSyncState}
          onSyncNow={triggerSync}
        />
      )}
      {['home', 'library', 'setlists', 'settings'].includes(view) && (
        <BottomNav activeView={view} onNavigate={goToMainView} />
      )}
    </div>
  );
}
