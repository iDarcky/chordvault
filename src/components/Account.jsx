import { useState, useEffect } from 'react';
import {
  StageGreeting,
  AccountSummary,
  PlanLabel,
  UpgradePill,
  CreateAccountButton,
  StatCards,
} from './account/AccountPanel';

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
  onCreateAccount,
  onSignOut,
}) {
  const savedName = settings?.userName || '';
  const [draftName, setDraftName] = useState(savedName);

  useEffect(() => {
    setDraftName(savedName);
  }, [savedName]);

  const dirty = draftName !== savedName;
  const saveName = () => {
    if (!dirty) return;
    onUpdate({ ...settings, userName: draftName });
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
        <div
          className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ background: 'var(--drawer-surface)', borderColor: 'var(--drawer-border)' }}
        >
          <PlanLabel plan={plan} tone="drawer" />
          <UpgradePill onUpgrade={onUpgrade} />
          {!isSignedIn && (
            <CreateAccountButton onCreateAccount={onCreateAccount} tone="drawer" />
          )}
        </div>
        <StatCards songCount={songCount} setlistCount={setlistCount} tone="drawer" />
      </div>
    </div>
  );
}
