import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AccountPageLoadingState,
  AccountPageMessageState,
  AccountPageLayout,
} from '@/app/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { useClipboard } from '@/shared/lib/useClipboard';
import { usePageTitle } from '@/shared/lib/usePageTitle';
import { ConfirmModal, useToast } from '@/shared/ui';
import { useUrlMappingDetails } from '@/features/urls/model/useUrlMappingDetails';
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
  const { copiedValue, copyValue } = useClipboard();
  const { deleteMapping, errorMessage, isDeleting, isLoading, urlMapping } =
    useUrlMappingDetails(urlHash);

  const handleCopyUrl = async (url: string) => {
    const didCopy = await copyValue(url);

    if (!didCopy) {
      toast.error(urlCopyMessages.error);
      return;
    }

    toast.success(urlCopyMessages.success);
  };

  const handleDelete = async () => {
    const deleted = await deleteMapping();

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
