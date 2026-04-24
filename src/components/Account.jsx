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
