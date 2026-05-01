import { useState, useEffect } from 'react';
import {
  StageGreeting,
  AccountSummary,
  PlanLabel,
  UpgradePill,
  SignInButton,
  CreateAccountButton,
  StatCards,
} from './account/AccountPanel';
import { useAuth } from '../auth/useAuth';

const NAME_MAX = 15;

export default function Account({
  settings,
  onUpdate,
  isSignedIn = false,
  displayName = 'Guest',
  displayEmail = '',
  plan = 'Free',
  songCount = 0,
  setlistCount = 0,
  onUpgrade,
  onSignIn,
  onCreateAccount,
  onSignOut,
}) {
  const { profile, updateProfile, updatePassword } = useAuth();
  // Prefer the cloud display_name so the input matches what the rest of the UI
  // shows for signed-in users; fall back to the local userName for guests.
  const savedName = (isSignedIn ? profile?.display_name : settings?.userName) || settings?.userName || '';
  const [draftName, setDraftName] = useState(savedName);

  const [newPassword, setNewPassword] = useState('');
  const [passBusy, setPassBusy] = useState(false);
  const [passMessage, setPassMessage] = useState(null);

  useEffect(() => {
    setDraftName(savedName);
  }, [savedName]);

  const dirty = draftName !== savedName;
  const saveName = async () => {
    if (!dirty) return;
    onUpdate({ ...settings, userName: draftName });
    if (isSignedIn) {
      try {
        await updateProfile({ display_name: draftName });
      } catch (err) {
        console.warn('[account] display_name sync failed:', err?.message || err);
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      setPassMessage({ kind: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPassBusy(true);
    setPassMessage(null);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      setPassMessage({ kind: 'info', text: 'Password updated successfully.' });
      setNewPassword('');
    } catch (err) {
      setPassMessage({ kind: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPassBusy(false);
    }
  };

  return (
    <div
      className="drawer-panel min-h-screen pb-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      }}
    >
      <div className="a4-container pt-6 pb-10 flex flex-col gap-6">
        <StageGreeting displayName={displayName} tone="drawer" />
        <AccountSummary
          isSignedIn={isSignedIn}
          displayEmail={displayEmail}
          onSignOut={onSignOut}
          tone="drawer"
        />
        <div
          className="rounded-xl border p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: 'var(--drawer-surface)', borderColor: 'var(--drawer-border)' }}
        >
          <div className="flex flex-col">
            <span className="text-copy-14 font-medium" style={{ color: 'var(--drawer-text)' }}>Your Name</span>
            <span className="text-copy-13" style={{ color: 'var(--drawer-text-muted)' }}>
              Up to {NAME_MAX} characters. Used in the greeting.
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <input
              type="text"
              value={draftName}
              onChange={e => setDraftName(e.target.value.slice(0, NAME_MAX))}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
              maxLength={NAME_MAX}
              placeholder="Guest"
              className="h-8 px-3 rounded-lg border outline-none transition-colors text-copy-14 w-full sm:w-40"
              style={{
                background: 'var(--drawer-surface)',
                borderColor: 'var(--drawer-border)',
                color: 'var(--drawer-text)',
              }}
            />
            <button
              onClick={saveName}
              disabled={!dirty}
              aria-label="Save name"
              className={`h-8 px-3 rounded-lg text-copy-13 font-medium border-none cursor-pointer transition-all duration-200 ease-out ${
                dirty ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={{
                background: 'var(--color-brand)',
                color: '#fff',
              }}
            >
              Save
            </button>
          </div>
        </div>
        {isSignedIn && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-4"
            style={{ background: 'var(--drawer-surface)', borderColor: 'var(--drawer-border)' }}
          >
            <div className="flex flex-col">
              <span className="text-copy-14 font-medium" style={{ color: 'var(--drawer-text)' }}>Security</span>
              <span className="text-copy-13" style={{ color: 'var(--drawer-text-muted)' }}>
                Set a password to sign in without a magic link.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="h-8 px-3 rounded-lg border outline-none transition-colors text-copy-14 w-full sm:w-48"
                style={{
                  background: 'var(--drawer-surface)',
                  borderColor: 'var(--drawer-border)',
                  color: 'var(--drawer-text)',
                }}
              />
              <button
                onClick={handleUpdatePassword}
                disabled={passBusy || !newPassword}
                className="h-8 px-3 rounded-lg text-copy-13 font-medium border-none cursor-pointer transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--color-brand)',
                  color: '#fff',
                }}
              >
                {passBusy ? 'Saving…' : 'Update'}
              </button>
            </div>
            {passMessage && (
              <div
                className={`text-copy-12 px-2 py-1 rounded ${
                  passMessage.kind === 'error'
                    ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]'
                    : 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-1000)]'
                }`}
              >
                {passMessage.text}
              </div>
            )}
          </div>
        )}
        <div
          className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ background: 'var(--drawer-surface)', borderColor: 'var(--drawer-border)' }}
        >
          <PlanLabel plan={plan} tone="drawer" />
          <UpgradePill onUpgrade={onUpgrade} />
          {!isSignedIn && (
            <>
              <SignInButton onSignIn={onSignIn} />
              <CreateAccountButton onCreateAccount={onCreateAccount} />
            </>
          )}
        </div>
        <StatCards songCount={songCount} setlistCount={setlistCount} tone="drawer" />
      </div>
    </div>
  );
}
