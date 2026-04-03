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
        display: 'none',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 32,
        fontWeight: 500,
        marginBottom: 24,
        boxShadow: '0 8px 32px var(--accent)',
      }}>
        CV
      </div>

      {/* Title */}
      <h1 style={{
        margin: 0,
        fontSize: 32,
        fontWeight: 500,
        color: 'var(--text-bright)',
        letterSpacing: '-0.02em',
        textAlign: 'center',
      }}>
        ChordVault
      </h1>

      {/* Tagline */}
      <p style={{
        margin: '8px 0 0',
        fontSize: 16,
        color: 'var(--text-muted)',
        textAlign: 'center',
        fontFamily: 'var(--fb)',
      }}>
        Chord charts for worship teams
      </p>

      {/* Description */}
      <p style={{
        margin: '16px 0 0',
        fontSize: 14,
        color: 'var(--text-dim)',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
        fontFamily: 'var(--fb)',
      }}>
        Build chord charts, create setlists, transpose on the fly.
        Works offline on any device.
      </p>

      {/* CTA */}
      <button
        onClick={onGetStarted}
        style={{
          marginTop: 40,
          padding: '14px 48px',
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--fb)',
          boxShadow: '0 4px 16px var(--accent)',
        }}
      >
        Get Started
      </button>

      {/* Import link */}
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          marginTop: 16,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'var(--fb)',
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
