import { useState } from 'react';

const ONBOARDING_STEPS = [
  {
    title: 'Your Music, Your Way',
    description: 'Create and edit charts using a simple markdown format. Chords go in [brackets] and lyrics follow.',
    icon: '\uD83D\uDCDD',
    color: 'var(--accent)',
  },
  {
    title: 'Transpose Anywhere',
    description: 'Instant transposition and capo support. Change keys for your entire team in seconds.',
    icon: '\u266B',
    color: 'var(--warning)',
  },
  {
    title: 'Live Mode',
    description: 'Smooth, focus-oriented display for rehearsals and services. Multi-column and custom font sizes.',
    icon: '\u25B6',
    color: 'var(--accent)',
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
      border: '20px solid var(--border)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'var(--bg)',
        border: 'var(--bw) solid var(--border)',
        padding: '60px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80,
          height: 80,
          border: 'var(--bw) solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          margin: '0 auto 40px',
          color: current.color,
        }}>
          {current.icon}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
          {current.title}
        </h2>

        <p style={{
          margin: '24px 0 48px',
          fontSize: 16,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          fontWeight: 500,
        }}>
          {current.description}
        </p>

        <button
          onClick={handleNext}
          style={{
            width: '100%',
            padding: '20px',
            background: 'var(--accent)',
            fontSize: 16,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {step === ONBOARDING_STEPS.length - 1 ? "LET'S GO" : 'CONTINUE'}
        </button>
      </div>
    </div>
  );
}
