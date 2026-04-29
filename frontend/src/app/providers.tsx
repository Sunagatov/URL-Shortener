import type { PropsWithChildren } from 'react';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';

export function Providers({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
