import { cn } from '../lib/utils';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import Card from './ui/Card';
import SyncSettings from './settings/SyncSettings';

export default function Settings({
  settings, onUpdate, onClearAll, onDownloadSongs,
  songCount, setlistCount, syncState, onSyncStateChange, onSyncNow
}) {
  const toggleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : 'light';
    onUpdate({ ...settings, theme: next });
  };

  const updateSetting = (key, val) => {
    onUpdate({ ...settings, [key]: val });
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Settings" />

      <div className="px-6 py-4 space-y-8 max-w-2xl mx-auto pb-32">
        {/* Appearance */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">Appearance</h2>
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Dark Mode</div>
                <div className="text-xs text-[var(--accents-5)]">Toggle between light and dark themes</div>
              </div>
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--geist-foreground)] focus:ring-offset-2",
                  settings.theme === 'dark' ? "bg-brand" : "bg-[var(--accents-2)]"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  settings.theme === 'dark' ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </Card>
        </section>

        {/* Sync Settings */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">Cloud Sync</h2>
          <SyncSettings
            syncState={syncState}
            onSyncStateChange={onSyncStateChange}
            onSyncNow={onSyncNow}
          />
        </section>

        {/* Display Preferences */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">Chart Display</h2>
          <Card className="p-4 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Default Columns (Desktop)</label>
                <div className="flex gap-2">
                  {[1, 2].map(n => (
                    <Button
                      key={n}
                      variant={settings.defaultColumns === n ? 'primary' : 'secondary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => updateSetting('defaultColumns', n)}
                    >
                      {n} Column{n > 1 ? 's' : ''}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Default Font Size</label>
                <select
                  value={settings.defaultFontSize || 14}
                  onChange={e => updateSetting('defaultFontSize', parseInt(e.target.value))}
                  className="w-full h-10 px-3 py-2 bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-button text-sm focus:ring-1 focus:ring-[var(--geist-foreground)] outline-none"
                >
                  {[10, 12, 14, 16, 18, 20, 24].map(s => (
                    <option key={s} value={s}>{s}px</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Show Inline Notes</div>
                  <div className="text-[10px] text-[var(--accents-5)]">Display notes like [Drums only]</div>
                </div>
                <button
                  onClick={() => updateSetting('showInlineNotes', !settings.showInlineNotes)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--geist-foreground)] focus:ring-offset-2",
                    settings.showInlineNotes !== false ? "bg-brand" : "bg-[var(--accents-2)]"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    settings.showInlineNotes !== false ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          </Card>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 px-1">Data & Export</h2>
          <Card className="p-4 space-y-4">
            <div className="flex flex-col gap-3">
              <Button variant="secondary" onClick={onDownloadSongs} className="justify-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export all songs (.md)
              </Button>
              <div className="pt-2">
                <Button variant="danger" onClick={() => {
                  if (confirm('Are you absolutely sure? This will delete ALL songs and setlists locally.')) {
                    onClearAll();
                  }
                }} className="w-full">
                  Clear Local Storage
                </Button>
              </div>
            </div>
            <div className="text-[10px] text-center text-[var(--accents-4)] font-mono">
              Library: {songCount} songs, {setlistCount} setlists
            </div>
          </Card>
        </section>

        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Setlists MD v1.0.0</div>
          <div className="text-[10px] text-[var(--accents-4)] mt-1">Inspired by Geist</div>
        </div>
      </div>
    </div>
  );
}
