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
    color: '#457a6e',
  },
  {
    icon: '\u2601',
    title: 'Sync Everywhere',
    description: 'Connect Google Drive, Dropbox, or OneDrive to sync your songs across all your devices.',
    color: '#3a6b5f',
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
        className="text-label-13"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
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
      <h2 className="text-heading-24" style={{
        margin: 0,
        color: 'var(--text-bright)',
        textAlign: 'center',
      }}>
        {current.title}
      </h2>

      {/* Description */}
      <p className="text-copy-14" style={{
        margin: '12px 0 0',
        color: 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: 320,
        lineHeight: 1.6,
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
            className="text-button-14"
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={() => isLast ? onComplete() : setStep(step + 1)}
          className="text-button-14"
          style={{
            padding: '12px 36px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px var(--accent-border)',
          }}
        >
          {isLast ? "Let's Go" : 'Next'}
        </button>
      </div>
    </div>
  );
}
