import { act, renderHook } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';
import { storage } from './storage';
import httpClient from '@/shared/api/httpClient';
import { endpoints } from '@/shared/api/endpoints';

vi.mock('@/shared/api/httpClient', () => ({ default: { post: vi.fn() } }));

describe('server logout', () => {
  beforeEach(() => {
    storage.clearAll();
    vi.clearAllMocks();
  });
  it('keeps the session until revocation is acknowledged, then clears both stores', async () => {
    let acknowledge!: () => void;
    vi.mocked(httpClient.post).mockImplementation(
      () =>
        new Promise(resolve => {
          acknowledge = () => resolve({ data: null });
        })
    );
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    act(() => result.current.login({ accessToken: 'access', refreshToken: 'refresh' }, null, true));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.logout();
    });
    expect(httpClient.post).toHaveBeenCalledWith(endpoints.auth.logout, {
      refreshToken: 'refresh',
      accessToken: 'access',
    });
    expect(storage.getRefreshToken()).toBe('refresh');
    await act(async () => {
      acknowledge();
      await pending;
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(storage.getRefreshToken()).toBeNull();
  });
  it('does not claim successful sign-out when server revocation fails', async () => {
    vi.mocked(httpClient.post).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    act(() => result.current.login({ accessToken: 'access', refreshToken: 'refresh' }, null));
    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow('offline');
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(storage.getRefreshToken()).toBe('refresh');
  });
});
