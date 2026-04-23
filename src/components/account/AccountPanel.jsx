const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.39 5.96L20.5 10l-5.58 2.72L12 19l-2.92-6.28L3.5 10l6.11-2.04L12 2z" />
  </svg>
);

function tokens(tone) {
  const t = tone === 'drawer' ? '--drawer' : '--modes';
  return {
    surface: `var(${t}-surface)`,
    surfaceStrong: tone === 'drawer' ? `var(${t}-surface)` : `var(${t}-surface-strong)`,
    border: `var(${t}-border)`,
    text: `var(${t}-text)`,
    textMuted: `var(${t}-text-muted)`,
    textDim: `var(${t}-text-dim)`,
  };
}

export function Greeting({ displayName, tone = 'modes' }) {
  const v = tokens(tone);
  return (
    <h1
      className="text-[34px] leading-[40px] font-serif m-0 tracking-tight"
      style={{ color: v.text }}
    >
      You have a beautiful <span className="italic">library</span>,{' '}
      <span className="whitespace-nowrap">{displayName}</span>
    </h1>
  );
}

export function AccountSummary({ isSignedIn, displayEmail, onSignOut, tone = 'modes' }) {
  if (!isSignedIn) return null;
  const v = tokens(tone);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <div
          className="text-label-11 uppercase tracking-[0.15em]"
          style={{ color: v.textDim }}
        >
          Your Account
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="text-label-11 uppercase tracking-[0.15em] bg-transparent border-none p-0 cursor-pointer transition-colors"
            style={{ color: v.textMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = v.text)}
            onMouseLeave={e => (e.currentTarget.style.color = v.textMuted)}
          >
            Sign out
          </button>
        )}
      </div>
      <div className="text-copy-16 truncate" style={{ color: v.text }}>
        {displayEmail}
      </div>
    </div>
  );
}

export function PlanLabel({ plan, tone = 'modes' }) {
  const v = tokens(tone);
  return (
    <div>
      <div
        className="text-label-11 uppercase tracking-[0.15em] mb-1.5"
        style={{ color: v.textDim }}
      >
        Your Plan
      </div>
      <div className="text-copy-16" style={{ color: v.text }}>
        {plan} Plan
      </div>
    </div>
  );
}

export function UpgradePill({ onUpgrade }) {
  return (
    <button
      onClick={onUpgrade}
      className="upgrade-pill w-full h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-none relative overflow-hidden"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="text-fuchsia-700"><SparkleIcon /></span>
      <span className="text-copy-15 font-semibold bg-gradient-to-r from-amber-700 via-fuchsia-700 to-cyan-700 bg-clip-text text-transparent">
        Upgrade to Pro
      </span>
      <span className="text-fuchsia-700"><SparkleIcon /></span>
    </button>
  );
}

export function CreateAccountButton({ onCreateAccount, tone = 'modes' }) {
  const v = tokens(tone);
  return (
    <button
      onClick={onCreateAccount}
      className="w-full h-11 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-transparent border active:scale-[0.98] transition-all duration-150"
      style={{
        borderColor: v.border,
        color: v.textMuted,
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = v.surface)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span className="text-copy-14 font-medium">Create account</span>
    </button>
  );
}

export function StatCards({ songCount = 0, setlistCount = 0, tone = 'modes' }) {
  const v = tokens(tone);
  const cardStyle = {
    background: v.surface,
    borderColor: v.border,
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border p-4" style={cardStyle}>
        <div
          className="text-label-11 uppercase tracking-[0.15em]"
          style={{ color: v.textDim }}
        >
          Songs
        </div>
        <div
          className="text-heading-24 font-semibold mt-1"
          style={{ color: v.text }}
        >
          {songCount}
        </div>
      </div>
      <div className="rounded-xl border p-4" style={cardStyle}>
        <div
          className="text-label-11 uppercase tracking-[0.15em]"
          style={{ color: v.textDim }}
        >
          Setlists
        </div>
        <div
          className="text-heading-24 font-semibold mt-1"
          style={{ color: v.text }}
        >
          {setlistCount}
        </div>
      </div>
    </div>
  );
}
