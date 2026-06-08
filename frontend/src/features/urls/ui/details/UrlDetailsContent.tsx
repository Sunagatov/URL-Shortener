import { FaCalendarAlt, FaClock, FaEdit, FaLink, FaQrcode, FaTrash } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/shared/ui';
import type { UrlMapping } from '@/features/urls/types/url';
import { formatUrlDate, getDomainLabel } from '@/features/urls/lib/urlMappings';
import { UrlMetadataRow, UrlSurfaceCard } from '@/features/urls/ui/UrlSurfacePrimitives';
import { UrlValueField } from '@/features/urls/ui/UrlValueField';

interface UrlDetailsHeaderProps {
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
  urlMapping: UrlMapping;
}

export function UrlDetailsHeader({
  onBack,
  onDelete,
  onEdit,
  isEditing,
  urlMapping,
}: UrlDetailsHeaderProps) {
  return (
    <div className="mb-8 mt-3 md:mt-0">
      <button
        type="button"
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-1.5 text-sm text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text-secondary)]"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back to My URLs
      </button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[color:var(--avatar-border)] bg-[var(--avatar-bg)]">
            <FaLink className="h-5 w-5 text-[color:var(--avatar-text)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-[color:var(--text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              URL Details
            </h1>
            <p className="mt-0.5 text-sm text-[color:var(--text-muted)]">
              {getDomainLabel(urlMapping.originalUrl)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="secondary" size="sm">
            <FaEdit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit'}</span>
          </Button>
          <Button onClick={onDelete} variant="danger" size="sm">
            <FaTrash className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UrlInfoCardProps {
  copiedValue: string | null;
  onCopy: (url: string) => Promise<void>;
  urlMapping: UrlMapping;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  editLoading: boolean;
  editError: string | null;
}

export function UrlInfoCard({
  copiedValue,
  onCopy,
  urlMapping,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  editLoading,
  editError,
}: UrlInfoCardProps) {
  return (
    <UrlSurfaceCard title="URL Information" className="lg:col-span-3">
      <div className="space-y-4">
        <UrlValueField
          copiedValue={copiedValue}
          href={urlMapping.shortUrl}
          label="Short URL"
          onCopy={onCopy}
          tone="primary"
          value={urlMapping.shortUrl}
          valueClassName="break-all text-[0.82rem] hover:text-[color:var(--avatar-text)]"
        />
        {isEditing ? (
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
              Original URL
            </label>
            <div className="flex gap-2">
              <input
                value={editValue}
                onChange={e => onEditChange(e.target.value)}
                className="flex-1 rounded-xl border border-[color:var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onEditSave();
                  }
                }}
              />
              <Button onClick={onEditSave} size="sm" loading={editLoading}>
                Save
              </Button>
            </div>
            {editError && <p className="text-xs text-[color:var(--danger-text)]">{editError}</p>}
          </div>
        ) : (
          <UrlValueField
            copiedValue={copiedValue}
            href={urlMapping.originalUrl}
            label="Original URL"
            onCopy={onCopy}
            value={urlMapping.originalUrl}
            valueClassName="break-all text-[0.82rem] hover:text-[color:var(--text-secondary)]"
          />
        )}
      </div>
    </UrlSurfaceCard>
  );
}

export function UrlMetadataCard({ urlMapping }: { urlMapping: UrlMapping }) {
  return (
    <UrlSurfaceCard title="Details" className="lg:col-span-2">
      <div className="space-y-3 px-0 py-0">
        <UrlMetadataRow
          icon={FaCalendarAlt}
          label="Created"
          value={formatUrlDate(urlMapping.createdAt, true)}
          tone="default"
        />
        {urlMapping.expirationDate ? (
          <UrlMetadataRow
            icon={FaClock}
            label="Expires"
            value={formatUrlDate(urlMapping.expirationDate, true)}
            tone="warning"
          />
        ) : null}
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--card-bg)] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/12">
              <FaQrcode className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
                QR Code
              </p>
              <p className="text-xs text-[color:var(--text-muted)]">
                Scan to open the short link on another device
              </p>
            </div>
          </div>
          <div className="flex justify-center rounded-2xl border border-[color:var(--border)] bg-white px-4 py-5">
            <QRCodeSVG
              value={`${urlMapping.shortUrl}?qr=1`}
              size={132}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              marginSize={4}
            />
          </div>
        </div>
      </div>
    </UrlSurfaceCard>
  );
}
