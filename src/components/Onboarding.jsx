import { useState } from 'react';

const STEPS = [
  {
    icon: '\u266B',
    title: 'Your Song Library',
    description: 'All your chord charts in one place. Import .md files or create from scratch with our visual editor.',
    color: '#53796F',
  },
  {
    icon: '\u2630',
    title: 'Live Setlists',
    description: 'Build setlists for worship services. Reorder songs, set per-song transpose, and add band notes.',
    color: '#6b9e91',
  },
  {
    icon: '\u25B6',
    title: 'Play Mode',
    description: 'Full-screen chord charts with transpose, multi-column layout, and foot pedal navigation.',
    color: '#a78bfa',
  },
  {
    icon: '\u2601',
    title: 'Sync Everywhere',
    description: 'Connect Google Drive, Dropbox, or OneDrive to sync your songs across all your devices.',
    color: '#818cf8',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

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
    }}>
      {/* Skip button */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'var(--fb)',
          padding: '8px 12px',
        }}
      >
        Skip
      </button>

      {/* Illustration */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: 30,
        background: `linear-gradient(135deg, ${current.color}22, ${current.color}11)`,
        border: `1px solid ${current.color}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        marginBottom: 32,
      }}>
        {current.icon}
      </div>

      {/* Title */}
      <h2 style={{
        margin: 0,
        fontSize: 24,
        fontWeight: 700,
        color: 'var(--text-bright)',
        textAlign: 'center',
      }}>
        {current.title}
      </h2>

      {/* Description */}
      <p style={{
        margin: '12px 0 0',
        fontSize: 15,
        color: 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
        fontFamily: 'var(--fb)',
      }}>
        {current.description}
      </p>

      {/* Step dots */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginTop: 40,
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === step ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 32,
      }}>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--fb)',
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setStep(step + 1)}
          style={{
            padding: '12px 36px',
            borderRadius: 10,
            border: 'none',
            background: 'linear-gradient(135deg, #53796F, #6b9e91)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--fb)',
            boxShadow: '0 4px 16px var(--accent-border)',
          }}
        >
          {isLast ? "Let's Go" : 'Next'}
        </button>
      </div>
    </div>
  );
}
