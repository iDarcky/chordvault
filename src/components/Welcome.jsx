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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo placeholder for now */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #53796F, #6b9e91)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 24,
        boxShadow: '0 8px 32px var(--accent-border)',
      }}>
        SM
      </div>

      {/* Title */}
      <h1 className="text-heading-32" style={{
        margin: 0,
        color: 'var(--text-bright)',
        textAlign: 'center',
      }}>
        Setlists MD
      </h1>

      {/* Tagline */}
      <p className="text-copy-16" style={{
        margin: '8px 0 0',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        Chord charts for worship teams
      </p>

      {/* Description */}
      <p className="text-copy-14" style={{
        margin: '16px 0 0',
        color: 'var(--text-dim)',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
      }}>
        Build chord charts, create setlists, transpose on the fly.
        Works offline on any device.
      </p>

      {/* CTA */}
      <button
        onClick={onGetStarted}
        className="text-button-16"
        style={{
          marginTop: 40,
          padding: '14px 48px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 4px 16px var(--accent-border)',
        }}
      >
        Get Started
      </button>

      {/* Import link */}
      <button
        onClick={() => fileRef.current?.click()}
        className="text-label-13"
        style={{
          marginTop: 16,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        I already have .md files &mdash; Import
      </button>
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
