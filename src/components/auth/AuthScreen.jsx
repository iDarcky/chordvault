import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ScreenHeader from '../ui/ScreenHeader';
import { useAuth } from '../../auth/useAuth';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13 24 13c3 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.3 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.6 2.4-7.4 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.2 39.6 16 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.3c-.5.5 6.6-4.9 6.6-14.9 0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 1c.1 1.04-.34 2.08-1.02 2.8-.74.8-1.93 1.4-3.1 1.32-.12-1.02.36-2.1 1.03-2.77.75-.8 2.05-1.38 3.1-1.35zM20.1 17.24c-.54 1.17-.8 1.7-1.5 2.73-.98 1.44-2.36 3.24-4.07 3.25-1.52.01-1.91-.99-3.97-.98-2.06.01-2.49 1-4.01.99-1.71-.02-3.02-1.65-4-3.09C-.13 16.12-.41 11.4 1.3 8.88c1.22-1.79 3.15-2.84 4.97-2.84 1.85 0 3.01 1.01 4.54 1.01 1.48 0 2.39-1.01 4.53-1.01 1.62 0 3.34.89 4.56 2.42-4 2.19-3.35 7.9.2 8.78z"/>
  </svg>
);

const APPLE_ENABLED = import.meta.env.VITE_ENABLE_APPLE_SIGNIN === 'true';

export default function AuthScreen({ onBack, onSignedIn, defaultMode = 'signin' }) {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithOtp,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    resendVerification,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState(defaultMode); // 'signin' | 'signup'
  const [emailMode, setEmailMode] = useState('magic'); // 'magic' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'info' | 'error', text }
  // Email address awaiting verification, set after a successful signup.
  // Controls rendering of the "Didn't get the email? Resend" affordance.
  const [pendingVerification, setPendingVerification] = useState(null);

  const isSignUp = mode === 'signup';
  const passwordTooShort = isSignUp && emailMode === 'password' && password.length > 0 && password.length < 8;

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ kind: 'error', text: 'Enter your email above, then tap "Forgot password?" again.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage({ kind: 'info', text: `Password reset link sent to ${email}.` });
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || 'Could not send reset email.' });
    } finally {
      setBusy(false);
    }
  };

  const handleOauth = async (fn, label) => {
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await fn();
      if (error) throw error;
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || `${label} sign-in failed.` });
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && emailMode === 'password' && password.length < 8) {
      setMessage({ kind: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (emailMode === 'magic') {
        const { error } = await signInWithOtp(email);
        if (error) throw error;
        setMessage({ kind: 'info', text: `Magic link sent to ${email}. Check your inbox.` });
        setPendingVerification(null);
      } else if (isSignUp) {
        const { error } = await signUpWithPassword(email, password, displayName);
        if (error) throw error;
        setMessage({ kind: 'info', text: `Check ${email} to confirm your account.` });
        setPendingVerification(email);
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        onSignedIn?.();
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerification) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await resendVerification(pendingVerification);
      if (error) throw error;
      setMessage({ kind: 'info', text: `Confirmation email resent to ${pendingVerification}.` });
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || 'Could not resend email.' });
    } finally {
      setBusy(false);
    }
  };

  if (!isConfigured) {
    return (
      <div data-theme-variant="modes" className="min-h-screen flex flex-col">
        <ScreenHeader onBack={onBack} title="Sign In" />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="modes-card max-w-sm p-6 text-center">
            <h2 className="text-heading-20 text-[var(--modes-text)] m-0 mb-2">Auth not configured</h2>
            <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
              This build is missing Supabase credentials. Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> in your environment to enable sign-in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme-variant="modes" className="min-h-screen flex flex-col">
      <ScreenHeader onBack={onBack} title={isSignUp ? 'Create account' : 'Sign in'} />

      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-sm flex flex-col gap-4">

          <div className="modes-card p-6 flex flex-col gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => handleOauth(signInWithGoogle, 'Google')}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>
            {APPLE_ENABLED && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={busy}
                onClick={() => handleOauth(signInWithApple, 'Apple')}
              >
                <AppleIcon />
                <span className="ml-2">Continue with Apple</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-[var(--modes-border)]" />
            <span className="text-label-12 text-[var(--modes-text-dim)] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--modes-border)]" />
          </div>

          <form onSubmit={handleEmailSubmit} className="modes-card p-6 flex flex-col gap-4">
            <div className="flex p-1 bg-[var(--modes-surface-strong)] rounded-lg">
              <button
                type="button"
                onClick={() => { setEmailMode('magic'); setMessage(null); }}
                className={`flex-1 h-8 rounded-md text-label-12 font-semibold cursor-pointer border-none transition-colors ${
                  emailMode === 'magic' ? 'bg-[var(--ds-background-100)] text-[var(--modes-text)] shadow-sm' : 'bg-transparent text-[var(--modes-text-muted)]'
                }`}
              >
                Magic link
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode('password'); setMessage(null); }}
                className={`flex-1 h-8 rounded-md text-label-12 font-semibold cursor-pointer border-none transition-colors ${
                  emailMode === 'password' ? 'bg-[var(--ds-background-100)] text-[var(--modes-text)] shadow-sm' : 'bg-transparent text-[var(--modes-text-muted)]'
                }`}
              >
                Password
              </button>
            </div>

            {isSignUp && emailMode === 'password' && (
              <label className="flex flex-col gap-1">
                <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">Name</span>
                <Input
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">Email</span>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            {emailMode === 'password' && (
              <label className="flex flex-col gap-1">
                <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">Password</span>
                <Input
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  minLength={isSignUp ? 8 : undefined}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {isSignUp && (
                  <span className={`text-label-12 mt-1 ${passwordTooShort ? 'text-[var(--ds-amber-900)]' : 'text-[var(--modes-text-dim)]'}`}>
                    At least 8 characters.
                  </span>
                )}
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={busy}
                    className="self-end mt-1 text-label-12 text-[var(--color-brand)] font-medium bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                )}
              </label>
            )}

            {message && (
              <div
                className={`text-copy-13 px-3 py-2 rounded-lg ${
                  message.kind === 'error'
                    ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]'
                    : 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-1000)]'
                }`}
              >
                {message.text}
                {pendingVerification && message.kind === 'info' && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={busy}
                    className="block mt-2 text-label-12 font-semibold underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer disabled:opacity-50"
                  >
                    Didn't get it? Resend email
                  </button>
                )}
              </div>
            )}

            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy || !email}>
              {emailMode === 'magic'
                ? 'Send magic link'
                : isSignUp
                  ? 'Create account'
                  : 'Sign in'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              disabled={busy}
              onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setMessage(null); }}
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
