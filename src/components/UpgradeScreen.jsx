import { useState } from 'react';
import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { supabase } from '../auth/supabase';
import { useAuth } from '../auth/useAuth';

const FEATURES = [
  { title: 'Cloud sync', body: 'Keep your library in sync across every device via Google Drive, Dropbox, or OneDrive.' },
  { title: 'Unlimited setlists', body: 'No caps on how many services you can plan ahead.' },
  { title: 'Team sharing', body: 'Share setlists with your band. Coming in v2.' },
];

export default function UpgradeScreen({ onBack }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Signup is temporarily unavailable.');
      const { error: insertErr } = await supabase
        .from('pro_waitlist')
        .insert({ email: email.trim().toLowerCase() });
      // Ignore unique-violation — joining twice is fine from the user's POV.
      if (insertErr && insertErr.code !== '23505') throw insertErr;
      setJoined(true);
    } catch (err) {
      setError(err.message || 'Could not join the waitlist.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme-variant="modes" className="min-h-screen flex flex-col">
      <ScreenHeader onBack={onBack} title="Setlists MD Pro" />

      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-5">

          <div className="modes-card-strong p-6 flex flex-col gap-3 text-center">
            <h1 className="text-heading-24 font-bold text-[var(--modes-text)] m-0">
              Pro is on the way
            </h1>
            <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
              Billing is wired up in v1.1. Drop your email and we'll tell you
              the moment it's ready — and offer early-bird pricing.
            </p>
          </div>

          <div className="modes-card overflow-hidden divide-y" style={{ borderColor: 'var(--modes-border)' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="p-4 flex flex-col gap-1">
                <h3 className="text-heading-16 text-[var(--modes-text)] m-0 font-semibold">
                  {f.title}
                </h3>
                <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {joined ? (
            <div className="modes-card p-5 text-center flex flex-col gap-2">
              <h3 className="text-heading-16 text-[var(--modes-text)] m-0 font-semibold">
                You're on the list
              </h3>
              <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
                We'll email <strong>{email}</strong> when Pro launches.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="modes-card p-5 flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">
                  Join the waitlist
                </span>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              {error && (
                <div className="text-copy-13 px-3 py-2 rounded-lg bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]">
                  {error}
                </div>
              )}
              <Button type="submit" variant="brand" size="lg" disabled={busy || !email}>
                {busy ? 'Joining…' : 'Notify me'}
              </Button>
              <p className="text-copy-12 text-[var(--modes-text-dim)] text-center m-0">
                One email at launch. No spam. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
