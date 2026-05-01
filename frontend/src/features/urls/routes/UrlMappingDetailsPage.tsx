import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AccountPageLoadingState,
  AccountPageMessageState,
  AccountPageLayout,
} from '@/features/account/ui/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { deleteUrl, getUrlDetails } from '@/features/urls/api/urlsApi';
import type { UrlMapping } from '@/features/urls/types/url';
import { getApiErrorMessage } from '@/shared/lib/apiErrors';
import { useClipboard } from '@/shared/lib/useClipboard';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { ConfirmModal, useToast } from '@/shared/ui';
import {
  UrlDetailsHeader,
  UrlInfoCard,
  UrlMetadataCard,
} from '@/features/urls/ui/details/UrlDetailsContent';
import { urlCopyMessages, urlDeleteMessages } from '@/features/urls/lib/urlMessages';

const UrlMappingDetailsPage: React.FC = () => {
  usePageTitle('URL Details');
  const { urlHash } = useParams<{ urlHash: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [urlMapping, setUrlMapping] = useState<UrlMapping | null>(null);
  const { copiedValue, copyValue } = useClipboard();

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

  const handleCopyUrl = async (url: string) => {
    const didCopy = await copyValue(url);

    if (!didCopy) {
      toast.error(urlCopyMessages.error);
      return;
    }

    toast.success(urlCopyMessages.success);
  };

  const handleDelete = async () => {
    if (!urlMapping) {
      return;
    }

    setIsDeleting(true);

    let deleted = false;

    try {
      await deleteUrl(urlMapping.urlHash);
      navigate(routes.urlMappings);
      deleted = true;
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, urlDeleteMessages.failedSingle));
    } finally {
      setIsDeleting(false);
    }

    if (deleted) {
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return <AccountPageLoadingState message="Loading URL details…" />;
  }

  if (!urlMapping) {
    return (
      <AccountPageMessageState
        title="URL Not Found"
        message="The requested URL mapping could not be found."
        detail={errorMessage}
      />
    );
  }

  return (
    <AccountPageLayout>
      <UrlDetailsHeader
        urlMapping={urlMapping}
        onBack={() => navigate(routes.urlMappings)}
        onDelete={() => setShowDeleteModal(true)}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <UrlInfoCard urlMapping={urlMapping} copiedValue={copiedValue} onCopy={handleCopyUrl} />
        <UrlMetadataCard urlMapping={urlMapping} />
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title={urlDeleteMessages.confirmTitle}
        message={urlDeleteMessages.confirmMessage}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </AccountPageLayout>
  );
};

export default UrlMappingDetailsPage;
