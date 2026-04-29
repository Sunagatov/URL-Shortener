import type { User } from '@/shared/types';

export function getUserInitials(user: User): string {
  return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';
}

export function getUserDisplayName(user: User): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'User';
}

export function formatUserDate(date: string, withTime = false): string {
  const options = withTime
    ? ({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      } as const)
    : ({ year: 'numeric', month: 'short', day: 'numeric' } as const);

  return new Date(date).toLocaleDateString('en-US', options);
}
