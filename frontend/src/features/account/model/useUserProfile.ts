import { useEffect, useState } from 'react';
import { getUserProfile } from '@/features/account/api/profileApi';
import type { User } from '@/shared/auth/types';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';

export function useUserProfile() {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  }, [toast]);

  return { errorMessage, isLoading, setUserDetails, userDetails };
}
