import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import PageHeader from './PageHeader';
import SyncStatus from './SyncStatus';
import SyncSettings from './settings/SyncSettings';

export default function Settings({
  settings, onUpdate, onClearAll, onDownloadSongs,
  songCount, setlistCount, syncState, onSyncStateChange, onSyncNow
}) {
  const updateSetting = (key, val) => onUpdate({ ...settings, [key]: val });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Settings" />

      <div className="px-6 pb-24 space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1 font-mono">
            Appearance
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-accents-2">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Theme</div>
                  <div className="text-xs text-accents-4">System, light, or dark mode</div>
                </div>
                <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2">
                  {['system', 'light', 'dark'].map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSetting('theme', t)}
                      className={`px-3 py-1 text-[11px] font-bold uppercase rounded-geist transition-all ${
                        settings.theme === t
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-accents-4 hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sync */}
        <section>
          <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1 font-mono">
            Sync & Cloud
          </h2>
          <Card>
            <CardContent className="p-6">
              <SyncSettings
                syncState={syncState}
                onSyncStateChange={onSyncStateChange}
                onSyncNow={onSyncNow}
              />
            </CardContent>
          </Card>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-semibold text-accents-5 uppercase tracking-wider mb-4 px-1 font-mono">
            Data
          </h2>
          <div className="space-y-4">
            <Card className="bg-accents-1/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-bold text-foreground">{songCount}</span> songs &middot; <span className="font-bold text-foreground">{setlistCount}</span> setlists
                </div>
                <Button variant="secondary" size="sm" onClick={onDownloadSongs}>
                  Export All (.md)
                </Button>
              </CardContent>
            </Card>

            <Button
              variant="error"
              className="w-full h-11 font-bold tracking-widest text-[11px]"
              onClick={() => {
                if (confirm('Erase ALL local data? This cannot be undone.')) onClearAll();
              }}
            >
              CLEAR ALL LOCAL DATA
            </Button>
          </div>
        </section>

        {/* About */}
        <div className="text-center pt-8">
          <div className="text-lg font-black tracking-tighter text-foreground mb-1">
            Setlists MD
          </div>
          <div className="text-[10px] font-mono text-accents-3 uppercase tracking-widest">
            Version 2.0.0 &bull; 2026.04.04
          </div>
        </div>
      </div>
    </div>
  );
}
