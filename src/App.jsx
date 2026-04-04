import { useState, useEffect, useCallback, useRef } from 'react';
import { saveSongs, loadSongs, saveSetlists, loadSetlists, saveSettings, loadSettings, clearAll } from './storage';
import { parseSongMd, generateId } from './parser';
import { exportSetlistZip, importSetlistZip } from './setlist-io';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import ChartView from './components/ChartView';
import Editor from './components/Editor';
import SetlistOverview from './components/SetlistOverview';
import SetlistBuilder from './components/SetlistBuilder';
import SetlistPlayer from './components/SetlistPlayer';
import Settings from './components/Settings';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import { createSyncEngine } from './sync/engine';

const DEMO_SONGS_MD = [
  '# The Kingdom Stands\nartist: Worship Collective\nkey: A\ntempo: 128\n\n(Verse 1)\n[A]The world is [D]shaking, [A]nations are [E]waking\n[F#m]But your [D]kingdom [E]stands for[A]ever',
  '# Shelter of the Most High\nartist: Grace Chapel Music\nkey: G\ntempo: 72\n\n(Chorus)\n[G]I will say of the [C]Lord, [G]He is my [D]refuge\n[Em]My [C]fortress in [D]whom I [G]trust',
  '# Build My Life\nartist: Worship Central\nkey: E\ntempo: 68\n\n(Verse 1)\n[E]Worthy of [A]every song we could [E]ever sing\n[E]Worthy of [A]all the praise we could [E]ever bring'
];

export default function App() {
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('home');
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [syncState, setSyncState] = useState({ state: 'idle', lastSync: null, provider: null });

  const historyRef = useRef([]);
  const syncEngineRef = useRef(null);

  const triggerSync = useCallback(async () => {
    if (!syncEngineRef.current) return;
    try {
      const result = await syncEngineRef.current.fullSync(songs, setlists);
      if (result.changed) {
        setSongs(result.songs);
        setSetlists(result.setlists);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, [songs, setlists]);

  useEffect(() => {
    (async () => {
      const savedSongs = await loadSongs();
      const savedSetlists = await loadSetlists();
      const savedSettings = await loadSettings();

      setSongs(savedSongs || []);
      setSetlists(savedSetlists || []);

      const initialSettings = savedSettings || {
        theme: 'light',
        onboardingComplete: false,
        defaultColumns: 'auto',
        defaultFontSize: 'M'
      };
      setSettings(initialSettings);

      if (!initialSettings.onboardingComplete && (!savedSongs || savedSongs.length === 0)) {
        setView('welcome');
      }
      setLoaded(true);

      const engine = createSyncEngine((st) => setSyncState(st));
      syncEngineRef.current = engine;
      if (engine) {
        engine.fullSync(savedSongs || [], savedSetlists || []).catch(err => console.error('Startup sync failed:', err));
      }
    })();
  }, []);

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
  useEffect(() => {
    if (loaded && settings) {
      saveSettings(settings);
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings, loaded]);

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

  if (!loaded) return null;

  return (
    <>
      {view === 'welcome' && (
        <Welcome
          onGetStarted={() => {
            const demos = DEMO_SONGS_MD.map(md => ({ ...parseSongMd(md), id: generateId() }));
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
          songs={songs} setlists={setlists} syncState={syncState}
          onSelectSong={(s) => navigate('chart', { song: s })}
          onNewSong={() => navigate('editor')}
          onImportSong={handleImportSong}
          onNewSetlist={() => navigate('setlist-build')}
          onViewSetlist={(sl) => navigate('setlist-view', { setlist: sl })}
          onPlaySetlist={(sl) => navigate('setlist-play', { setlist: sl })}
          onGoLibrary={() => navigate('library')}
          onGoSetlists={() => navigate('library')}
          onGoSettings={() => navigate('settings')}
          onSyncNow={triggerSync}
        />
      )}
      {view === 'library' && (
        <Library
          songs={songs} setlists={setlists} onBack={goBack}
          onSelectSong={(s) => navigate('chart', { song: s })}
          onNewSong={() => navigate('editor')}
          onImportSong={handleImportSong}
          onNewSetlist={() => navigate('setlist-build')}
          onPlaySetlist={(sl) => navigate('setlist-play', { setlist: sl })}
          onViewSetlist={(sl) => navigate('setlist-view', { setlist: sl })}
          onSettings={() => navigate('settings')}
        />
      )}
      {view === 'chart' && currentSong && (
        <ChartView
          song={currentSong} onBack={goBack}
          onEdit={() => navigate('editor', { song: currentSong })}
          defaultColumns={settings?.defaultColumns}
          defaultFontSize={settings?.defaultFontSize}
        />
      )}
      {view === 'editor' && (
        <Editor
          song={currentSong} onSave={handleSaveSong} onBack={goBack}
          onDelete={currentSong ? handleDeleteSong : null}
        />
      )}
      {view === 'setlist-view' && currentSetlist && (
        <SetlistOverview
          setlist={currentSetlist} songs={songs} onBack={goBack}
          onEdit={() => navigate('setlist-build', { setlist: currentSetlist })}
          onPlay={() => navigate('setlist-play', { setlist: currentSetlist })}
        />
      )}
      {view === 'setlist-build' && (
        <SetlistBuilder
          songs={songs} setlist={currentSetlist} onSave={handleSaveSetlist} onBack={goBack}
          onDelete={currentSetlist ? handleDeleteSetlist : null}
        />
      )}
      {view === 'setlist-play' && currentSetlist && (
        <SetlistPlayer
          setlist={currentSetlist} songs={songs} onBack={goBack}
          defaultColumns={settings?.defaultColumns}
          defaultFontSize={settings?.defaultFontSize}
        />
      )}
      {view === 'settings' && settings && (
        <Settings
          settings={settings} onUpdate={setSettings} onBack={goBack}
          onClearAll={handleClearAll} songCount={songs.length} setlistCount={setlists.length}
          syncState={syncState} onSyncStateChange={setSyncState} onSyncNow={triggerSync}
        />
      )}
    </>
  );
}
