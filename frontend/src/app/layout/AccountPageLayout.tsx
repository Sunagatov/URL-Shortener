import type { ReactNode } from 'react';
import AccountSidebar from '@/app/layout/AccountSidebar';

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
    <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] bg-grid-dark md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex-grow px-4 pt-3 pb-10 sm:px-6 md:ml-64 md:px-10 md:py-8">
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
};

export const AccountPageHeader = ({ title, description, actions }: AccountPageHeaderProps) => {
  return (
    <div className="mb-8 mt-3 flex flex-col justify-between gap-4 md:mt-0 sm:flex-row sm:items-center">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-white/40">{description}</p>
      </div>
      {actions}
    </div>
  );
};

export const AccountPageLoadingState = ({ message }: { message: string }) => {
  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex flex-grow items-center justify-center md:ml-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
          <p className="text-sm text-white/30">{message}</p>
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
    <div className="flex min-h-[calc(100vh-72px)] bg-[#060612] md:min-h-[calc(100vh-96px)]">
      <AccountSidebar />
      <div className="flex flex-grow items-center justify-center px-6 md:ml-64">
        <div className="max-w-sm text-center">
          <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-white/35">{message}</p>
          {detail && <p className="mt-2 text-sm text-red-400">{detail}</p>}
          {action && <div className="mt-6">{action}</div>}
        </div>
      </div>
    </div>
  );
};
