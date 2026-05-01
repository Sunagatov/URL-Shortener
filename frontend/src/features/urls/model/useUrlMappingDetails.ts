import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { deleteUrl, getUrlDetails } from '@/features/urls/api/urlsApi';
import { urlDeleteMessages } from '@/features/urls/lib/urlMessages';
import type { UrlMapping } from '@/features/urls/types/url';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/apiErrors';
import { useToast } from '@/shared/ui';

export function useUrlMappingDetails(urlHash?: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlMapping, setUrlMapping] = useState<UrlMapping | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUrlMapping = async () => {
      if (!urlHash) {
        const message = 'URL mapping id is missing.';
        setUrlMapping(null);
        setErrorMessage(message);
        toast.error(message);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getUrlDetails(urlHash);
        setUrlMapping(response);
        setErrorMessage(null);
      } catch (error: unknown) {
        if (getApiErrorStatus(error) === 401) {
          navigate(routes.signIn, { replace: true });
          return;
        }

        const message = getApiErrorMessage(error, 'Failed to fetch URL mapping details.');
        setUrlMapping(null);
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUrlMapping();
  }, [navigate, toast, urlHash]);

  const deleteMapping = async () => {
    if (!urlMapping) {
      return false;
    }

    setIsDeleting(true);

    try {
      await deleteUrl(urlMapping.urlHash);
      navigate(routes.urlMappings);
      return true;
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        navigate(routes.signIn, { replace: true });
        return false;
      }

      toast.error(getApiErrorMessage(error, urlDeleteMessages.failedSingle));
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteMapping, errorMessage, isDeleting, isLoading, urlMapping };
}
