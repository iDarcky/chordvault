import { useState } from 'react';
import { useTeam } from '../auth/useTeam';
import { useAuth } from '../auth/useAuth';
import ScreenHeader from './ui/ScreenHeader';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import UpgradeGate from './ui/UpgradeGate';

const TeamIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CrownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 20h20l-2-8-5 4-3-6-3 6-5-4-2 8z" />
    <path d="M5 21h14v1H5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ── Create Team form ────────────────────────────────────────────────────────

function CreateTeamForm({ onCreate }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), location: location.trim() || null });
    } catch (err) {
      setError(err.message || 'Could not create team.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-5"
        style={{ background: 'var(--ds-background-100)', border: '1px solid var(--ds-gray-400)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
        >
          <TeamIcon />
        </div>

        <div className="text-center">
          <h2 className="text-heading-24 text-[var(--ds-gray-1000)] m-0 mb-1">Create your team</h2>
          <p className="text-copy-14 text-[var(--ds-gray-600)] m-0">
            Set up a shared workspace for your worship band or church team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider">Team name</span>
            <Input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Grace Church Worship"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider">Location <span className="normal-case tracking-normal text-[var(--ds-gray-500)]">(optional)</span></span>
            <Input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
            />
          </label>

          {error && (
            <div className="text-copy-13 px-3 py-2 rounded-lg" style={{ background: 'var(--ds-red-100)', color: 'var(--ds-red-1000)' }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create team'}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Team Dashboard ──────────────────────────────────────────────────────────

function MemberRow({ member, isCurrentUser, isAdmin, onRemove }) {
  const isOwner = member.role === 'admin';
  const profile = member.profile || {};
  const displayName = profile.display_name || profile.email?.split('@')[0] || member.user_id?.slice(0, 8);
  const initial = displayName?.slice(0, 2)?.toUpperCase() || '??';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'var(--ds-background-200)', border: '1px solid var(--ds-gray-300)' }}
    >
      {/* Avatar placeholder */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-label-14 font-bold"
        style={{
          background: isOwner ? 'var(--color-brand-soft)' : 'var(--ds-gray-200)',
          color: isOwner ? 'var(--color-brand)' : 'var(--ds-gray-700)',
        }}
      >
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-copy-14 font-medium text-[var(--ds-gray-1000)] truncate">
            {displayName}
          </span>
          {isCurrentUser && (
            <span className="text-label-11 text-[var(--ds-gray-500)]">(you)</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isOwner && (
            <span className="inline-flex items-center gap-1 text-label-11 font-semibold" style={{ color: 'var(--color-brand)' }}>
              <CrownIcon /> Admin
            </span>
          )}
          {!isOwner && (
            <span className="text-label-11 text-[var(--ds-gray-500)]">Member</span>
          )}
          {profile.email && (
            <>
              <span className="text-label-11 text-[var(--ds-gray-400)]">•</span>
              <span className="text-label-11 text-[var(--ds-gray-500)] truncate">{profile.email}</span>
            </>
          )}
        </div>
      </div>

      {isAdmin && !isCurrentUser && !isOwner && (
        <button
          onClick={() => onRemove(member.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-[var(--ds-gray-300)] cursor-pointer text-[var(--ds-gray-500)] hover:text-[var(--ds-red-700)] hover:border-[var(--ds-red-400)] transition-colors"
          title="Remove member"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function InviteRow({ invite, isAdmin, onCancel }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-80"
      style={{ background: 'var(--ds-background-200)', border: '1px dashed var(--ds-gray-400)' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-label-14 font-bold"
        style={{
          background: 'var(--ds-gray-200)',
          color: 'var(--ds-gray-600)',
        }}
      >
        @
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-copy-14 font-medium text-[var(--ds-gray-900)] truncate">
            {invite.email}
          </span>
          <span className="text-label-11 text-[var(--ds-orange-700)] bg-[var(--ds-orange-200)] px-2 py-0.5 rounded-full">
            Pending
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-label-11 text-[var(--ds-gray-500)]">Tell them to sign up to join.</span>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => onCancel(invite.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-[var(--ds-gray-300)] cursor-pointer text-[var(--ds-gray-500)] hover:text-[var(--ds-red-700)] hover:border-[var(--ds-red-400)] transition-colors"
          title="Cancel invite"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

function InviteForm({ onInvite, seatsLeft }) {
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      await onInvite(userId.trim());
      setUserId('');
      setMessage({ kind: 'info', text: 'Member added successfully.' });
    } catch (err) {
      setMessage({ kind: 'error', text: err.message || 'Could not add member.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--ds-background-200)', border: '1px solid var(--ds-gray-300)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold">
          Invite member
        </span>
        <span className="text-label-11 text-[var(--ds-gray-500)]">
          {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          required
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Email address"
          className="flex-1"
        />
        <Button type="submit" variant="brand" size="md" disabled={busy || !userId.trim() || seatsLeft <= 0}>
          <PlusIcon />
          <span className="ml-1">{busy ? 'Adding…' : 'Add'}</span>
        </Button>
      </form>
      {message && (
        <div
          className={`text-copy-13 px-3 py-2 rounded-lg mt-2 ${
            message.kind === 'error'
              ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-1000)]'
              : 'bg-[var(--ds-teal-100)] text-[var(--ds-teal-1000)]'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

function TeamDashboard({ team, members, invites, isAdmin, currentUserId, onRemove, onInvite, onCancelInvite, onLeave, onDelete }) {
  const seatsLeft = (team.max_seats || 10) - members.length - (invites?.length || 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Team header */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--ds-background-100)', border: '1px solid var(--ds-gray-400)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}
            >
              <TeamIcon />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-heading-24 text-[var(--ds-gray-1000)] m-0 mb-0.5 truncate">{team.name}</h2>
              {team.location && (
                <div className="flex items-center gap-1.5 text-copy-14 text-[var(--ds-gray-600)]">
                  <LocationIcon />
                  <span>{team.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-label-11 uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md" style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}>
                  {team.plan === 'church' ? 'Church' : 'Teams'} Plan
                </span>
                <span className="text-label-12 text-[var(--ds-gray-500)]">
                  {members.length}/{team.max_seats} seats
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invite (admin only) */}
        {isAdmin && (
          <InviteForm onInvite={onInvite} seatsLeft={seatsLeft} />
        )}

        {/* Members list */}
        <div>
          <h3 className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold mb-3 px-1">
            Members ({members.length})
          </h3>
          <div className="flex flex-col gap-2">
            {members.map(member => (
              <MemberRow
                key={member.id}
                member={member}
                isCurrentUser={member.user_id === currentUserId}
                isAdmin={isAdmin}
                onRemove={onRemove}
              />
            ))}
            {invites?.map(invite => (
              <InviteRow
                key={invite.id}
                invite={invite}
                isAdmin={isAdmin}
                onCancel={onCancelInvite}
              />
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div
          className="rounded-xl p-4 mt-4"
          style={{ background: 'var(--ds-background-200)', border: '1px solid var(--ds-gray-300)' }}
        >
          <h3 className="text-label-12 text-[var(--ds-red-700)] uppercase tracking-wider font-semibold mb-3">
            Danger zone
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {!isAdmin && (
              <Button variant="secondary" size="sm" onClick={onLeave}>
                Leave team
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Delete "${team.name}"? This removes all members and cannot be undone.`)) {
                    onDelete();
                  }
                }}
                className="text-[var(--ds-red-700)]"
              >
                Delete team
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function TeamScreen({ onBack, onUpgrade }) {
  const { user } = useAuth();
  const { team, members, invites, isAdmin, loading, createTeam, inviteMember, removeMember, cancelInvite, leaveTeam, deleteTeam, hasTeamPlan } = useTeam();

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader onBack={onBack} title="Your Team" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-copy-14 text-[var(--ds-gray-600)]">Loading team…</div>
        </div>
      ) : team ? (
        <TeamDashboard
          team={team}
          members={members}
          invites={invites}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onRemove={removeMember}
          onInvite={inviteMember}
          onCancelInvite={cancelInvite}
          onLeave={async () => {
            await leaveTeam();
            onBack?.();
          }}
          onDelete={async () => {
            await deleteTeam();
          }}
        />
      ) : !hasTeamPlan ? (
        <UpgradeGate feature="team-create" onUpgrade={onUpgrade}>
          {/* Never renders — UpgradeGate shows the prompt */}
          <div />
        </UpgradeGate>
      ) : (
        <CreateTeamForm onCreate={createTeam} />
      )}
    </div>
  );
}
