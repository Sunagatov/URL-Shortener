import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthTokens } from '@/shared/auth/types';
import { getUserProfile } from '@/shared/auth/profileApi';
import { useAuth } from '@/shared/auth/useAuth';

export function useCompleteAuth() {
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();

  return useCallback(
    async (tokens: AuthTokens, destination: string) => {
      login(tokens, null);

      try {
        const profile = await getUserProfile();
        updateUser(profile);
      } catch {
        // Best-effort profile hydration after authentication.
      }

      navigate(destination, { replace: true });
    },
    [login, navigate, updateUser]
  );
}
