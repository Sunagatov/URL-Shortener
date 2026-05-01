import {
  FaCalendarAlt,
  FaClock,
  FaLink,
  FaLock,
  FaQrcode,
  FaTrash,
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Tooltip } from '@/shared/ui';
import type { UrlMapping } from '@/features/urls/types/url';
import { formatUrlDate, getDomainLabel } from '@/features/urls/lib/urlMappings';
import {
  UrlCopyButton,
  UrlExternalLinkButton,
  UrlFieldLabel,
  UrlMetadataRow,
  UrlSurfaceCard,
} from '@/features/urls/ui/UrlSurfacePrimitives';

interface UrlDetailsHeaderProps {
  onBack: () => void;
  onDelete: () => void;
  urlMapping: UrlMapping;
}

export function UrlDetailsHeader({ onBack, onDelete, urlMapping }: UrlDetailsHeaderProps) {
  return (
    <div className="mb-8 mt-3 md:mt-0">
      <button
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-1.5 text-sm text-white/35 transition-colors hover:text-white/70"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back to My URLs
      </button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600/15">
            <FaLink className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              URL Details
            </h1>
            <p className="mt-0.5 text-sm text-white/40">{getDomainLabel(urlMapping.originalUrl)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Tooltip content="Editing is still locked while inline URL editing ships">
            <span className="inline-flex">
              <Button variant="secondary" size="sm" disabled className="border-dashed opacity-40">
                <FaLock className="h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </span>
          </Tooltip>
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
}

export function UrlInfoCard({ copiedValue, onCopy, urlMapping }: UrlInfoCardProps) {
  return (
    <UrlSurfaceCard title="URL Information" className="lg:col-span-3">
      <div className="space-y-4">
        <UrlValueRow
          label="Short URL"
          value={urlMapping.shortUrl}
          href={urlMapping.shortUrl}
          copiedValue={copiedValue}
          onCopy={onCopy}
          tone="primary"
        />
        <UrlValueRow
          label="Original URL"
          value={urlMapping.originalUrl}
          href={urlMapping.originalUrl}
          copiedValue={copiedValue}
          onCopy={onCopy}
          tone="default"
        />
      </div>
    </UrlSurfaceCard>
  );
}

function UrlValueRow({
  copiedValue,
  href,
  label,
  onCopy,
  tone,
  value,
}: {
  copiedValue: string | null;
  href: string;
  label: string;
  onCopy: (url: string) => Promise<void>;
  tone: 'default' | 'primary';
  value: string;
}) {
  const containerClassName =
    tone === 'primary' ? 'border-blue-500/15 bg-[#0a1220]' : 'border-white/[0.06] bg-white/[0.03]';
  const linkClassName =
    tone === 'primary' ? 'text-blue-400 hover:text-blue-300' : 'text-white/50 hover:text-white/80';

  return (
    <div>
      <UrlFieldLabel>{label}</UrlFieldLabel>
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${containerClassName}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 break-all transition-colors ${linkClassName}`}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
        >
          {value}
        </a>
        <div className="flex shrink-0 gap-1">
          <UrlCopyButton
            copied={copiedValue === value}
            onCopy={() => {
              void onCopy(value);
            }}
            primary={tone === 'primary'}
          />
          <UrlExternalLinkButton
            href={href}
            primary={tone === 'primary'}
            title="Open"
          />
        </div>
      </div>
    </div>
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
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/12">
              <FaQrcode className="h-3.5 w-3.5 text-emerald-300" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] uppercase tracking-widest text-white/30">QR Code</p>
              <p className="text-xs text-white/45">Scan to open the short link on another device</p>
            </div>
          </div>
          <div className="flex justify-center rounded-2xl border border-white/[0.06] bg-white px-4 py-5">
            <QRCodeSVG
              value={urlMapping.shortUrl}
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
