import { routes } from '@/app/routes';

type AuthLocationState = {
  from?: { pathname: string; search?: string; hash?: string };
};

export function getAuthDestination(state: unknown): string {
  const from = (state as AuthLocationState | null)?.from;
  return from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : routes.home;
}
