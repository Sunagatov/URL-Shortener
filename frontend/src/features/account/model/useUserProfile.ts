import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { getUserProfile } from '@/features/users/api/userProfileApi';
import { useAuth } from '@/shared/auth/useAuth';
import { getApiErrorMessage, isSessionInvalidError } from '@/shared/lib/apiErrors';
import type { User } from '@/shared/types';
import { useToast } from '@/shared/ui';

export function useUserProfile() {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getUserProfile();

        if (!isMounted) {
          return;
        }

        setUserDetails(response);
        setErrorMessage(null);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        if (isSessionInvalidError(error)) {
          logout();
          navigate(routes.signIn, { replace: true });
          return;
        }

        const message = getApiErrorMessage(error, 'Failed to fetch user details.');
        setErrorMessage(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [logout, navigate, toast]);

  return { errorMessage, isLoading, userDetails };
}
