import { useState } from 'react';
import SyncSettings from './settings/SyncSettings';
import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';

const Section = ({ title, subtitle, children }) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1 px-2">
      <h2 className="text-label-12 text-[var(--modes-text-dim)] uppercase tracking-wider font-semibold m-0">
        {title}
      </h2>
      {subtitle && (
        <p className="text-copy-13 text-[var(--modes-text-muted)] m-0">{subtitle}</p>
      )}
    </div>
    <div className="modes-card flex flex-col p-0 overflow-hidden divide-y" style={{ borderColor: 'var(--modes-border)' }}>
      {children}
    </div>
  </section>
);

const Row = ({ label, children, description }) => (
  <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-col">
      <span className="text-copy-14 text-[var(--modes-text)] font-medium">{label}</span>
      {description && <span className="text-copy-13 text-[var(--modes-text-muted)]">{description}</span>}
    </div>
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      {children}
    </div>
  </div>
);

export default function Settings({
  settings,
  onUpdate,
  onBack,
  onClearAll,
  onDownloadSongs,
  songCount,
  setlistCount,
  syncState,
  onSyncStateChange,
  onSyncNow,
  onRequestSignIn,
  onDesign,
  onHelp,
  isSignedIn = false,
  displayName = '',
}) {
  const [detectingKey, setDetectingKey] = useState(null);

  const update = (key, value) => onUpdate({ ...settings, [key]: value });

  const handleDetectKey = (field) => {
    setDetectingKey(field);
    const handler = (e) => {
      e.preventDefault();
      update(field, e.code);
      setDetectingKey(null);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('keydown', handler);
  };

  return (
    <div data-theme-variant="modes" className="h-[100dvh] flex flex-col overflow-y-auto">
      <ScreenHeader onBack={onBack} title="Preferences" />

      <div className="a4-container py-10 pb-20 flex flex-col gap-12">

        {/* Appearance */}
        <Section
          title="Appearance"
          subtitle={isSignedIn
            ? 'Synced to your account — changes follow you across devices.'
            : 'Sign in to sync these preferences to every device you use.'}
        >
          <Row label="Theme" description="System follows your device preference.">
            <div className="flex p-1 bg-[var(--modes-surface-strong)] rounded-lg">
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
                  className={settings.theme === key ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Row>
          <Row label="Library Layout" description="Number of columns for the library view.">
            <div className="flex p-1 bg-[var(--modes-surface-strong)] rounded-lg">
              {['auto', 1, 2].map(v => (
                <Button
                  key={v}
                  size="sm"
                  variant={settings.defaultColumns === v ? 'secondary' : 'ghost'}
                  onClick={() => update('defaultColumns', v)}
                  className={settings.defaultColumns === v ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
                >
                  {v === 'auto' ? 'Auto' : `${v}col`}
                </Button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Global Chart Preferences */}
        <Section title="Chart Preferences">
          <Row label="Chart Flow" description="How sections fill when using 2 columns.">
            <div className="flex p-1 bg-[var(--modes-surface-strong)] rounded-lg">
              {[
                { key: 'columns', label: 'Top ↓ Down' },
                { key: 'rows', label: 'Left → Right' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={settings.chartLayout === key ? 'secondary' : 'ghost'}
                  onClick={() => update('chartLayout', key)}
                  className={settings.chartLayout === key ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Row>
          <Row label="Display Mode" description="Control which elements are visible by default.">
             <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg flex-wrap">
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
                  className={settings.displayRole === key ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
                >
                  {label}
                </Button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Sync */}
        <SyncSettings
          syncState={syncState || { state: 'idle', lastSync: null, provider: null }}
          onSyncStateChange={onSyncStateChange}
          onSyncNow={onSyncNow}
          onRequestSignIn={onRequestSignIn}
        />

        {/* Tools */}
        <Section title="Tools">
          <Row label="Help & Getting Started" description="Learn how to use Setlists MD.">
            <Button size="sm" variant="brand" onClick={onHelp}>Open Guide</Button>
          </Row>
          <Row label="Design System" description="Preview application UI components.">
            <Button size="sm" onClick={onDesign}>Open Showcase</Button>
          </Row>
          <Row label="Data Management" description={`${songCount} songs, ${setlistCount} setlists saved.`}>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={onDownloadSongs}>Download All</Button>
              <Button size="sm" variant="error" onClick={() => { if (confirm('Delete ALL data?')) onClearAll(); }}>
                Clear All
              </Button>
            </div>
          </Row>
        </Section>

        {/* About — the heading is the account name for signed-in users so the
            app feels personalised; falls back to the app name for guests. */}
        <div className="px-2 py-4 flex flex-col gap-2">
          <h1 className="text-heading-20 text-[var(--modes-text)] m-0">
            {isSignedIn && displayName ? displayName : 'Setlists MD'}
          </h1>
          <p className="text-copy-14 text-[var(--modes-text-muted)] leading-relaxed max-w-sm">
            A minimalist, offline-first chord chart app built for speed.
            Your songs belong to you as simple markdown files.
          </p>
          <div className="mt-4 flex gap-4 text-label-12 text-[var(--modes-text-muted)] font-medium">
            <span>v1.2.0</span>
            <span className="text-[var(--modes-text-dim)]">•</span>
            <a href="#" className="hover:text-[var(--modes-text)] transition-colors underline-offset-4 underline decoration-[var(--modes-border)]">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
