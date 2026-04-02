import { useState, useMemo, useSyncExternalStore } from 'react';
import { transposeKey } from '../music';

function subscribeWide(mq, cb) {
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function useShellWide() {
  return useSyncExternalStore(
    (cb) => subscribeWide(window.matchMedia('(min-width: 768px)'), cb),
    () => window.matchMedia('(min-width: 768px)').matches,
    () => true,
  );
}

const railBtn = (active) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  background: active ? 'var(--nav-active)' : 'transparent',
  color: active ? 'var(--nav-active-text)' : 'var(--text-muted)',
  transition: 'background 0.12s ease, color 0.12s ease',
});

export default function AppShell({
  section,
  children,
  songs,
  setlists,
  syncState,
  onHome,
  onLibrary,
  onSettings,
  onSyncNow,
  onSelectSong,
  onViewSetlist,
  onPlaySetlist,
}) {
  const wide = useShellWide();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [treeQuery, setTreeQuery] = useState('');
  const [songsOpen, setSongsOpen] = useState(true);
  const [setlistsOpen, setSetlistsOpen] = useState(true);
  const [openSetlistIds, setOpenSetlistIds] = useState(() => new Set());

  const q = treeQuery.trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    if (!q) return songs;
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.artist || '').toLowerCase().includes(q) ||
      (s.key || '').toLowerCase().includes(q),
    );
  }, [songs, q]);

  const filteredSetlists = useMemo(() => {
    if (!q) return setlists;
    return setlists.filter(sl => {
      if ((sl.name || '').toLowerCase().includes(q)) return true;
      const items = sl.items || [];
      return items.some(it => {
        if (it.type === 'break') return false;
        const song = songs.find(s => s.id === it.songId);
        return song && song.title.toLowerCase().includes(q);
      });
    });
  }, [setlists, songs, q]);

  const toggleSetlistOpen = (id) => {
    setOpenSetlistIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeMobileSidebar = () => {
    if (!wide) setSidebarOpen(false);
  };

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: 'var(--fm)',
    padding: '10px 12px 6px',
  };

  const treeRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 30,
    padding: '4px 8px 4px 6px',
    marginLeft: 4,
    marginRight: 4,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--text)',
    border: 'none',
    background: 'transparent',
    width: 'calc(100% - 8px)',
    textAlign: 'left',
    fontFamily: 'var(--fb)',
    boxSizing: 'border-box',
  };

  const sidebarVisible = wide || sidebarOpen;

  return (
    <div
      className="app-shell-viewport"
      style={{
        display: 'flex',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Icon rail */}
      <div
        style={{
          width: 52,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          gap: 6,
          background: 'var(--rail-bg)',
          borderRight: '1px solid var(--rail-border)',
        }}
      >
        {!wide && (
          <button
            type="button"
            title="Library tree"
            aria-label="Open library tree"
            onClick={() => setSidebarOpen(o => !o)}
            style={railBtn(sidebarOpen)}
          >
            &#9776;
          </button>
        )}
        <button
          type="button"
          title="Home"
          aria-label="Home"
          onClick={() => { onHome(); closeMobileSidebar(); }}
          style={railBtn(section === 'home')}
        >
          &#8962;
        </button>
        <button
          type="button"
          title="Library"
          aria-label="Library"
          onClick={() => { onLibrary(); closeMobileSidebar(); }}
          style={railBtn(section === 'library')}
        >
          &#9836;
        </button>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          title="Sync now"
          aria-label="Sync now"
          onClick={onSyncNow}
          style={{
            ...railBtn(false),
            position: 'relative',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                syncState?.state === 'syncing'
                  ? 'var(--accent)'
                  : syncState?.state === 'synced'
                    ? '#22c55e'
                    : syncState?.state === 'error'
                      ? 'var(--danger)'
                      : 'var(--text-dim)',
            }}
          />
        </button>
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => { onSettings(); closeMobileSidebar(); }}
          style={railBtn(section === 'settings')}
        >
          &#9881;
        </button>
      </div>

      {/* Mobile overlay */}
      {!wide && sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            left: 52,
            zIndex: 19,
            border: 'none',
            padding: 0,
            margin: 0,
            background: 'rgba(0,0,0,0.45)',
            cursor: 'pointer',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: wide ? 268 : 280,
          maxWidth: wide ? 268 : 'min(280px, calc(100vw - 52px))',
          flexShrink: 0,
          display: sidebarVisible ? 'flex' : 'none',
          flexDirection: 'column',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          overflow: 'hidden',
          ...(wide
            ? {}
            : {
                position: 'fixed',
                left: 52,
                top: 0,
                bottom: 0,
                zIndex: 20,
                boxShadow: '8px 0 24px rgba(0,0,0,0.35)',
              }),
        }}
      >
        <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={treeQuery}
              onChange={e => setTreeQuery(e.target.value)}
              placeholder="Filter..."
              aria-label="Filter library tree"
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'var(--fb)',
                boxSizing: 'border-box',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                fontSize: 13,
                pointerEvents: 'none',
              }}
            >
              &#128269;
            </span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            paddingBottom: 16,
          }}
        >
          <div style={sectionLabel}>Library</div>
          <button
            type="button"
            onClick={() => setSongsOpen(o => !o)}
            style={{
              ...treeRow,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginBottom: 2,
            }}
          >
            <span style={{ width: 18, fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-dim)' }}>
              {songsOpen ? '\u25BC' : '\u25B6'}
            </span>
            Songs
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>
              {filteredSongs.length}
            </span>
          </button>
          {songsOpen &&
            filteredSongs.map(song => (
              <div
                key={song.id}
                role="button"
                tabIndex={0}
                onClick={() => { onSelectSong(song); closeMobileSidebar(); }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSong(song);
                    closeMobileSidebar();
                  }
                }}
                style={{
                  ...treeRow,
                  paddingLeft: 28,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--fm)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--chord)',
                    minWidth: 28,
                  }}
                >
                  {song.key}
                </span>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {song.title}
                </span>
              </div>
            ))}

          <button
            type="button"
            onClick={() => setSetlistsOpen(o => !o)}
            style={{
              ...treeRow,
              fontWeight: 600,
              color: 'var(--text-bright)',
              marginTop: 8,
              marginBottom: 2,
            }}
          >
            <span style={{ width: 18, fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--text-dim)' }}>
              {setlistsOpen ? '\u25BC' : '\u25B6'}
            </span>
            Setlists
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--fm)' }}>
              {filteredSetlists.length}
            </span>
          </button>
          {setlistsOpen &&
            filteredSetlists.map(sl => {
              const expanded = openSetlistIds.has(sl.id);
              const songItems = (sl.items || []).filter(it => it.type !== 'break');
              return (
                <div key={sl.id} style={{ marginBottom: 2 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      paddingRight: 4,
                      marginLeft: 4,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={expanded ? 'Collapse setlist' : 'Expand setlist'}
                      onClick={() => toggleSetlistOpen(sl.id)}
                      style={{
                        width: 26,
                        height: 30,
                        border: 'none',
                        borderRadius: 6,
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--fm)',
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      {expanded ? '\u25BC' : '\u25B6'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { onViewSetlist(sl); closeMobileSidebar(); }}
                      style={{
                        ...treeRow,
                        flex: 1,
                        marginLeft: 0,
                        width: 'auto',
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sl.name || 'Untitled'}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Live mode"
                      aria-label="Open setlist in live mode"
                      onClick={e => {
                        e.stopPropagation();
                        onPlaySetlist(sl);
                        closeMobileSidebar();
                      }}
                      style={{
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: 'var(--fb)',
                        cursor: 'pointer',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent-text)',
                        flexShrink: 0,
                      }}
                    >
                      Live
                    </button>
                  </div>
                  {expanded &&
                    songItems.map((it, idx) => {
                      const song = songs.find(s => s.id === it.songId);
                      if (!song) {
                        return (
                          <div
                            key={`${sl.id}-m-${idx}`}
                            style={{
                              ...treeRow,
                              paddingLeft: 36,
                              color: 'var(--danger)',
                              fontSize: 12,
                              cursor: 'default',
                            }}
                          >
                            Missing song
                          </div>
                        );
                      }
                      const dispKey = transposeKey(song.key, it.transpose || 0);
                      return (
                        <div
                          key={`${sl.id}-${song.id}-${idx}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => { onSelectSong(song); closeMobileSidebar(); }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectSong(song);
                              closeMobileSidebar();
                            }
                          }}
                          style={{
                            ...treeRow,
                            paddingLeft: 36,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--fm)',
                              fontSize: 10,
                              fontWeight: 700,
                              color: 'var(--chord)',
                              minWidth: 28,
                            }}
                          >
                            {dispKey}
                          </span>
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {song.title}
                          </span>
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
