import { useCallback, useState } from 'react';
import {
  clearLocalProgress,
  loadPlayerProfile,
  recordCompletedRun,
  updatePlayerUsername,
} from '../lib/playerProfileStorage';

export function usePlayerProfile() {
  const [profile, setProfile] = useState(() => loadPlayerProfile());

  const refreshProfile = useCallback(() => {
    const nextProfile = loadPlayerProfile();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const updateUsername = useCallback((username: string) => {
    const nextProfile = updatePlayerUsername(username);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const recordRun = useCallback((input: Parameters<typeof recordCompletedRun>[0]) => {
    const result = recordCompletedRun(input);
    setProfile(result.profile);
    return result;
  }, []);

  const clearProfile = useCallback(() => {
    const nextProfile = clearLocalProgress();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  return {
    profile,
    refreshProfile,
    updateUsername,
    recordRun,
    clearProfile,
  };
}
