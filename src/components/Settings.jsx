import { useState } from 'react';
import SyncSettings from './settings/SyncSettings';
import PageHeader from './PageHeader';

const labelStyle = {
  className: "text-label-12-mono", color: 'var(--text-muted)',
  fontFamily: 'var(--fm)', display: 'block', marginBottom: 6,
};

const cB = {
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)',
  className: "text-label-12", cursor: 'pointer', fontWeight: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--fb)', padding: '6px 14px',
};

const activeBtn = (active) => ({
  ...cB,
  borderColor: active ? 'var(--accent)' : 'var(--border)',
  color: active ? 'var(--accent-text)' : 'var(--text-muted)',
  background: active ? 'var(--accent-soft)' : 'var(--surface)',
});

export default function Settings({ settings, onUpdate, onClearAll, onDownloadSongs, songCount, setlistCount, syncState, onSyncStateChange, onSyncNow, onDesign }) {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title="Settings" />

      <div style={{ padding: '16px 18px 80px', maxWidth: 500 }}>
        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Theme</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['dark', 'light'].map(t => (
              <button key={t} onClick={() => update('theme', t)} style={activeBtn(settings.theme === t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Default Layout */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Default Layout</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['auto', 1, 2].map(v => (
              <button key={v} onClick={() => update('defaultColumns', v)} style={activeBtn(settings.defaultColumns === v)}>
                {v === 'auto' ? 'Auto' : `${v}col`}
              </button>
            ))}
          </div>
        </div>

        {/* Default Font Size */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Default Font Size</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {['S', 'M', 'L'].map(s => (
              <button key={s} onClick={() => update('defaultFontSize', s)} style={activeBtn(settings.defaultFontSize === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Display Role / View */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>View</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { key: 'leader', label: 'Full', desc: 'Chords, lyrics, tabs' },
              { key: 'vocalist', label: 'Vocalist', desc: 'Lyrics only' },
              { key: 'drummer', label: 'Drummer', desc: 'Structure & cues' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => update('displayRole', key)}
                style={{
                  ...activeBtn(settings.displayRole === key),
                  flexDirection: 'column', alignItems: 'center', padding: '8px 14px', gap: 2,
                }}
              >
                <span style={{ fontSize: 12 }}>{label}</span>
                <span style={{ fontSize: 9, opacity: 0.6, fontWeight: 400 }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Sections */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Repeat Sections</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'full', label: 'Full', desc: 'Show every section' },
              { key: 'first', label: '1st Only', desc: 'Collapse repeats' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => update('duplicateSections', key)}
                style={{
                  ...activeBtn(settings.duplicateSections === key),
                  flexDirection: 'column', alignItems: 'center', padding: '8px 14px', gap: 2,
                }}
              >
                <span style={{ fontSize: 12 }}>{label}</span>
                <span style={{ fontSize: 9, opacity: 0.6, fontWeight: 400 }}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inline Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Inline Notes</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => update('showInlineNotes', v)} style={activeBtn(settings.showInlineNotes === v)}>
                {v ? 'Show' : 'Hide'}
              </button>
            ))}
          </div>
          {settings.showInlineNotes !== false && (
            <>
              <label style={{ ...labelStyle, marginTop: 8 }}>Leader Style</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { key: 'none', label: 'None' },
                  { key: 'dashes', label: '- - -' },
                  { key: 'dots', label: '\u00B7 \u00B7 \u00B7' },
                  { key: 'arrow', label: '\u2500\u2500\u25B8' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => update('inlineNoteStyle', key)} style={activeBtn(settings.inlineNoteStyle === key)}>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pedal Mapping */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Pedal / Keyboard Mapping</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { field: 'pedalNext', label: 'Next Song' },
              { field: 'pedalPrev', label: 'Previous Song' },
            ].map(({ field, label }) => (
              <div key={field} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <span style={{ className: "text-copy-13", color: 'var(--text)' }}>{label}</span>
                <button
                  onClick={() => handleDetectKey(field)}
                  style={{
                    ...cB,
                    background: detectingKey === field ? 'rgba(245,158,11,0.15)' : 'var(--surface)',
                    borderColor: detectingKey === field ? 'rgba(245,158,11,0.4)' : 'var(--border)',
                    color: detectingKey === field ? '#fbbf24' : 'var(--chord)',
                    fontFamily: 'var(--fm)', fontSize: 11,
                  }}
                >
                  {detectingKey === field ? 'Press a key...' : settings[field]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cloud Sync */}
        <SyncSettings
          syncState={syncState || { state: 'idle', lastSync: null, provider: null }}
          onSyncStateChange={onSyncStateChange}
          onSyncNow={onSyncNow}
        />

        {/* Data */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Data</label>
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ className: "text-copy-13", color: 'var(--text-muted)' }}>
              {songCount} song{songCount !== 1 ? 's' : ''} · {setlistCount} setlist{setlistCount !== 1 ? 's' : ''}
            </span>
            {onDownloadSongs && songCount > 0 && (
              <button onClick={onDownloadSongs} style={{
                ...cB, padding: '4px 12px', fontSize: 11,
              }}>
                Download songs
              </button>
            )}
          </div>
          <button
            onClick={() => { if (confirm('Delete ALL songs and setlists? This cannot be undone.')) onClearAll(); }}
            style={{
              ...cB, width: '100%', justifyContent: 'center',
              background: 'var(--danger-soft)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--danger)',
            }}
          >
            Clear All Data
          </button>
        </div>

        {/* Design System */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={onDesign} style={{ ...cB, width: '100%', justifyContent: 'center' }}>
            Open Design System
          </button>
        </div>

        {/* About */}
        <div style={{
          padding: '12px 14px', borderRadius: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <div style={{ className: "text-copy-13", fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4 }}>
            Setlists MD
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Free, offline-first chord chart app for worship teams.
            Songs are portable .md files.
          </div>
        </div>
      </div>
    </div>
  );
}
