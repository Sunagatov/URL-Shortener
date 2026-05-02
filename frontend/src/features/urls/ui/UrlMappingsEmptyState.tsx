import { FaLink, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { Button } from '@/shared/ui';

interface UrlMappingsEmptyStateProps {
  actionLabel: string;
  description: React.ReactNode;
  icon: 'link' | 'search';
  onAction: () => void;
  title: string;
}

export function UrlMappingsEmptyState({
  actionLabel,
  description,
  icon,
  onAction,
  title,
}: UrlMappingsEmptyStateProps) {
  const Icon = icon === 'search' ? FaSearch : FaLink;
  const ActionIcon = icon === 'search' ? FaTimes : FaPlus;

  return (
    <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-0">
      <div className="w-full rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)] px-6 py-14 text-center sm:max-w-md">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]">
          <Icon className="h-5 w-5 text-[color:var(--text-muted)]" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-[color:var(--text-primary)]">{title}</h3>
        <div className="mb-6 text-sm leading-relaxed text-[color:var(--text-muted)]">{description}</div>
        <Button
          onClick={onAction}
          variant={icon === 'search' ? 'secondary' : 'primary'}
          size="sm"
          className="mx-auto"
        >
          <ActionIcon className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
