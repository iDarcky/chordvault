import { useState } from 'react';
import { useTeam } from '../../auth/useTeam';
import { useTeamSchedules } from '../../hooks/useTeamSchedules';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { IconButton } from '../ui/IconButton';
import { toast } from '../ui/use-toast';

const PREDEFINED_ROLES = [
  "Acoustic Guitar", 
  "Electric Guitar", 
  "Bass", 
  "Drums", 
  "Keys", 
  "Vocals", 
  "Lead Vocal", 
  "Piano"
];

export default function RosterPanel({ setlistId, onClose }) {
  const { team, members } = useTeam();
  const { schedules, createSchedule, updateSchedule, deleteSchedule, loading } = useTeamSchedules(team?.id);
  
  const [addingMemberId, setAddingMemberId] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Filter schedules for this specific setlist
  const setlistSchedules = schedules.filter(s => s.setlist_id === setlistId);

  const handleAddMember = async (userId) => {
    if (!userId || isAdding) return;
    setIsAdding(true);
    setAddingMemberId(userId);
    try {
      await createSchedule(setlistId, userId, "Vocals", "pending");
      toast({ title: 'Added to roster', description: 'Member has been scheduled.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Could not add member to roster.', variant: 'error' });
    } finally {
      setIsAdding(false);
      setAddingMemberId('');
    }
  };

  const handleUpdateRole = async (scheduleId, role) => {
    try {
      await updateSchedule(scheduleId, { role });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (scheduleId, availability) => {
    try {
      await updateSchedule(scheduleId, { availability });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (scheduleId) => {
    if (confirm('Remove this person from the roster?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Members not yet on the roster
  const availableMembers = members.filter(m => 
    !setlistSchedules.some(s => s.user_id === m.user_id)
  );

  return (
    <div className="flex flex-col h-full bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-300)] w-[360px] max-w-full">
      <div className="p-4 border-b border-[var(--ds-gray-300)] flex items-center justify-between">
        <h3 className="text-heading-18 font-bold m-0">Setlist Roster</h3>
        <IconButton size="sm" onClick={onClose} aria-label="Close roster">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </IconButton>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {loading && schedules.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-copy-14 text-[var(--ds-gray-500)]">Loading roster...</span>
          </div>
        ) : (
          <>
            {/* Current Roster */}
            <div className="flex flex-col gap-3">
              <p className="text-label-12 text-[var(--ds-gray-600)] uppercase tracking-wider font-bold">Scheduled Team</p>
              
              {setlistSchedules.length === 0 && (
                <p className="text-copy-14 text-[var(--ds-gray-500)] italic py-4 text-center">
                  No one is scheduled yet.
                </p>
              )}

              {setlistSchedules.map(schedule => {
                const member = members.find(m => m.user_id === schedule.user_id);
                const displayName = member?.profile?.display_name || schedule.profile?.display_name || schedule.profile?.email || 'Unknown User';
                
                return (
                  <div key={schedule.id} className="p-3 rounded-xl bg-[var(--ds-background-200)] border border-[var(--ds-gray-300)] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-copy-14 font-bold">{displayName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-label-11 px-2 py-0.5 rounded-full ${
                            schedule.availability === 'available' ? 'bg-[var(--ds-green-100)] text-[var(--ds-green-800)]' :
                            schedule.availability === 'unavailable' ? 'bg-[var(--ds-red-100)] text-[var(--ds-red-800)]' :
                            schedule.availability === 'maybe' ? 'bg-[var(--ds-orange-100)] text-[var(--ds-orange-800)]' :
                            'bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]'
                          }`}>
                            {schedule.availability.charAt(0).toUpperCase() + schedule.availability.slice(1)}
                          </span>
                        </div>
                      </div>
                      <IconButton size="sm" onClick={() => handleRemove(schedule.id)} variant="ghost" className="text-[var(--ds-gray-400)] hover:text-[var(--ds-red-600)]">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </IconButton>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-label-11 text-[var(--ds-gray-600)] uppercase font-semibold">Role</span>
                      <div className="flex flex-wrap gap-1">
                        <select 
                          className="w-full bg-[var(--ds-background-100)] border border-[var(--ds-gray-300)] rounded-md text-copy-13 px-2 py-1 outline-none"
                          value={PREDEFINED_ROLES.includes(schedule.role) ? schedule.role : 'custom'}
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              handleUpdateRole(schedule.id, e.target.value);
                            }
                          }}
                        >
                          {PREDEFINED_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                          <option value="custom">Custom...</option>
                        </select>
                        
                        {(!PREDEFINED_ROLES.includes(schedule.role) || schedule.role === 'custom') && (
                          <Input 
                            size="sm"
                            placeholder="Enter custom role"
                            value={schedule.role === 'custom' ? '' : schedule.role}
                            onChange={(e) => handleUpdateRole(schedule.id, e.target.value)}
                            className="mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Member */}
            <div className="flex flex-col gap-3">
              <p className="text-label-12 text-[var(--ds-gray-600)] uppercase tracking-wider font-bold">Add to Roster</p>
              
              <div className="flex flex-col gap-2">
                {availableMembers.length > 0 ? (
                  availableMembers.map(member => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-2 hover:bg-[var(--ds-gray-100)] rounded-lg cursor-pointer group"
                      onClick={() => handleAddMember(member.user_id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--ds-gray-200)] flex items-center justify-center text-label-12 font-bold">
                          {member.profile?.display_name?.slice(0, 2).toUpperCase() || '?'}
                        </div>
                        <span className="text-copy-14">{member.profile?.display_name || member.profile?.email || 'Member'}</span>
                      </div>
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        className={isAdding && addingMemberId === member.user_id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                        disabled={isAdding && addingMemberId === member.user_id}
                      >
                        {isAdding && addingMemberId === member.user_id ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-copy-13 text-[var(--ds-gray-500)] py-2">All members are scheduled.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-[var(--ds-gray-300)] bg-[var(--ds-background-200)]">
        <p className="text-label-11 text-[var(--ds-gray-500)] text-center">
          Members will see their assignments on their dashboard calendar.
        </p>
      </div>
    </div>
  );
}
