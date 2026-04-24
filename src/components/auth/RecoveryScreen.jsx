import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ScreenHeader from '../ui/ScreenHeader';
import { useAuth } from '../../auth/useAuth';

export default function RecoveryScreen({ onBack, onDone }) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && confirm === password && !busy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setMessage({ kind: 'info', text: 'Password updated. Redirecting…' });
      setTimeout(() => onDone?.(), 800);
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || 'Could not update password.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-theme-variant="modes" className="min-h-screen flex flex-col">
      <ScreenHeader onBack={onBack} title="Set new password" />
      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm modes-card p-6 flex flex-col gap-4">
          <p className="text-copy-14 text-[var(--modes-text-muted)] m-0">
            Choose a new password for your account. Must be at least 8 characters.
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">New password</span>
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {tooShort && (
              <span className="text-label-12 text-[var(--ds-amber-900)]">At least 8 characters.</span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label-12 text-[var(--modes-text-muted)] uppercase tracking-wider">Confirm password</span>
            <Input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
            {mismatch && (
              <span className="text-label-12 text-[var(--ds-amber-900)]">Passwords don't match.</span>
            )}
          </label>

          {message && (
            <div
              className={`text-copy-13 px-3 py-2 rounded-lg ${
                message.kind === 'error'
                  ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]'
                  : 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-1000)]'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={!canSubmit}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
