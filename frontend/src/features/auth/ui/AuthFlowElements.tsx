import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { Card, Button } from '@/shared/ui';

export function AuthAlert({
  children,
  tone = 'error',
}: PropsWithChildren<{ tone?: 'error' | 'neutral' }>) {
  const className =
    tone === 'error'
      ? 'border-red-500/20 bg-red-900/20 text-red-300'
      : 'border-[color:var(--border)] bg-white/5 text-[color:var(--text-secondary)]';

  return (
    <div className={`flex items-center gap-2 rounded-2xl border p-4 text-sm ${className}`}>
      <span className="shrink-0">{tone === 'error' ? '⚠' : 'i'}</span>
      {children}
    </div>
  );
}

export function AuthBackLink({ to, children = 'Back' }: { to: string; children?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] transition-colors hover:text-white"
    >
      <FaArrowLeft className="h-3 w-3" />
      {children}
    </Link>
  );
}

export function AuthSupportCard({ children }: PropsWithChildren) {
  return <Card className="rounded-2xl bg-white/4 p-4">{children}</Card>;
}

export function AuthStatusView({
  action,
  description,
  icon,
  title,
}: {
  action?: React.ReactNode;
  description: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-col items-center py-4">
        {icon}
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="mt-2 text-sm text-[color:var(--text-secondary)]">{description}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

export function AuthStatusIcon({
  badge = 'success',
  children,
}: PropsWithChildren<{ badge?: 'success' | 'warning' | 'error' }>) {
  const badgeClassName = {
    success: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400',
    warning: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
    error: 'border-red-500/40 bg-red-500/20 text-red-400',
  } as const;

  const outerClassName = {
    success: 'border-emerald-500/25 bg-emerald-500/12',
    warning: 'border-amber-500/25 bg-amber-500/10',
    error: 'border-red-500/25 bg-red-500/10',
  } as const;

  return (
    <div className="relative">
      <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${outerClassName[badge]}`}>
        {children}
      </div>
      {badge === 'success' ? (
        <div className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border ${badgeClassName[badge]}`}>
          <FaCheck className="h-3 w-3" />
        </div>
      ) : null}
    </div>
  );
}

export function PasswordVisibilityToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[color:var(--text-muted)] transition-colors hover:text-white"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  );
}

export function AuthChecklist({
  items,
}: {
  items: Array<{ label: string; passes: boolean }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-1.5 text-xs ${item.passes ? 'text-cyan-300' : 'text-white/25'}`}
        >
          {item.passes ? <FaCheck size={9} /> : <FaTimes size={9} />}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AuthPrimaryLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}>
      <Button className="w-full" size="lg">
        {children}
      </Button>
    </Link>
  );
}
