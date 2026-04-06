import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  ButtonGroup,
  Chip,
  Switch,
  Separator,
  Tabs,
  Tab
} from "@heroui/react";
import SyncSettings from './settings/SyncSettings';
import PageHeader from './PageHeader';

export default function Settings({ settings, onUpdate, onClearAll, onDownloadSongs, songCount, setlistCount, syncState, onSyncStateChange, onSyncNow }) {
  const [detectingKey, setDetectingKey] = useState(null); // 'next' | 'prev' | null

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

  const sectionLabelClass = "text-xs font-bold text-default-400 uppercase tracking-widest mb-3 px-1";

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <PageHeader title="Settings" />

      <div className="px-6 max-w-md space-y-8 mt-4">
        {/* Appearance */}
        <section>
          <h3 className={sectionLabelClass}>Appearance</h3>
          <Card className="bg-content1 border-none shadow-sm">
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Theme</span>
                <ButtonGroup size="sm" variant="flat">
                  <Button
                    className={settings.theme === 'dark' ? "bg-primary text-primary-foreground font-bold" : ""}
                    onPress={() => update('theme', 'dark')}
                  >Dark</Button>
                  <Button
                    className={settings.theme === 'light' ? "bg-primary text-primary-foreground font-bold" : ""}
                    onPress={() => update('theme', 'light')}
                  >Light</Button>
                </ButtonGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Default Columns</span>
                <ButtonGroup size="sm" variant="flat">
                  {['auto', 1, 2].map(v => (
                    <Button
                      key={v}
                      className={settings.defaultColumns === v ? "bg-primary text-primary-foreground font-bold" : ""}
                      onPress={() => update('defaultColumns', v)}
                    >
                      {v === 'auto' ? 'Auto' : `${v}col`}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Default Font Size</span>
                <ButtonGroup size="sm" variant="flat">
                  {['S', 'M', 'L'].map(s => (
                    <Button
                      key={s}
                      className={settings.defaultFontSize === s ? "bg-primary text-primary-foreground font-bold" : ""}
                      onPress={() => update('defaultFontSize', s)}
                    >{s}</Button>
                  ))}
                </ButtonGroup>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Display Modes */}
        <section>
          <h3 className={sectionLabelClass}>Display Modes</h3>
          <Card className="bg-content1 border-none shadow-sm">
            <CardContent className="p-4 space-y-6">
              <div className="space-y-3">
                <span className="text-sm font-semibold block">Role View</span>
                <Tabs
                  aria-label="Display Role"
                  selectedKey={settings.displayRole}
                  onSelectionChange={(key) => update('displayRole', key)}
                  variant="flat"
                  fullWidth
                >
                  <Tab key="leader" title="Full" />
                  <Tab key="vocalist" title="Vocalist" />
                  <Tab key="drummer" title="Drummer" />
                </Tabs>
                <p className="text-[10px] text-default-400 italic px-1">
                  {settings.displayRole === 'leader' && "Shows everything: chords, lyrics, and tabs."}
                  {settings.displayRole === 'vocalist' && "Hides chords and tabs. Focuses on lyrics."}
                  {settings.displayRole === 'drummer' && "Shows song structure and section cues only."}
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <span className="text-sm font-semibold block">Repeat Sections</span>
                <Tabs
                  aria-label="Duplicate Sections"
                  selectedKey={settings.duplicateSections}
                  onSelectionChange={(key) => update('duplicateSections', key)}
                  variant="flat"
                  fullWidth
                >
                  <Tab key="full" title="Full" />
                  <Tab key="first" title="1st Only" />
                </Tabs>
                <p className="text-[10px] text-default-400 italic px-1">
                  {settings.duplicateSections === 'full' && "Renders every section in the order they occur."}
                  {settings.duplicateSections === 'first' && "Collapses repeated sections (e.g. only show first Chorus)."}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Features */}
        <section>
          <h3 className={sectionLabelClass}>Interactivity</h3>
          <Card className="bg-content1 border-none shadow-sm">
            <CardContent className="p-4 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Inline Notes</span>
                  <span className="text-xs text-default-400">Show performance cues</span>
                </div>
                <Switch
                  isSelected={settings.showInlineNotes !== false}
                  onValueChange={(v) => update('showInlineNotes', v)}
                />
              </div>
              {settings.showInlineNotes !== false && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-default-500 uppercase">Marker Style</span>
                  <ButtonGroup size="sm" variant="flat" fullWidth>
                    {[
                      { key: 'none', label: 'None' },
                      { key: 'dashes', label: '- - -' },
                      { key: 'dots', label: '\u00B7 \u00B7 \u00B7' },
                      { key: 'arrow', label: '\u2500\u2500\u25B8' },
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        onPress={() => update('inlineNoteStyle', key)}
                        className={`font-mono ${settings.inlineNoteStyle === key ? "bg-primary text-primary-foreground font-bold" : ""}`}
                      >
                        {label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              )}
              <Separator />
              <div className="space-y-4">
                <span className="text-sm font-semibold block">Pedal Mapping</span>
                <div className="space-y-2">
                  {[
                    { field: 'pedalNext', label: 'Next Song' },
                    { field: 'pedalPrev', label: 'Previous Song' },
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-center justify-between px-3 py-2 bg-default-50 rounded-lg border border-divider">
                      <span className="text-xs text-default-600">{label}</span>
                      <Button
                        size="sm"
                        variant="flat"
                        color={detectingKey === field ? "warning" : "default"}
                        onPress={() => handleDetectKey(field)}
                        className="font-mono text-[11px]"
                      >
                        {detectingKey === field ? 'Press a key...' : settings[field]}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <SyncSettings
          syncState={syncState || { state: 'idle', lastSync: null, provider: null }}
          onSyncStateChange={onSyncStateChange}
          onSyncNow={onSyncNow}
        />

        {/* Data & About */}
        <section className="space-y-4 pb-8">
          <h3 className={sectionLabelClass}>Data Management</h3>
          <Card className="bg-content1 border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{songCount} songs</span>
                  <span className="text-xs text-default-400">{setlistCount} setlists</span>
                </div>
                {onDownloadSongs && songCount > 0 && (
                  <Button size="sm" variant="flat" onPress={onDownloadSongs} className="font-bold">
                    Export All .md
                  </Button>
                )}
              </div>
              <Button
                color="danger"
                variant="flat"
                className="w-full font-bold"
                onPress={() => { if (confirm('Delete ALL songs and setlists? This cannot be undone.')) onClearAll(); }}
              >
                Clear All Local Data
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-content2/50 border-none shadow-none mt-6 text-foreground">
            <CardContent className="p-4">
              <h4 className="text-sm font-bold mb-1">Setlists MD</h4>
              <p className="text-xs text-default-500 leading-relaxed">
                Offline-first chord chart app for worship teams.
                Your data is stored locally and can be synced with your choice of cloud provider.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
