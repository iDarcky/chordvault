import { useState } from 'react';
import SyncSettings from './settings/SyncSettings';
import PageHeader from './PageHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Separator } from './ui/Separator';
import { useConfirm } from './ui/use-confirm';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold px-2">
      {title}
    </h2>
    <Card className="flex flex-col p-0 overflow-hidden divide-y divide-[var(--ds-gray-400)] border-[var(--ds-gray-400)]">
      {children}
    </Card>
  </section>
);

const Row = ({ label, children, description }) => (
  <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--ds-background-100)]">
    <div className="flex flex-col">
      <span className="text-copy-14 text-[var(--ds-gray-1000)] font-medium">{label}</span>
      {description && <span className="text-copy-13 text-[var(--ds-gray-700)]">{description}</span>}
    </div>
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      {children}
    </div>
  </div>
);

export default function Settings({
  settings,
  onUpdate,
  onClearAll,
  onDownloadSongs,
  songCount,
  setlistCount,
  syncState,
  onSyncStateChange,
  onSyncNow,
  onDesign,
  onHelp
}) {
  const [detectingKey, setDetectingKey] = useState(null);
  const [confirm, confirmElement] = useConfirm();

  const update = (key, value) => onUpdate({ ...settings, [key]: value });

  const handleClearAll = async () => {
    const ok = await confirm({
      title: 'Delete ALL data?',
      description: 'This permanently removes every song and setlist from this device.',
      confirmLabel: 'Delete everything',
      variant: 'error',
    });
    if (ok) onClearAll();
  };

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
    <div className="min-h-screen material-page pb-8">
      {confirmElement}
      <PageHeader title="Settings" />

      <div className="a4-container py-10 flex flex-col gap-12">

        {/* Profile */}
        <Section title="Profile">
          <Row label="Your Name" description="Used in the dashboard greeting.">
            <input
              type="text"
              value={settings.userName || ''}
              onChange={e => update('userName', e.target.value)}
              placeholder="Guest"
              className="h-8 px-3 rounded-lg border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-copy-14 text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-600)] outline-none focus:border-[var(--ds-gray-600)] transition-colors w-40"
            />
          </Row>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme" description="Switch between light and dark mode.">
            <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg">
              {['dark', 'light'].map(t => (
                <Button
                  key={t}
                  size="sm"
                  variant={settings.theme === t ? 'secondary' : 'ghost'}
                  onClick={() => update('theme', t)}
                  className={settings.theme === t ? "bg-[var(--ds-background-100)] shadow-sm" : "text-[var(--ds-gray-900)]"}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </Row>
          <Row label="Library Layout" description="Number of columns for the library view.">
            <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg">
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
            <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg">
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
        />

        {/* Tools */}
        <Section title="Tools">
          <Row label="Help & Getting Started" description="Learn how to use Setlists MD.">
            <Button size="sm" variant="brand" className="font-bold" onClick={onHelp}>Open Guide</Button>
          </Row>
          <Row label="Design System" description="Preview application UI components.">
            <Button size="sm" onClick={onDesign}>Open Showcase</Button>
          </Row>
          <Row label="Data Management" description={`${songCount} songs, ${setlistCount} setlists saved.`}>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={onDownloadSongs}>Download All</Button>
              <Button size="sm" variant="error" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </Row>
        </Section>

        {/* About */}
        <div className="px-2 py-4 flex flex-col gap-2">
          <h1 className="text-heading-20 text-[var(--ds-gray-1000)] m-0">Setlists MD</h1>
          <p className="text-copy-14 text-[var(--ds-gray-700)] leading-relaxed max-w-sm">
            A minimalist, offline-first chord chart app built for speed.
            Your songs belong to you as simple markdown files.
          </p>
          <div className="mt-4 flex gap-4 text-label-12 text-[var(--ds-gray-900)] font-medium">
            <span>v1.2.0</span>
            <span className="text-[var(--ds-gray-400)]">•</span>
            <a href="#" className="hover:text-[var(--ds-gray-1000)] transition-colors underline-offset-4 underline decoration-[var(--ds-gray-400)]">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
