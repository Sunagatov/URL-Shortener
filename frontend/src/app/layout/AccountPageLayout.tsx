import type { ReactNode } from 'react';
import AccountSidebar from '@/app/layout/AccountSidebar';
import { Card } from '@/shared/ui';

interface AccountPageLayoutProps {
  children: ReactNode;
  contentClassName?: string;
}

interface AccountPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

interface AccountPageMessageStateProps {
  title: string;
  message: string;
  detail?: string | null;
  action?: ReactNode;
}

export const AccountPageLayout = ({
  children,
  contentClassName = 'max-w-4xl mx-auto',
}: AccountPageLayoutProps) => {
  return (
    <div className="bg-grid-dark flex min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex-grow px-4 pb-10 pt-3 sm:px-6 md:ml-64 md:px-10 md:py-8">
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
};

export const AccountPageHeader = ({ title, description, actions }: AccountPageHeaderProps) => {
  return (
    <div className="mb-8 mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center md:mt-0">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-secondary)]">{description}</p>
      </div>
      {actions}
    </div>
  );
};

export const AccountPageLoadingState = ({ message }: { message: string }) => {
  return (
    <div className="flex min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex flex-grow items-center justify-center md:ml-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--accent-border)] border-t-[color:var(--accent)]" />
          <p className="text-sm text-[color:var(--text-muted)]">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const AccountPageMessageState = ({
  title,
  message,
  detail,
  action,
}: AccountPageMessageStateProps) => {
  return (
    <div className="flex min-h-[calc(100vh-72px)] md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex flex-grow items-center justify-center px-6 md:ml-64">
        <Card className="max-w-md px-8 py-9 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-[color:var(--text-secondary)]">{message}</p>
          {detail && <p className="mt-2 text-sm text-red-400">{detail}</p>}
          {action && <div className="mt-6">{action}</div>}
        </Card>
      </div>
    </div>
  );
};
