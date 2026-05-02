import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AccountPageLoadingState,
  AccountPageMessageState,
  AccountPageLayout,
} from '@/features/account/ui/layout/AccountPageLayout';
import { routes } from '@/app/routes';
import { deleteUrl, getUrlDetails, updateUrl } from '@/features/urls/api/urlsApi';
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
import { useUrlAnalytics } from '@/features/analytics/model/useUrlAnalytics';
import { DateRangeSelector } from '@/features/analytics/ui/DateRangeSelector';
import { SummaryCards } from '@/features/analytics/ui/SummaryCards';
import { TimeseriesChart } from '@/features/analytics/ui/TimeseriesChart';
import { BreakdownGrid } from '@/features/analytics/ui/BreakdownPanel';
import { AnalyticsLoadingSkeleton } from '@/features/analytics/ui/AnalyticsLoadingSkeleton';
import { EventTypeFilter } from '@/features/analytics/ui/EventTypeFilter';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { copiedValue, copyValue } = useClipboard();
  const analytics = useUrlAnalytics(urlHash);

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

  const handleToggleEdit = () => {
    if (!isEditing && urlMapping) {
      setEditValue(urlMapping.originalUrl);
      setEditError(null);
    }
    setIsEditing(v => !v);
  };

  const handleEditSave = async () => {
    if (!urlMapping || !editValue.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await updateUrl(urlMapping.urlHash, editValue.trim());
      setUrlMapping(updated);
      setIsEditing(false);
      toast.success('URL updated successfully');
    } catch (error: unknown) {
      setEditError(getApiErrorMessage(error, 'Failed to update URL'));
    } finally {
      setEditLoading(false);
    }
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
        onEdit={handleToggleEdit}
        isEditing={isEditing}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <UrlInfoCard
          urlMapping={urlMapping}
          copiedValue={copiedValue}
          onCopy={handleCopyUrl}
          isEditing={isEditing}
          editValue={editValue}
          onEditChange={setEditValue}
          onEditSave={handleEditSave}
          editLoading={editLoading}
          editError={editError}
        />
        <UrlMetadataCard urlMapping={urlMapping} />
      </div>

      <div className="mt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2
            className="text-lg font-bold tracking-tight text-[color:var(--text-primary)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Analytics
          </h2>
          <div className="flex items-center gap-2">
            <EventTypeFilter value={analytics.eventType} onChange={analytics.setEventType} />
            <DateRangeSelector dateRange={analytics.dateRange} onDateRangeChange={analytics.setDateRange} />
          </div>
        </div>
        <p className="mb-4 text-[10px] text-[color:var(--text-muted)]">Bot traffic excluded from analytics</p>

        {analytics.loading ? (
          <AnalyticsLoadingSkeleton />
        ) : analytics.error ? (
          <div className="rounded-2xl border border-[color:var(--danger)] bg-[var(--danger-bg)] p-6 text-center">
            <p className="text-sm text-[color:var(--danger-text)]">{analytics.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.summary && <SummaryCards summary={analytics.summary} />}
            {analytics.timeseries && <TimeseriesChart timeseries={analytics.timeseries} />}
            <BreakdownGrid breakdowns={analytics.breakdowns} />
          </div>
        )}
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
