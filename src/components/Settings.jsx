import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import PageHeader from './PageHeader';
import SyncSettings from './settings/SyncSettings';
import { cn } from '../lib/utils';

export default function Settings({
  settings, onUpdate, onClearAll, onDownloadSongs,
  songCount, setlistCount, syncState, onSyncStateChange, onSyncNow
}) {
  const updateSetting = (key, val) => onUpdate({ ...settings, [key]: val });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <PageHeader title="Settings" />

      <div className="px-6 pb-32 space-y-10 mt-6">
        {/* Appearance */}
        <section>
          <SectionHeader>Appearance</SectionHeader>
          <Card className="rounded-2xl border-accents-2 overflow-hidden shadow-none bg-accents-1/20">
            <CardContent className="p-0 divide-y divide-accents-2">
              <SettingsRow
                label="Theme"
                description="Choose your preferred color scheme"
              >
                <SegmentedControl
                  options={['system', 'light', 'dark']}
                  value={settings.theme}
                  onChange={(v) => updateSetting('theme', v)}
                />
              </SettingsRow>

              <SettingsRow
                label="Default Layout"
                description="Number of columns for chord charts"
              >
                <SegmentedControl
                  options={['auto', 1, 2]}
                  value={settings.defaultColumns}
                  onChange={(v) => updateSetting('defaultColumns', v)}
                  labels={{ 'auto': 'AUTO', 1: '1 COL', 2: '2 COL' }}
                />
              </SettingsRow>

              <SettingsRow
                label="Text Size"
                description="Default font size for charts"
              >
                <SegmentedControl
                  options={['S', 'M', 'L']}
                  value={settings.defaultFontSize}
                  onChange={(v) => updateSetting('defaultFontSize', v)}
                />
              </SettingsRow>
            </CardContent>
          </Card>
        </section>

        {/* Performance & Display */}
        <section>
          <SectionHeader>Performance & Display</SectionHeader>
          <Card className="rounded-2xl border-accents-2 overflow-hidden shadow-none bg-accents-1/20">
            <CardContent className="p-0 divide-y divide-accents-2">
              <SettingsRow
                label="Instrument Role"
                description="Optimize view for your specific role"
              >
                <select
                  value={settings.displayRole}
                  onChange={(e) => updateSetting('displayRole', e.target.value)}
                  className="bg-background border border-accents-2 rounded-geist h-8 px-3 text-xs font-bold font-mono outline-none"
                >
                  <option value="leader">WORSHIP LEADER</option>
                  <option value="vocalist">VOCALIST</option>
                  <option value="guitar">GUITARIST</option>
                  <option value="bass">BASSIST</option>
                  <option value="keys">KEYBOARDIST</option>
                  <option value="drummer">DRUMMER</option>
                </select>
              </SettingsRow>

              <SettingsRow
                label="Duplicate Sections"
                description="How repeated sections (Chorus 2, etc) appear"
              >
                <select
                  value={settings.duplicateSections}
                  onChange={(e) => updateSetting('duplicateSections', e.target.value)}
                  className="bg-background border border-accents-2 rounded-geist h-8 px-3 text-xs font-bold font-mono outline-none"
                >
                  <option value="full">FULL RENDERING</option>
                  <option value="compact">COMPACT PILL</option>
                  <option value="first">FIRST CHORDS ONLY</option>
                </select>
              </SettingsRow>

              <SettingsRow
                label="Inline Notes"
                description="Show {!notes} in the chord chart"
              >
                <div className="flex gap-2">
                  <Button
                    variant={settings.showInlineNotes ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => updateSetting('showInlineNotes', true)}
                    className="h-8 text-[10px] font-bold"
                  >
                    ON
                  </Button>
                  <Button
                    variant={!settings.showInlineNotes ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => updateSetting('showInlineNotes', false)}
                    className="h-8 text-[10px] font-bold"
                  >
                    OFF
                  </Button>
                </div>
              </SettingsRow>

              {settings.showInlineNotes && (
                <SettingsRow
                  label="Note Leader"
                  description="Style of line before inline notes"
                >
                  <SegmentedControl
                    options={['none', 'dashes', 'dots', 'arrow']}
                    value={settings.inlineNoteStyle}
                    onChange={(v) => updateSetting('inlineNoteStyle', v)}
                    labels={{ 'none': 'NONE', 'dashes': '---', 'dots': '...', 'arrow': '→' }}
                  />
                </SettingsRow>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Pedal Controls */}
        <section>
          <SectionHeader>Pedal Mapping (Experimental)</SectionHeader>
          <Card className="rounded-2xl border-accents-2 overflow-hidden shadow-none bg-accents-1/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-accents-5">Next Song / Item</div>
                <Input
                  value={settings.pedalNext}
                  onChange={(e) => updateSetting('pedalNext', e.target.value)}
                  className="w-32 h-8 text-center font-mono text-[10px] bg-background border-accents-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-accents-5">Prev Song / Item</div>
                <Input
                  value={settings.pedalPrev}
                  onChange={(e) => updateSetting('pedalPrev', e.target.value)}
                  className="w-32 h-8 text-center font-mono text-[10px] bg-background border-accents-2"
                />
              </div>
              <div className="p-3 rounded-geist bg-geist-link/5 border border-geist-link/10 text-[10px] text-geist-link leading-relaxed font-medium">
                Tip: Click the field and press your Bluetooth pedal button to map it automatically.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sync */}
        <section>
          <SectionHeader>Sync & Cloud</SectionHeader>
          <Card className="rounded-2xl border-accents-2 overflow-hidden shadow-none bg-accents-1/20 p-6">
            <SyncSettings
              syncState={syncState}
              onSyncStateChange={onSyncStateChange}
              onSyncNow={onSyncNow}
            />
          </Card>
        </section>

        {/* Data Management */}
        <section>
          <SectionHeader>Storage & Data</SectionHeader>
          <div className="space-y-4">
            <Card className="bg-accents-1 border-none shadow-none rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-accents-5 font-mono">
                  {songCount} SONGS &middot; {setlistCount} SETLISTS
                </div>
                <Button variant="secondary" size="sm" onClick={onDownloadSongs} className="bg-background h-9 border-accents-2 text-[10px] font-black uppercase tracking-widest">
                  Export Library (.md)
                </Button>
              </CardContent>
            </Card>

            <Button
              variant="secondary"
              className="w-full h-12 font-black tracking-widest text-[10px] text-geist-error hover:bg-geist-error/10 border-geist-error/30 rounded-full"
              onClick={() => {
                if (confirm('Erase ALL local data from this device? Your songs will be deleted forever unless they are in the cloud.')) onClearAll();
              }}
            >
              PURGE ALL LOCAL STORAGE
            </Button>
          </div>
        </section>

        {/* About */}
        <div className="text-center pt-10 border-t border-accents-2">
          <div className="text-2xl font-black tracking-tighter text-foreground mb-1 italic">
            Setlists MD
          </div>
          <div className="text-[9px] font-mono text-accents-3 uppercase tracking-[0.3em]">
            PRO PERFORMANCE EDITION &bull; V2.5.0
          </div>
          <div className="mt-4 flex justify-center gap-4">
             <Badge variant="outline" className="text-[9px] font-bold border-accents-2 text-accents-3">OFFLINE-FIRST</Badge>
             <Badge variant="outline" className="text-[9px] font-bold border-accents-2 text-accents-3">PWA READY</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <h2 className="text-[10px] font-black text-accents-4 uppercase tracking-[0.2em] mb-4 px-1 font-mono">
      {children}
    </h2>
  );
}

function SettingsRow({ label, description, children }) {
  return (
    <div className="p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-bold text-foreground tracking-tight">{label}</div>
        <div className="text-xs text-accents-4 mt-0.5 leading-relaxed">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SegmentedControl({ options, value, onChange, labels = {} }) {
  return (
    <div className="flex bg-accents-1 p-1 rounded-geist border border-accents-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "px-3 py-1.5 text-[10px] font-black uppercase rounded transition-all min-w-[50px] border-none cursor-pointer",
            value === opt
              ? "bg-background text-foreground shadow-sm ring-1 ring-accents-2"
              : "bg-transparent text-accents-4 hover:text-foreground"
          )}
        >
          {labels[opt] || opt}
        </button>
      ))}
    </div>
  );
}
