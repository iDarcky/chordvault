import { useEffect, useState } from 'react';
import Account from './Account';
import TeamScreen from './TeamScreen';
import { useAuth } from '../auth/useAuth';
import { useTeam } from '../auth/useTeam';
import SyncSettings from './settings/SyncSettings';
import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';

// ─── Icons ───────────────────────────────────────────────────────────────

const AppearanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const CloudIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19a4.5 4.5 0 1 0-1.6-8.7A6.5 6.5 0 0 0 4 12a5 5 0 0 0 1 9.9" />
  </svg>
);

const DataIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
);

const AboutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Shared bits used inside sub-panels ──────────────────────────────────

const Section = ({ title, subtitle, children }) => (
  <section className="flex flex-col mb-6">
    {(title || subtitle) && (
      <div className="px-1 pb-3 flex flex-col gap-1">
        {title && (
          <h2 className="text-heading-16 font-bold text-[var(--notion-text-dim)] m-0 uppercase tracking-widest">{title}</h2>
        )}
        {subtitle && (
          <p className="text-copy-14 text-[var(--notion-text-dim)] m-0">{subtitle}</p>
        )}
      </div>
    )}
    <div className="flex flex-col bg-[var(--notion-bg)] border border-[var(--notion-border)] rounded-lg overflow-hidden divide-y divide-[var(--notion-border)]">
      {children}
    </div>
  </section>
);

const Row = ({ label, children, description }) => (
  <div className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col flex-1 min-w-0 pr-4">
      <span className="text-copy-15 text-[var(--notion-text-main)] font-medium">{label}</span>
      {description && <span className="text-copy-13 text-[var(--notion-text-dim)] mt-0.5">{description}</span>}
    </div>
    <div className="flex items-center gap-2 mt-2 sm:mt-0 shrink-0">
      {children}
    </div>
  </div>
);

// ─── Hub row — drills into a sub-panel ───────────────────────────────────

function HubRow({ icon: Icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 cursor-pointer border-none text-left bg-[var(--notion-bg)] hover:bg-[var(--notion-bg-hover)] transition-colors active:bg-[var(--notion-bg-hover)]"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="text-[var(--notion-text-dim)] shrink-0 flex items-center justify-center w-6 h-6">
        {Icon && <Icon />}
      </span>
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-copy-15 text-[var(--notion-text-main)] font-medium">{label}</span>
        {value && (
          <span className="text-copy-13 text-[var(--notion-text-dim)] mt-0.5 truncate">{value}</span>
        )}
      </span>
      <span className="text-[var(--notion-text-dim)] shrink-0 opacity-50">
        <ChevronRight />
      </span>
    </button>
  );
}

// ─── Panel labels (also the ScreenHeader title) ──────────────────────────

const PANEL_TITLES = {
  account: 'My account',
  workspace: 'Workspace',
  appearance: 'Appearance',
  chart: 'Chart Defaults',
  sync: 'Cloud Sync',
  data: 'Data',
  about: 'About',
};

// ─── Sub-panel renderers — pure, just take what they need ────────────────

function AppearancePanel({ settings, update, isSignedIn }) {
  return (
    <Section
      subtitle={isSignedIn
        ? 'Synced to your account — changes follow you across devices.'
        : 'Sign in to sync these preferences to every device you use.'}
    >
      <Row label="Theme" description="System follows your device preference.">
        <div className="flex p-1 bg-[var(--notion-bg-hover)] border border-[var(--notion-border)] rounded-lg">
          {[
            { key: 'default', label: 'System' },
            { key: 'light', label: 'Light' },
            { key: 'dark', label: 'Dark' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={settings.theme === key ? 'secondary' : 'ghost'}
              onClick={() => update('theme', key)}
              className={settings.theme === key ? "bg-[var(--notion-bg)] shadow-sm text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)]"}
            >
              {label}
            </Button>
          ))}
        </div>
      </Row>
      <Row label="Library Layout" description="Number of columns for the library view.">
        <div className="flex p-1 bg-[var(--notion-bg-hover)] border border-[var(--notion-border)] rounded-lg">
          {['auto', 1, 2].map(v => (
            <Button
              key={v}
              size="sm"
              variant={settings.defaultColumns === v ? 'secondary' : 'ghost'}
              onClick={() => update('defaultColumns', v)}
              className={settings.defaultColumns === v ? "bg-[var(--notion-bg)] shadow-sm text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)]"}
            >
              {v === 'auto' ? 'Auto' : `${v}col`}
            </Button>
          ))}
        </div>
      </Row>
    </Section>
  );
}

function ChartPanel({ settings, update }) {
  return (
    <Section subtitle="How charts are laid out and which elements are visible by default.">
      <Row label="Header Style" description="Choose the top header layout.">
        <div className="flex p-1 bg-[var(--notion-bg-hover)] border border-[var(--notion-border)] rounded-lg">
          {[
            { key: 'classic', label: 'Classic' },
            { key: 'notion', label: 'Document' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={settings.headerStyle === key ? 'secondary' : 'ghost'}
              onClick={() => update('headerStyle', key)}
              className={settings.headerStyle === key ? "bg-[var(--notion-bg)] shadow-sm text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)]"}
            >
              {label}
            </Button>
          ))}
        </div>
      </Row>
      <Row label="Chart Flow" description="How sections fill when using 2 columns.">
        <div className="flex p-1 bg-[var(--notion-bg-hover)] border border-[var(--notion-border)] rounded-lg">
          {[
            { key: 'columns', label: 'Top ↓ Down' },
            { key: 'rows', label: 'Left → Right' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={settings.chartLayout === key ? 'secondary' : 'ghost'}
              onClick={() => update('chartLayout', key)}
              className={settings.chartLayout === key ? "bg-[var(--notion-bg)] shadow-sm text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)]"}
            >
              {label}
            </Button>
          ))}
        </div>
      </Row>
      <Row label="Display Mode" description="Control which elements are visible by default.">
        <div className="flex p-1 bg-[var(--notion-bg-hover)] border border-[var(--notion-border)] rounded-lg flex-wrap">
          {[
            { key: 'leader', label: 'Full' },
            { key: 'vocalist', label: 'Vocals' },
            { key: 'drummer', label: 'Drums' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={settings.displayRole === key ? 'secondary' : 'ghost'}
              onClick={() => update('displayRole', key)}
              className={settings.displayRole === key ? "bg-[var(--notion-bg)] shadow-sm text-[var(--notion-text-main)]" : "text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)]"}
            >
              {label}
            </Button>
          ))}
        </div>
      </Row>
    </Section>
  );
}

function SyncPanel({ syncState, onSyncStateChange, onSyncNow, onRequestSignIn, activeLibrary, team }) {
  if (activeLibrary !== 'personal') {
    return (
      <Section subtitle={`This workspace is automatically synced with your team "${team?.name || 'Team'}".`}>
        <Row label="Provider" description="Team Cloud (Supabase Postgres)">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--ds-green-500)]" />
            <span className="text-copy-13 font-medium text-[var(--ds-green-700)]">Connected</span>
          </div>
        </Row>
      </Section>
    );
  }

  return (
    <SyncSettings
      syncState={syncState || { state: 'idle', lastSync: null, provider: null }}
      onSyncStateChange={onSyncStateChange}
      onSyncNow={onSyncNow}
      onRequestSignIn={onRequestSignIn}
    />
  );
}

function DataPanel({ songCount, setlistCount, onDownloadSongs, onClearAll }) {
  return (
    <Section subtitle={`${songCount} songs, ${setlistCount} setlists saved on this device.`}>
      <Row label="Export library" description="Download every song as a separate .md file.">
        <Button size="sm" variant="secondary" onClick={onDownloadSongs}>Download all</Button>
      </Row>
      <Row label="Clear all data" description="Wipe every song and setlist on this device. Cloud copies are kept.">
        <Button
          size="sm"
          variant="error"
          onClick={() => { if (confirm('Delete ALL local songs and setlists? This cannot be undone.')) onClearAll(); }}
        >
          Clear all
        </Button>
      </Row>
    </Section>
  );
}

function AboutPanel({ isSignedIn, displayName }) {
  const linkClass = 'hover:text-[var(--notion-text-main)] text-[var(--notion-text-dim)] transition-colors underline-offset-4 underline decoration-[var(--notion-border)]';
  const docBase = 'https://github.com/iDarcky/setlists-md/blob/master/docs';
  return (
    <div className="flex flex-col gap-6">
      <div className="border border-[var(--notion-border)] rounded-lg bg-[var(--notion-bg)] p-5 flex flex-col gap-2">
        <h2 className="text-heading-20 text-[var(--notion-text-main)] m-0 font-bold tracking-tight">
          {isSignedIn && displayName ? displayName : 'Setlists.md'}
        </h2>
        <p className="text-copy-14 text-[var(--notion-text-dim)] leading-relaxed">
          A workspace for music teams. Your songs belong to you as plain Markdown files — open them in any text editor, forever.
        </p>
        <div className="mt-3 flex items-center gap-3 text-label-12 text-[var(--notion-text-dim)] font-medium">
          <span>v1.2.0</span>
          <span className="text-[var(--notion-text-dim)] opacity-50">·</span>
          <a
            href="https://github.com/iDarcky/setlists-md"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="border border-[var(--notion-border)] rounded-lg bg-[var(--notion-bg)] p-5 flex flex-col gap-3">
        <h3 className="text-label-12 font-semibold uppercase tracking-widest text-[var(--notion-text-dim)] m-0">
          Legal &amp; Copyright
        </h3>
        <p className="text-copy-13 text-[var(--notion-text-dim)] leading-relaxed m-0">
          Setlists.md is a private workspace; you are responsible for licensing
          the content you import. We act on valid copyright takedown notices.
        </p>
        <div className="flex flex-col gap-2 mt-1 text-copy-14">
          <a href={`${docBase}/PRIVACY.md`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Privacy Policy
          </a>
          <a href={`${docBase}/TERMS.md`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Terms of Service
          </a>
          <a href={`${docBase}/COPYRIGHT.md`} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Copyright Policy &amp; DMCA
          </a>
          <a
            href="mailto:legal@setlists.md?subject=Content%20report"
            className={linkClass}
          >
            Report content (legal@setlists.md)
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Hub summaries — show the current value next to each row ─────────────

function appearanceSummary(s) {
  const theme = s?.theme === 'light' ? 'Light' : s?.theme === 'dark' ? 'Dark' : 'System';
  const cols = s?.defaultColumns === 'auto' ? 'Auto' : `${s?.defaultColumns || 1}-col`;
  return `${theme} · ${cols}`;
}

function chartSummary(s) {
  const flow = s?.chartLayout === 'rows' ? 'Left → Right' : 'Top ↓ Down';
  const role = s?.displayRole === 'vocalist' ? 'Vocals'
    : s?.displayRole === 'drummer' ? 'Drums'
    : 'Full';
  return `${flow} · ${role}`;
}

function syncSummary(syncState) {
  if (!syncState?.provider) return 'Off';
  const provider = syncState.provider;
  if (provider.startsWith('supabase-team:')) return 'Team Cloud';
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

// ─── Main component ──────────────────────────────────────────────────────

const AccountIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const WorkspaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function SettingsModal({
  settings,
  onUpdate,
  onClose,
  onClearAll,
  onDownloadSongs,
  songCount,
  setlistCount,
  syncState,
  onSyncStateChange,
  onSyncNow,
  onRequestSignIn,
  isSignedIn = false,
  displayName = '',
  displayEmail = '',
  plan = 'Free',
  onUpgrade,
  onSignIn,
  onCreateAccount,
  onSignOut,
  onSwitchLibrary,
  initialPanel = 'account',
}) {
  const update = (key, value) => onUpdate({ ...settings, [key]: value });
  const [panel, setPanel] = useState(initialPanel);

  useEffect(() => {
    setPanel(initialPanel);
  }, [initialPanel]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (panel) {
      case 'account':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">My account</h1>
            <Account
              settings={settings}
              onUpdate={onUpdate}
              isSignedIn={isSignedIn}
              displayName={displayName}
              displayEmail={displayEmail}
              plan={plan}
              songCount={songCount}
              setlistCount={setlistCount}
              onUpgrade={onUpgrade}
              onSignIn={onSignIn}
              onCreateAccount={onCreateAccount}
              onSignOut={onSignOut}
              isModal={true}
            />
          </div>
        );
      case 'workspace':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">Workspace</h1>
            <TeamScreen
              onBack={() => setPanel('hub')}
              onUpgrade={onUpgrade}
              onSwitchLibrary={onSwitchLibrary}
              isModal={true}
            />
          </div>
        );
      case 'appearance':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">Appearance</h1>
            <AppearancePanel settings={settings} update={update} isSignedIn={isSignedIn} />
          </div>
        );
      case 'chart':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">Chart Defaults</h1>
            <ChartPanel settings={settings} update={update} />
          </div>
        );
      case 'sync':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">Cloud Sync</h1>
            <SyncPanel
              syncState={syncState}
              onSyncStateChange={onSyncStateChange}
              onSyncNow={onSyncNow}
              onRequestSignIn={onRequestSignIn}
              activeLibrary={undefined} // Not used in Settings.jsx SyncPanel actually
              team={undefined}
            />
          </div>
        );
      case 'data':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">Data</h1>
            <DataPanel
              songCount={songCount}
              setlistCount={setlistCount}
              onDownloadSongs={onDownloadSongs}
              onClearAll={onClearAll}
            />
          </div>
        );
      case 'about':
        return (
          <div className="pt-2">
            <h1 className="text-[20px] font-semibold text-[var(--notion-text-main)] mb-6 hidden md:block">About</h1>
            <AboutPanel isSignedIn={isSignedIn} displayName={displayName} />
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'account', label: 'My account', icon: AccountIcon },
    { id: 'workspace', label: 'Workspace', icon: WorkspaceIcon },
    { id: 'appearance', label: 'Appearance', icon: AppearanceIcon },
    { id: 'chart', label: 'Chart Defaults', icon: ChartIcon },
    { id: 'sync', label: 'Cloud Sync', icon: CloudIcon },
    { id: 'data', label: 'Data', icon: DataIcon },
    { id: 'about', label: 'About', icon: AboutIcon },
  ];

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[200] bg-[var(--notion-bg)] flex flex-col overflow-y-auto">
        <ScreenHeader onBack={panel === 'hub' ? onClose : () => setPanel('hub')} title={panel === 'hub' ? 'Settings' : PANEL_TITLES[panel] || 'Settings'} />
        <div className="p-4 flex-1">
          {panel === 'hub' ? (
            <div className="flex flex-col bg-[var(--notion-bg)] border border-[var(--notion-border)] rounded-lg overflow-hidden divide-y divide-[var(--notion-border)]">
              {navItems.map(item => (
                <HubRow
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setPanel(item.id)}
                />
              ))}
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[1000px] h-[85vh] bg-[var(--notion-bg)] rounded-xl shadow-2xl flex overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--notion-text-dim)] hover:text-[var(--notion-text-main)] hover:bg-[var(--notion-bg-hover)] rounded-md transition-colors border-none bg-transparent cursor-pointer z-10"
          aria-label="Close settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Sidebar */}
        <div className="w-[240px] flex-shrink-0 bg-[var(--ds-background-200)] border-r border-[var(--notion-border)] py-6 flex flex-col h-full overflow-y-auto">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-[var(--color-brand)] flex items-center justify-center text-white text-[11px] font-bold">
                {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="text-[14px] font-medium text-[var(--notion-text-main)] truncate">
                {displayName || 'Account'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-[2px] px-2">
            <div className="px-3 pb-1 pt-4">
              <span className="text-[11px] font-semibold text-[var(--notion-text-dim)] uppercase tracking-wider">Account</span>
            </div>
            {navItems.slice(0, 1).map(item => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-[14px] transition-colors border-none cursor-pointer ${
                  panel === item.id
                    ? 'bg-[var(--notion-bg-hover)] text-[var(--notion-text-main)] font-medium'
                    : 'bg-transparent text-[var(--notion-text-dim)] hover:bg-[var(--notion-bg-hover)] hover:text-[var(--notion-text-main)]'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            ))}

            <div className="px-3 pb-1 pt-4">
              <span className="text-[11px] font-semibold text-[var(--notion-text-dim)] uppercase tracking-wider">Workspace</span>
            </div>
            {navItems.slice(1, 2).map(item => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-[14px] transition-colors border-none cursor-pointer ${
                  panel === item.id
                    ? 'bg-[var(--notion-bg-hover)] text-[var(--notion-text-main)] font-medium'
                    : 'bg-transparent text-[var(--notion-text-dim)] hover:bg-[var(--notion-bg-hover)] hover:text-[var(--notion-text-main)]'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            ))}

            <div className="px-3 pb-1 pt-4">
              <span className="text-[11px] font-semibold text-[var(--notion-text-dim)] uppercase tracking-wider">Preferences</span>
            </div>
            {navItems.slice(2).map(item => (
              <button
                key={item.id}
                onClick={() => setPanel(item.id)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-[14px] transition-colors border-none cursor-pointer ${
                  panel === item.id
                    ? 'bg-[var(--notion-bg-hover)] text-[var(--notion-text-main)] font-medium'
                    : 'bg-transparent text-[var(--notion-text-dim)] hover:bg-[var(--notion-bg-hover)] hover:text-[var(--notion-text-main)]'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[var(--notion-bg)] overflow-y-auto">
          <div className="max-w-[700px] mx-auto px-10 py-12 pb-24">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}