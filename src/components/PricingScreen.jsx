import { useState } from 'react';
import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SegmentedControl } from './ui/SegmentedControl';
import { supabase } from '../auth/supabase';
import { useAuth } from '../auth/useAuth';

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Pull a personalized one-liner based on the onboarding quiz answers so
// the upsell speaks directly to the user instead of reading like a generic
// pricing page.
function buildPersonalHook({ instruments = [], useCase }) {
  if (instruments.includes('guitar')) {
    return "We'll pull tabs straight from Ultimate Guitar — bring your existing songbook in minutes.";
  }
  if (instruments.includes('piano') || instruments.includes('keys')) {
    return 'ChordPro and plain-text scores convert into clean Setlists.md charts automatically.';
  }
  if (instruments.includes('vocals')) {
    return 'Your transpositions sync the moment you set them — every device shows the same key.';
  }
  if (instruments.includes('drums')) {
    return 'Stage layouts that keep your section counts and feel-marks in sight, on every device.';
  }
  if (useCase === 'sunday') {
    return "Plan Sunday's setlist on one device, run the band rehearsal on another. Done.";
  }
  if (useCase === 'band') {
    return "Workspaces let your whole band see the same charts in real time during rehearsals.";
  }
  return 'Your library follows you to every device, with end-to-end encryption.';
}

function buildTiers({ billing }) {
  const isYear = billing === 'yearly';
  return [
    {
      id: 'free',
      name: 'Free Forever',
      price: '$0',
      interval: '',
      tagline: 'For solo musicians and tinkerers',
      featured: false,
      features: [
        'Full editor (Visual, Form, Raw)',
        'Local storage on every device',
        'Bring your own cloud (Drive, Dropbox, OneDrive)',
        'ZIP import & export',
      ],
      cta: "I'm all set",
      ctaVariant: 'secondary',
      ctaAction: 'free',
    },
    {
      id: 'private',
      name: 'Private Sync',
      price: isYear ? '$30' : '$3',
      interval: isYear ? '/year' : '/month',
      altPrice: isYear ? 'or $3/mo' : 'or $30/yr — save 17%',
      tagline: 'For worship leaders and band members',
      featured: true,
      features: [
        'Setlists.md Cloud — instant sync, no Drive setup',
        'End-to-end encryption (only you can read your files)',
        'Smart Import — Ultimate Guitar, ChordPro, plain text',
        '30-day version history (undo accidental deletions)',
        'Everything in Free',
      ],
      cta: 'Continue → Sign in',
      ctaVariant: 'brand',
      ctaAction: 'private',
    },
    {
      id: 'team',
      name: 'Team Sync',
      price: isYear ? '$80' : '$8',
      interval: isYear ? '/year' : '/month',
      altPrice: isYear ? 'or $8/mo' : 'or $80/yr — save 17%',
      tagline: 'For churches and bands',
      featured: false,
      features: [
        'Workspaces — separate "Sunday Service" and "Youth Band" libraries',
        'Roles — Admin, Editor, Read-Only',
        'Live Leader Mode — real-time page turns and key changes',
        'Everything in Private Sync',
      ],
      cta: 'Talk to us',
      ctaVariant: 'secondary',
      ctaAction: 'team',
    },
  ];
}

export default function PricingScreen({ onBack, onSignIn, settings }) {
  const { user } = useAuth();
  const [billing, setBilling] = useState('yearly');
  const [email, setEmail] = useState(user?.email || '');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const tiers = buildTiers({ billing });
  const personalHook = buildPersonalHook({
    instruments: settings?.quizInstruments || [],
    useCase: settings?.quizUseCase,
  });

  const handleTierAction = (action) => {
    if (action === 'private') {
      onSignIn?.();
      return;
    }
    if (action === 'team') {
      window.location.href = 'mailto:hello@setlists.md?subject=Team%20Sync%20interest';
      return;
    }
    // Free — just go back to the app.
    onBack?.();
  };

  const submitWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Sign-up is temporarily unavailable.');
      const { error: insertErr } = await supabase
        .from('pro_waitlist')
        .insert({ email: email.trim().toLowerCase() });
      if (insertErr && insertErr.code !== '23505') throw insertErr;
      setJoined(true);
    } catch (err) {
      setError(err.message || 'Could not join the waitlist.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme-variant="modes" className="h-[100dvh] flex flex-col overflow-y-auto">
      <ScreenHeader onBack={onBack} title="Setlists.md plans" />

      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10 pb-20">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {/* Hero */}
          <div className="modes-card-strong p-6 sm:p-8 flex flex-col gap-3 text-center">
            <h1 className="text-heading-32 font-bold text-[var(--modes-text)] m-0 leading-tight">
              Pick the plan that fits your stage.
            </h1>
            <p className="text-copy-15 text-[var(--modes-text-muted)] m-0 max-w-lg mx-auto">
              {personalHook}
            </p>

            <div className="mt-4 flex justify-center">
              <SegmentedControl
                value={billing}
                onValueChange={setBilling}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly · save 17%' },
                ]}
              />
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map(tier => (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-5 flex flex-col gap-4 ${tier.featured ? 'modes-card-strong' : 'modes-card'}`}
                style={tier.featured ? {
                  borderColor: 'var(--color-brand)',
                  boxShadow: '0 0 0 1px var(--color-brand), 0 8px 32px var(--color-brand-border)',
                } : {}}
              >
                {tier.featured && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-label-11 font-semibold uppercase tracking-widest"
                    style={{ background: 'var(--color-brand)', color: 'white' }}
                  >
                    Most popular
                  </div>
                )}

                <div>
                  <div className="text-copy-15 font-semibold text-[var(--modes-text)]">{tier.name}</div>
                  <div className="text-label-12 text-[var(--modes-text-muted)] mt-0.5">{tier.tagline}</div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-heading-32 font-bold text-[var(--modes-text)]">{tier.price}</span>
                  {tier.interval && (
                    <span className="text-copy-14 text-[var(--modes-text-muted)]">{tier.interval}</span>
                  )}
                </div>
                {tier.altPrice && (
                  <div className="text-label-11 text-[var(--modes-text-dim)] -mt-3">{tier.altPrice}</div>
                )}

                <div className="flex flex-col gap-2.5">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-copy-13 text-[var(--modes-text)]">
                      <div
                        className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          background: tier.featured ? 'var(--color-brand)' : 'var(--modes-surface-strong)',
                          color: tier.featured ? 'white' : 'var(--color-brand)',
                        }}
                      >
                        {CHECK}
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={tier.ctaVariant}
                  size="md"
                  onClick={() => handleTierAction(tier.ctaAction)}
                  className="mt-2 w-full"
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Early access — billing isn't live yet, capture intent */}
          <div className="modes-card p-5">
            <div className="text-label-11 font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              Early access
            </div>
            <h3 className="text-heading-18 text-[var(--modes-text)] m-0 mb-1 font-semibold">
              Billing goes live in v1.1
            </h3>
            <p className="text-copy-13 text-[var(--modes-text-muted)] m-0 mb-4">
              Drop your email — first 200 sign-ups get 50% off year one and a private slack channel with the team.
            </p>

            {joined ? (
              <div className="text-copy-14 text-[var(--modes-text)]">
                You're on the list. We'll email <strong>{email}</strong> the moment Pro ships.
              </div>
            ) : (
              <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1"
                />
                <Button type="submit" variant="brand" disabled={busy || !email}>
                  {busy ? 'Joining…' : 'Notify me'}
                </Button>
              </form>
            )}
            {error && (
              <div className="text-copy-13 mt-2 px-3 py-2 rounded-lg" style={{ background: 'var(--ds-red-100)', color: 'var(--ds-red-1000)' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
