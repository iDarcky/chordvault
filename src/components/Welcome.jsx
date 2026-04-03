import { useRef } from 'react';

export default function Welcome({ onGetStarted, onImport }) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImport(text);
    }
    e.target.value = '';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Zen-Modern Branding */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 48,
      }}>
        <div style={{
          width: 14,
          height: 14,
          background: 'var(--accent)',
          borderRadius: 2,
        }} />
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: '-0.04em',
          color: 'var(--text-bright)',
        }}>
          ChordVault
        </h1>
      </div>

      <div style={{ maxWidth: 360, textAlign: 'center' }}>
        <p style={{
          fontSize: 18,
          color: 'var(--text)',
          fontFamily: 'var(--fb)',
          lineHeight: 1.5,
          marginBottom: 12,
        }}>
          Modern chord charts for worship teams.
        </p>
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          fontFamily: 'var(--fb)',
          lineHeight: 1.6,
        }}>
          Offline-first. Portable markdown files.
          Built for focus and clarity.
        </p>
      </div>

      <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 280 }}>
        <button
          onClick={onGetStarted}
          style={{
            padding: '14px',
            borderRadius: 8,
            background: 'var(--text-bright)',
            color: 'var(--bg)',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--fb)',
          }}
        >
          Get Started
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          style={{
            padding: '14px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--fb)',
          }}
        >
          Import .md files
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />
    </div>
  );
}
