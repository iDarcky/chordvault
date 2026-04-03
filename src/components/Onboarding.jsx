import { useState } from 'react';

const ONBOARDING_STEPS = [
  {
    title: 'Your Music, Your Way',
    description: 'Create and edit charts using a simple markdown format. Chords go in [brackets] and lyrics follow.',
    icon: '\uD83D\uDCDD',
    color: '#a63446',
  },
  {
    title: 'Transpose Anywhere',
    description: 'Instant transposition and capo support. Change keys for your entire team in seconds.',
    icon: '\u266B',
    color: '#e2a832',
  },
  {
    title: 'Live Mode',
    description: 'Smooth, focus-oriented display for rehearsals and services. Multi-column and custom font sizes.',
    icon: '\u25B6',
    color: '#a63446',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
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
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--surface)',
        borderRadius: 24,
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          margin: '0 auto 24px',
          color: current.color,
        }}>
          {current.icon}
        </div>

        <h2 style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 500,
          color: 'var(--text-bright)',
        }}>
          {current.title}
        </h2>

        <p style={{
          margin: '12px 0 0',
          fontSize: 16,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          fontFamily: 'var(--fb)',
        }}>
          {current.description}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          margin: '32px 0',
        }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? 'var(--accent)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--fb)',
          }}
        >
          {step === ONBOARDING_STEPS.length - 1 ? "Let's Go!" : 'Continue'}
        </button>
      </div>
    </div>
  );
}
