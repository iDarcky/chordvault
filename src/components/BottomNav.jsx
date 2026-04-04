const tabs = [
  { id: 'home', label: 'Home', icon: '\u2302' },
  { id: 'library', label: 'Library', icon: '\u266B' },
  { id: 'setlists', label: 'Setlists', icon: '\u2630' },
  { id: 'settings', label: 'Settings', icon: '\u2699' },
];

export default function BottomNav({ activeView, onNavigate }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      zIndex: 100,
    }}>
      {tabs.map(t => {
        const active = activeView === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2,
              height: 56,
              background: 'none', border: 'none',
              color: active ? 'var(--accent-text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--fb)',
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
