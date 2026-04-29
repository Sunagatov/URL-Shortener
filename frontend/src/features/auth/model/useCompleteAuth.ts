import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/features/users/api/userProfileApi';
import { useAuth } from '@/shared/auth/useAuth';
import type { AuthTokens } from '@/shared/types';

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
    [login, navigate, updateUser],
  );
}
