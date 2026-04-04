import { useState } from 'react';

const STEPS = [
  {
    title: 'Precision Charts',
    desc: 'Write in simple markdown. We handle the formatting, transposing, and layout automatically.',
    icon: '✦',
  },
  {
    title: 'Cloud Core',
    desc: 'Securely sync your library across every device. Your team is always on the same page.',
    icon: '☁',
  },
  {
    title: 'Live Flow',
    desc: 'A distraction-free stage mode built for focus. Performance-ready, anywhere.',
    icon: '▶',
  }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="bento-card animate-in" style={{ maxWidth: 440, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'var(--accent-glow)', filter: 'blur(80px)', opacity: 0.3 }} />

        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--surface-alt)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 32px', color: 'var(--accent)' }}>
          {cur.icon}
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 16px' }}>{cur.title}</h2>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 48, fontWeight: 500 }}>{cur.desc}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 32 : 8, height: 8, borderRadius: 4, background: i === step ? 'var(--accent)' : 'var(--border)', transition: 'all 0.3s' }} />
          ))}
        </div>

        <button className="primary" onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : onComplete()} style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 15 }}>
          {step === STEPS.length - 1 ? 'LAUNCH VAULT' : 'CONTINUE'}
        </button>
      </div>
    </div>
  );
}
