import { useState, useEffect, useRef, useCallback } from 'react';
import { parseSongMd, songToMd, generateId } from './parser';
import { loadSongs, saveSongs, loadSetlists, saveSetlists, loadSettings, saveSettings, clearAll } from './storage';
import { createSyncEngine } from './sync/engine';

import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Setlists from './components/Setlists';
import ChartView from './components/ChartView';
import Editor from './components/Editor';
import SetlistOverview from './components/SetlistOverview';
import SetlistBuilder from './components/SetlistBuilder';
import SetlistPlayer from './components/SetlistPlayer';
import Settings from './components/Settings';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';

const DEMO_SONGS_MD = [
  `---
title: 10,000 Reasons (Bless The Lord)
artist: Matt Redman
key: G
tempo: 73
time: 4/4
structure: [Chorus 1, Verse 1, Chorus 2, Verse 2, Chorus 3, Verse 3, Chorus 4, Outro]
---

## Chorus 1
{c}
[G]Bless the [D]Lord, O my [A/C#]soul, [Bm]O my soul
[G]Worship His [D]holy [Asus4]name [A]
Sing like [G]never be[Bm]fore, [G] [A] [Bm]O my soul
I'll [G]worship Your [A]holy [G/D]name [D]

## Verse 1
{c}
The [G]sun comes [D]up, it's a [A]new day [Bm]dawning
[G]It's time to [D]sing Your [A]song a[Bm]gain
What[G]ever may [D]pass and what[A]ever lies be[Bm]fore me
[G2]Let me be [D]singing when the [Asus4]even[A]ing [D]comes`,

  `---
title: Amazing Grace (My Chains Are Gone)
artist: Chris Tomlin
key: G
tempo: 70
time: 4/4
structure: [Verse 1, Verse 2, Chorus, Verse 3, Chorus, Verse 4, Chorus]
---

## Verse 1
{c}
A[G]mazing grace, how [C/G]sweet the [G]sound
That saved a [G]wretch like [D/G]me
I [G]once was lost, but [C/G]now am [G]found
Was blind, but [D/G]now I [G]see`
];

export default function App() {
  const [view, setView] = useState('home');
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [syncState, setSyncState] = useState({ state: 'idle', lastSync: null, provider: null });

  const historyRef = useRef([]);
  const syncEngineRef = useRef(null);

  const triggerSync = useCallback(async () => {
    if (!syncEngineRef.current) return;
    try {
      const result = await syncEngineRef.current.sync(songs, setlists);
      if (result) {
        if (result.songs) setSongs(result.songs);
        if (result.setlists) setSetlists(result.setlists);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, [songs, setlists]);

  // Initial Load
  useEffect(() => {
    (async () => {
      const [s, sl, st] = await Promise.all([loadSongs(), loadSetlists(), loadSettings()]);
      setSongs(s || []);
      setSetlists(sl || []);
      setSettings(st);

      syncEngineRef.current = createSyncEngine((state) => setSyncState(state));

      setLoaded(true);
      if (st && !st.onboardingComplete) {
        setView('welcome');
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

  // Setlist export/import (placeholder)
  const handleExportSetlist = async (sl) => {
    alert('Export ZIP not implemented');
  };

  const handleImportSetlist = async (file) => {
    alert('Import ZIP not implemented');
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-default-400 text-sm font-medium animate-pulse">
          Loading Setlists MD...
        </div>
      </div>
    );
  }

  return (
    <div className={settings?.theme === 'dark' ? 'dark text-foreground bg-background' : 'text-foreground bg-background'}>
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
              a.download = s.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase() + '.md';
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
