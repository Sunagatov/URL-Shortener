import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuth } from '@/features/auth/api/authApi';
import { getUserProfile } from '@/shared/api/profileApi';
import { routes } from '@/app/routes';
import { useAuth } from '@/shared/auth/useAuth';
import { usePageTitle } from '@/shared/lib/usePageTitle';

export default function GoogleCallbackPage() {
  usePageTitle('Signing in…');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  const handleCallback = useCallback(async () => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const state = searchParams.get('state');
    const destination = state || routes.dashboard;

    if (errorParam) {
      setError(
        errorParam === 'access_denied' ? 'Google sign-in was cancelled.' : 'Google sign-in failed.'
      );
      return;
    }
    if (!code) {
      setError('No authorization code received from Google.');
      return;
    }

    try {
      const tokens = await googleAuth(code);
      login(tokens, null);
      try {
        const profile = await getUserProfile();
        updateUser(profile);
      } catch {
        /* best-effort profile hydration */
      }
      navigate(destination, { replace: true });
    } catch {
      setError('Failed to sign in with Google. Please try again.');
    }
  }, [searchParams, login, updateUser, navigate]);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    handleCallback();
  }, [handleCallback]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="text-sm text-[color:var(--danger-text)]">{error}</p>
          <button
            type="button"
            onClick={() => navigate(routes.signIn, { replace: true })}
            className="text-sm font-semibold text-[color:var(--accent)] transition-colors hover:text-[color:var(--text-primary)]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-[color:var(--text-muted)]">Signing in with Google…</p>
    </div>
  );
}
