import { Toaster } from "./components/ui/Toaster";
import { toast } from "./components/ui/use-toast";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { parseSongMd, songToMd, generateId } from './parser';
import { loadSongs, saveSongs, loadSetlists, saveSetlists, loadSettings, saveSettings, loadTombstones, saveTombstones, getStorageEstimate, clearAll } from './storage';
import { DEMO_SONGS_MD } from './data/demos';
import { createSyncEngine } from './sync/engine';
import { getSyncState } from './sync/tokens';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Library from './components/Library';
import Settings from './components/Settings';
import Account from './components/Account';
import Setlists from './components/Setlists';
import BottomNav from './components/BottomNav';
import DesktopLayout from './components/DesktopLayout';
import MobileTopBar from './components/MobileTopBar';
import MobileDrawer from './components/MobileDrawer';
import NotificationTray from './components/NotificationTray';
import FeedbackButton from './components/FeedbackButton';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './auth/useAuth';
import { exportSetlistZip, importSetlistZip } from './setlist-io';

const QUOTA_WARN_THRESHOLD = 0.8;

async function maybeWarnQuota(warnedRef) {
  if (warnedRef.current) return;
  const est = await getStorageEstimate();
  if (!est || est.ratio < QUOTA_WARN_THRESHOLD) return;
  warnedRef.current = true;
  const pct = Math.round(est.ratio * 100);
  toast({
    title: 'Storage almost full',
    description: `This device has used ${pct}% of its browser storage. Consider exporting and archiving older songs.`,
    variant: 'error',
  });
}

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
const PerformanceView = lazy(() => import('./components/PerformanceView'));
const PracticeView = lazy(() => import('./components/PracticeView'));
const LydianShowcase = lazy(() => import('./components/LydianShowcase'));
const SmartImportDialog = lazy(() => import('./components/SmartImportDialog'));
const HelpPage = lazy(() => import('./components/HelpPage'));
const AuthScreen = lazy(() => import('./components/auth/AuthScreen'));
const AuthCallback = lazy(() => import('./components/auth/AuthCallback'));
const UpgradeScreen = lazy(() => import('./components/UpgradeScreen'));

// Subset of local settings that gets mirrored to the user's cloud profile
// (profiles.preferences). Device-local flags like onboardingComplete,
// helpPageSeen, and the notification inbox are intentionally excluded.
const PORTABLE_PREF_KEYS = [
  'theme',
  'defaultColumns',
  'defaultFontSize',
  'pedalNext',
  'pedalPrev',
  'showInlineNotes',
  'inlineNoteStyle',
  'displayRole',
  'duplicateSections',
  'chartLayout',
  'userName',
];

function extractPortablePrefs(s) {
  const out = {};
  if (!s) return out;
  for (const k of PORTABLE_PREF_KEYS) {
    if (s[k] !== undefined) out[k] = s[k];
  }
  return out;
}

function prefsEqual(a, b) {
  for (const k of PORTABLE_PREF_KEYS) {
    if ((a?.[k] ?? null) !== (b?.[k] ?? null)) return false;
  }
  return true;
}

export default function App() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [songs, setSongs] = useState([]);
  const [setlists, setSetlists] = useState([]);
  const [tombstones, setTombstones] = useState({ songs: [], setlists: [] });
  const [view, setView] = useState(() => {
    // OAuth / magic-link callbacks land on /auth/callback. Detect that up
    // front so the first render doesn't flash the Welcome screen.
    if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
      return 'auth-callback';
    }
    return 'loading';
  });
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSetlist, setCurrentSetlist] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState({ state: 'idle', lastSync: null, provider: null });
  const [previewSongId, setPreviewSongId] = useState(null);
  const [previewSetlistId, setPreviewSetlistId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSmartImport, setShowSmartImport] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerOpenKey, setDrawerOpenKey] = useState(0);
  const openDrawer = () => {
    setDrawerOpenKey(k => k + 1);
    setDrawerOpen(true);
  };
  const [notifTrayOpen, setNotifTrayOpen] = useState(false);
  const syncEngineRef = useRef(null);
  const historyRef = useRef([]);
  const quotaWarnedRef = useRef(false);
  const prefsHydratedForUserRef = useRef(null);
  const prefsPushTimerRef = useRef(null);

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
      maybeWarnQuota(quotaWarnedRef);
    }
  }, [songs, loaded]);
  useEffect(() => {
    if (loaded) {
      saveSetlists(setlists);
      syncEngineRef.current?.debouncedPush(songs, setlists, tombstones, setTombstones);
      maybeWarnQuota(quotaWarnedRef);
    }
  }, [setlists, loaded]);
  useEffect(() => { if (loaded) saveTombstones(tombstones); }, [tombstones, loaded]);
  useEffect(() => { if (loaded && settings) saveSettings(settings); }, [settings, loaded]);

  // Clean up Supabase auth tokens from the URL after magic-link / password
  // reset redirects. detectSessionInUrl consumes the fragment, but the string
  // itself lingers in the address bar until we replaceState.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasAuthHash = window.location.hash && /(access_token|refresh_token|error_description|type=recovery)/.test(window.location.hash);
    const hasAuthQuery = /[?&](code|error_description)=/.test(window.location.search);
    if (!hasAuthHash && !hasAuthQuery) return;
    // Defer so detectSessionInUrl (async) has a chance to consume tokens first.
    const t = setTimeout(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // Hydrate local settings from the user's cloud preferences on sign-in —
  // once per user id. Cloud is treated as source of truth for the portable
  // subset; device-local fields stay untouched.
  useEffect(() => {
    if (!loaded || !settings || !user?.id || !profile) return;
    if (prefsHydratedForUserRef.current === user.id) return;
    prefsHydratedForUserRef.current = user.id;
    const cloud = profile.preferences;
    if (cloud && typeof cloud === 'object' && Object.keys(cloud).length > 0) {
      setSettings(prev => ({ ...prev, ...cloud }));
    }
  }, [loaded, user?.id, profile, settings]);

  // Forget hydration marker on sign-out so a later sign-in re-hydrates.
  useEffect(() => {
    if (!user?.id) prefsHydratedForUserRef.current = null;
  }, [user?.id]);

  // Push portable preference changes to the cloud (debounced, only after
  // hydration so we don't clobber server state with local defaults).
  useEffect(() => {
    if (!loaded || !settings || !user?.id) return;
    if (prefsHydratedForUserRef.current !== user.id) return;
    const portable = extractPortablePrefs(settings);
    if (prefsEqual(portable, profile?.preferences || {})) return;
    clearTimeout(prefsPushTimerRef.current);
    prefsPushTimerRef.current = setTimeout(() => {
      updateProfile({ preferences: portable }).catch(err => {
        console.warn('[prefs] cloud sync failed:', err?.message || err);
      });
    }, 800);
    return () => clearTimeout(prefsPushTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loaded,
    user?.id,
    settings?.theme,
    settings?.defaultColumns,
    settings?.defaultFontSize,
    settings?.pedalNext,
    settings?.pedalPrev,
    settings?.showInlineNotes,
    settings?.inlineNoteStyle,
    settings?.displayRole,
    settings?.duplicateSections,
    settings?.chartLayout,
    settings?.userName,
  ]);

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

  // Apply theme to document — 'default' follows system preference.
  // Also keeps the active <meta name="theme-color"> in sync so Android's system
  // bars (status bar + navigation pill) tint to match the current theme.
  useEffect(() => {
    if (!settings) return;
    const theme = settings.theme;

    const setThemeColor = (mode) => {
      const color = mode === 'light' ? '#ffffff' : '#14161e';
      // Remove the media-scoped tags so the single active tag wins everywhere.
      document.querySelectorAll('meta[name="theme-color"][media]').forEach(m => m.remove());
      let tag = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'theme-color');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', color);
    };

    if (theme === 'default') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const apply = () => {
        const mode = mq.matches ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', mode);
        setThemeColor(mode);
      };
      apply();
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
    document.documentElement.setAttribute('data-theme', theme);
    setThemeColor(theme);
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
    const apply = () => {
      setView(viewName);
      setCurrentSong(null);
      setCurrentSetlist(null);
      setIsFullscreen(false);
    };
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), []);

  // Notification system
  const hasUnreadNotifications = settings?.notifications?.some(n => !n.read) ?? false;

  const handleMarkNotificationRead = useCallback((notifId) => {
    setSettings(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n =>
        n.id === notifId ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const handleNotificationAction = useCallback((action) => {
    if (action?.type === 'navigate') {
      navigate(action.view);
    }
  }, [navigate]);

  // Navigation shortcuts
  const goLibrary = () => goToMainView('library');
  const goSetlists = () => goToMainView('setlists');
  const goChart = (song) => navigate('chart', { song });
  const goEditor = (song = null) => navigate('editor', { song });
  const goSetlistBuild = (sl = null) => navigate('setlist-build', { setlist: sl });
  const goSetlistView = (sl) => navigate('setlist-view', { setlist: sl });
  const goSetlistPlay = (sl) => navigate('setlist-play', { setlist: sl });
  const goSetlistPerformance = (sl) => navigate('setlist-performance', { setlist: sl });
  const goSetlistPractice = (sl) => navigate('setlist-practice', { setlist: sl });

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

  const handleSmartImport = (mdText) => {
    try {
      const song = { ...parseSongMd(mdText), id: generateId(), updatedAt: Date.now() };
      setSongs(prev => [...prev, song]);
      setShowSmartImport(false);
      navigate('editor', { song });
    } catch {
      toast({ title: 'Import failed', description: 'Could not parse converted chord sheet.', variant: 'error' });
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

  const handleUpdateSong = useCallback((updatedSong) => {
    setSongs(prev => {
      const i = prev.findIndex(s => s.id === updatedSong.id);
      if (i < 0) return prev;
      const next = [...prev];
      next[i] = { ...updatedSong, updatedAt: Date.now() };
      return next;
    });
  }, []);

  const handleUpdateSetlist = useCallback((updatedSetlist) => {
    setSetlists(prev => {
      const i = prev.findIndex(s => s.id === updatedSetlist.id);
      if (i < 0) return prev;
      const next = [...prev];
      next[i] = updatedSetlist;
      return next;
    });
  }, []);

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

  if (view === 'auth-callback') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[var(--ds-background-100)]" />}>
          <AuthCallback onDone={() => goToMainView('home')} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[var(--ds-background-200)] flex items-center justify-center">
        <div className="text-copy-14 text-[var(--text-2)]">
          Loading Setlists MD...
        </div>
      </div>
    );
  }

  const lazyFallback = (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex items-center justify-center">
      <div className="text-copy-14 text-[var(--text-2)]">Loading…</div>
    </div>
  );

  const isSignedIn = !!user;
  const displayName = profile?.display_name || settings?.userName || 'Guest';
  const displayEmail = user?.email || 'guest@setlists.md';
  const plan = profile?.plan
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : 'Free';
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Signed out' });
    } catch (err) {
      toast({ title: 'Sign-out failed', description: err.message, variant: 'error' });
    }
  };

  return (
    <ErrorBoundary>
    <Suspense fallback={lazyFallback}>
      <Toaster />
      {view === 'signin' && (
        <AuthScreen onBack={goBack} onSignedIn={() => goToMainView('home')} />
      )}
      {view === 'upgrade' && (
        <UpgradeScreen onBack={goBack} />
      )}
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
      {!['welcome', 'onboarding', 'signin', 'upgrade'].includes(view) && (
        <DesktopLayout activeView={view === 'setlist-view' ? 'setlists' : view === 'design' ? 'settings' : view} onNavigate={goToMainView} isFullscreen={view === 'setlist-performance' || view === 'setlist-play' || (isFullscreen && (view === 'library' || view === 'setlists'))} hasUnreadNotifications={hasUnreadNotifications} notifications={settings?.notifications || []} onMarkRead={handleMarkNotificationRead} onNotificationAction={handleNotificationAction} drawerOpen={drawerOpen} displayName={displayName} plan={plan} hideBottomSpacer={!['home', 'library', 'setlists', 'settings', 'account', 'setlist-view'].includes(view)}>
          {['home', 'library', 'setlists'].includes(view) && (
            <MobileTopBar
              key={view}
              view={view}
              songs={songs}
              setlists={setlists}
              onOpenDrawer={openDrawer}
              onSelectSong={goChart}
              onSelectSetlist={goSetlistView}
              onNewSong={() => goEditor()}
              onNewSetlist={() => goSetlistBuild()}
            />
          )}
          {view === 'home' && (
            <Dashboard
              songs={songs}
              setlists={setlists}
              settings={settings}
              onSelectSong={goChart}
              onNewSong={() => goEditor()}
              onNewSetlist={() => goSetlistBuild()}
              onViewSetlist={goSetlistView}
              onPlaySetlist={goSetlistPerformance}
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
              previewSongId={previewSongId}
              onSelectPreview={setPreviewSongId}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onEditSong={(s) => goEditor(s)}
              chartDefaults={{
                defaultColumns: settings?.defaultColumns,
                defaultFontSize: settings?.defaultFontSize,
                showInlineNotes: settings?.showInlineNotes !== false,
                inlineNoteStyle: settings?.inlineNoteStyle || 'dashes',
                displayRole: settings?.displayRole || 'leader',
                duplicateSections: settings?.duplicateSections || 'full',
                chartLayout: settings?.chartLayout || 'columns',
              }}
              onPasteImport={() => setShowSmartImport(true)}
            />
          )}
          {view === 'setlists' && (
            <Setlists
              songs={songs}
              setlists={setlists}
              loaded={loaded}
              onViewSetlist={goSetlistView}
              onPlaySetlist={goSetlistPerformance}
              onNewSetlist={() => goSetlistBuild()}
              onImportSetlist={handleImportSetlist}
              previewSetlistId={previewSetlistId}
              onSelectPreview={setPreviewSetlistId}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onEditSetlist={(sl) => goSetlistBuild(sl)}
              onExportSetlist={handleExportSetlist}
              onDeleteSetlist={(id) => {
                setSetlists(prev => prev.filter(s => s.id !== id));
                setTombstones(prev => ({
                  ...prev,
                  setlists: [...prev.setlists.filter(t => t.id !== id), { id, deletedAt: Date.now() }],
                }));
                setPreviewSetlistId(null);
              }}
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
              onPlay={() => goSetlistPerformance(currentSetlist)}
              onPractice={() => goSetlistPractice(currentSetlist)}
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
          {view === 'setlist-performance' && currentSetlist && (
            <PerformanceView
              setlist={currentSetlist}
              songs={songs}
              onBack={goBack}
            />
          )}
          {view === 'setlist-practice' && currentSetlist && (
            <PracticeView
              setlist={currentSetlist}
              songs={songs}
              onBack={goBack}
              onUpdateSong={handleUpdateSong}
              onUpdateSetlist={handleUpdateSetlist}
            />
          )}
          {view === "design" && (
            <LydianShowcase onBack={() => setView("settings")} />
          )}
          {view === "help" && (
            <HelpPage
              onBack={goBack}
              onMarkSeen={() => {
                if (!settings?.notifications) return;
                const updated = settings.notifications.map(n => ({ ...n, read: true }));
                setSettings(prev => ({ ...prev, notifications: updated, helpPageSeen: true }));
              }}
            />
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
              onHelp={() => navigate('help')}
              onRequestSignIn={() => navigate('signin')}
              isSignedIn={isSignedIn}
              displayName={displayName}
            />
          )}
          {view === "account" && settings && (
            <Account
              settings={settings}
              onUpdate={setSettings}
              isSignedIn={isSignedIn}
              displayName={displayName}
              displayEmail={displayEmail}
              plan={plan}
              songCount={songs.length}
              setlistCount={setlists.length}
              onUpgrade={() => navigate('upgrade')}
              onCreateAccount={() => navigate('signin')}
              onSignOut={handleSignOut}
            />
          )}
          {['home', 'library', 'setlists', 'settings', 'account', 'setlist-view'].includes(view) && (
            <BottomNav
              activeView={view === 'setlist-view' ? 'setlists' : view}
              onNavigate={goToMainView}
            />
          )}
        </DesktopLayout>
      )}
      {!['welcome', 'onboarding', 'signin', 'upgrade'].includes(view) && ['home', 'library', 'setlists'].includes(view) && !drawerOpen && (
        <EdgeSwipeHotspot onOpen={openDrawer} />
      )}
      {!['welcome', 'onboarding', 'signin', 'upgrade'].includes(view) && (
        <MobileDrawer
          open={drawerOpen}
          openKey={drawerOpenKey}
          onClose={() => setDrawerOpen(false)}
          userName={displayName}
          email={displayEmail}
          plan={plan}
          isSignedIn={isSignedIn}
          songCount={songs.length}
          setlistCount={setlists.length}
          hasUnreadNotifications={hasUnreadNotifications}
          onOpenSettings={() => { setDrawerOpen(false); goToMainView('settings'); }}
          onOpenNotifications={() => { setDrawerOpen(false); setNotifTrayOpen(true); }}
          onOpenHelp={() => { setDrawerOpen(false); navigate('help'); }}
          onOpenDesign={() => { setDrawerOpen(false); setView('design'); }}
          onSignOut={async () => { setDrawerOpen(false); await handleSignOut(); }}
          onUpgrade={() => { setDrawerOpen(false); navigate('upgrade'); }}
          onCreateAccount={() => { setDrawerOpen(false); navigate('signin'); }}
        />
      )}
      {!['welcome', 'onboarding', 'signin', 'upgrade'].includes(view) && (
        <NotificationTray
          open={notifTrayOpen}
          onClose={() => setNotifTrayOpen(false)}
          notifications={settings?.notifications || []}
          onMarkRead={handleMarkNotificationRead}
          onAction={(action) => {
            setNotifTrayOpen(false);
            handleNotificationAction?.(action);
          }}
        />
      )}
      {showSmartImport && (
        <SmartImportDialog
          onClose={() => setShowSmartImport(false)}
          onImport={handleSmartImport}
        />
      )}
      {!['welcome', 'onboarding', 'signin', 'upgrade'].includes(view) && <FeedbackButton />}
    </Suspense>
    </ErrorBoundary>
  );
}

// Fixed strip on the left edge of mobile viewport — captures a swipe-right
// gesture to open the drawer. Rendered only on main tabs while drawer is closed.
function EdgeSwipeHotspot({ onOpen }) {
  const startRef = useRef(null);
  const firedRef = useRef(false);

  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    startRef.current = { x: t.clientX, y: t.clientY };
    firedRef.current = false;
  };
  const onTouchMove = (e) => {
    if (firedRef.current || !startRef.current) return;
    const t = e.touches?.[0];
    if (!t) return;
    const dx = t.clientX - startRef.current.x;
    const dy = Math.abs(t.clientY - startRef.current.y);
    if (dx > 40 && dy < 30) {
      firedRef.current = true;
      onOpen();
    }
  };
  const reset = () => { startRef.current = null; };

  return (
    <div
      aria-hidden="true"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={reset}
      onTouchCancel={reset}
      className="fixed top-0 left-0 z-[150] sm:hidden"
      style={{
        width: '24px',
        height: '100dvh',
        // Keep the strip transparent but touch-reachable
        background: 'transparent',
        touchAction: 'pan-y',
      }}
    />
  );
}

