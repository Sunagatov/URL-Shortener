import type { AxiosInstance } from 'axios';
import {
  refreshAccessTokenForRequest,
  refreshFailedSession,
  type RetryableRequestConfig,
} from './httpClientRefresh';
import { storage } from '@/shared/auth/storage';

vi.mock('@/shared/lib/authRedirect', () => ({ redirectToSignIn: vi.fn() }));

describe('refresh lifecycle', () => {
  beforeEach(() => storage.clearAll());
  it('does not restore credentials when a pending refresh completes after logout', async () => {
    storage.setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, false);
    let finish!: (value: unknown) => void;
    const raw = {
      post: vi.fn(
        () =>
          new Promise(resolve => {
            finish = resolve;
          })
      ),
    } as unknown as AxiosInstance;
    const retry = vi.fn() as unknown as AxiosInstance;
    const pending = refreshAccessTokenForRequest(retry, raw, {
      url: '/api/v1/users',
      headers: {},
    } as RetryableRequestConfig);
    storage.clearAll();
    finish({ data: { accessToken: 'late-access' } });
    await expect(pending).rejects.toThrow('Session changed');
    expect(storage.getAccessToken()).toBeNull();
    expect(retry).not.toHaveBeenCalled();
  });
  it('does not clear a newer login when an older refresh fails', async () => {
    storage.setTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }, false);
    await refreshFailedSession('/api/v1/users', new Error('old refresh failed'), 'old-refresh');
    expect(storage.getAccessToken()).toBe('new-access');
  });
});
