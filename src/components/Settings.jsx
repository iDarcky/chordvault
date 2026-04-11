import SyncSettings from './settings/SyncSettings';
import PageHeader from './PageHeader';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Separator } from './ui/Separator';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-label-12 text-default-600 uppercase tracking-wider font-semibold px-2">
      {title}
    </h2>
    <Card className="flex flex-col p-0 overflow-hidden divide-y divide-default-300 border-default-300">
      {children}
    </Card>
  </section>
);

const Row = ({ label, children, description }) => (
  <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between bg-content1">
    <div className="flex flex-col">
      <span className="text-copy-14 text-foreground font-medium">{label}</span>
      {description && <span className="text-copy-13 text-default-600">{description}</span>}
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
  onDesign
}) {
    const update = (key, value) => onUpdate({ ...settings, [key]: value });

  return (
    <div className="min-h-screen material-page pb-32">
      <PageHeader title="Settings" />

      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Profile */}
        <Section title="Profile">
          <Row label="Your Name" description="Used in the dashboard greeting.">
            <input
              type="text"
              value={settings.userName || ''}
              onChange={e => update('userName', e.target.value)}
              placeholder="Guest"
              className="h-8 px-3 rounded-lg border border-default-300 bg-content1 text-copy-14 text-foreground placeholder:text-default-500 outline-none focus:border-default-500 transition-colors w-40"
            />
          </Row>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme" description="Switch between light and dark mode.">
            <div className="flex p-1 bg-default-200 rounded-lg">
              {['dark', 'light'].map(t => (
                <Button
                  key={t}
                  size="sm"
                  variant={settings.theme === t ? 'secondary' : 'ghost'}
                  onClick={() => update('theme', t)}
                  className={settings.theme === t ? "bg-content1 shadow-sm" : "text-default-800"}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </Row>
          <Row label="Library Layout" description="Number of columns for the library view.">
            <div className="flex p-1 bg-default-200 rounded-lg">
              {['auto', 1, 2].map(v => (
                <Button
                  key={v}
                  size="sm"
                  variant={settings.defaultColumns === v ? 'secondary' : 'ghost'}
                  onClick={() => update('defaultColumns', v)}
                  className={settings.defaultColumns === v ? "bg-content1 shadow-sm" : "text-default-800"}
                >
                  {v === 'auto' ? 'Auto' : `${v}col`}
                </Button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Global Chart Preferences */}
        <Section title="Chart Preferences">
          <Row label="Display Mode" description="Control which elements are visible by default.">
             <div className="flex p-1 bg-default-200 rounded-lg flex-wrap">
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
                  className={settings.displayRole === key ? "bg-content1 shadow-sm" : "text-default-800"}
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

        {/* About */}
        <div className="px-2 py-4 flex flex-col gap-2">
          <h1 className="text-heading-20 text-foreground m-0">Setlists MD</h1>
          <p className="text-copy-14 text-default-600 leading-relaxed max-w-sm">
            A minimalist, offline-first chord chart app built for speed.
            Your songs belong to you as simple markdown files.
          </p>
          <div className="mt-4 flex gap-4 text-label-12 text-default-800 font-medium">
            <span>v1.2.0</span>
            <span className="text-default-400">•</span>
            <a href="#" className="hover:text-foreground transition-colors underline-offset-4 underline decoration-[var(--color-default-300)]">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
