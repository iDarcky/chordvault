import { useContext } from 'react';
import { TeamContext } from './TeamContext';

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within a TeamProvider.');
  return ctx;
}
