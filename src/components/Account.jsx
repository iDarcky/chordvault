import PageHeader from './PageHeader';
import {
  Greeting,
  AccountSummary,
  PlanLabel,
  UpgradePill,
  CreateAccountButton,
  StatCards,
} from './account/AccountPanel';

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
  const updateName = (value) => onUpdate({ ...settings, userName: value });

  return (
    <div data-theme-variant="modes" className="min-h-screen pb-8">
      <PageHeader title="Account" />

      <div className="a4-container py-10 flex flex-col gap-6">
        <Greeting displayName={displayName} tone="modes" />
        <AccountSummary
          isSignedIn={isSignedIn}
          displayEmail={displayEmail}
          onSignOut={onSignOut}
          tone="modes"
        />
        <div className="modes-card p-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-copy-14 text-[var(--modes-text)] font-medium">Your Name</span>
            <span className="text-copy-13 text-[var(--modes-text-muted)]">Used in the dashboard greeting.</span>
          </div>
          <input
            type="text"
            value={settings?.userName || ''}
            onChange={e => updateName(e.target.value)}
            placeholder="Guest"
            className="h-8 px-3 rounded-lg border border-[var(--modes-border)] bg-[var(--modes-surface-strong)] text-copy-14 text-[var(--modes-text)] placeholder:text-[var(--modes-text-dim)] outline-none focus:border-[var(--color-brand)] transition-colors mt-2 sm:mt-0 sm:w-40"
          />
        </div>
        <div className="modes-card-strong p-6 flex flex-col gap-4">
          <PlanLabel plan={plan} tone="modes" />
          <UpgradePill onUpgrade={onUpgrade} />
          {!isSignedIn && (
            <CreateAccountButton onCreateAccount={onCreateAccount} tone="modes" />
          )}
        </div>
        <StatCards songCount={songCount} setlistCount={setlistCount} tone="modes" />
      </div>
    </div>
  );
}
