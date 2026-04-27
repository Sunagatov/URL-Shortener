import type { InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from './constants';

type InterceptorPair = {
  fulfilled?: (value: any) => any;
  rejected?: (value: any) => any;
};

type MockAxiosInstance = ReturnType<typeof vi.fn> & {
  interceptors: {
    request: { use: ReturnType<typeof vi.fn> };
    response: { use: ReturnType<typeof vi.fn> };
  };
  post: ReturnType<typeof vi.fn>;
};

const createMockAxiosInstance = () => {
  const requestInterceptor: InterceptorPair = {};
  const responseInterceptor: InterceptorPair = {};
  const instance = vi.fn((config: InternalAxiosRequestConfig) => Promise.resolve({ config })) as MockAxiosInstance;

  instance.interceptors = {
    request: {
      use: vi.fn((fulfilled, rejected) => {
        requestInterceptor.fulfilled = fulfilled;
        requestInterceptor.rejected = rejected;
      }),
    },
    response: {
      use: vi.fn((fulfilled, rejected) => {
        responseInterceptor.fulfilled = fulfilled;
        responseInterceptor.rejected = rejected;
      }),
    },
  };
  instance.post = vi.fn();

  return { instance, requestInterceptor, responseInterceptor };
};

describe('axiosConfig auth interceptors', () => {
  const loadAxiosConfig = async () => {
    vi.resetModules();
    localStorage.clear();

    const raw = createMockAxiosInstance();
    const api = createMockAxiosInstance();
    const create = vi.fn().mockReturnValueOnce(raw.instance).mockReturnValueOnce(api.instance);

    vi.doMock('axios', () => ({
      default: { create },
    }));

    const module = await import('./axiosConfig');

    return {
      axiosInstance: module.default as unknown as MockAxiosInstance,
      raw,
      api,
      create,
    };
  };

  afterEach(() => {
    vi.doUnmock('axios');
    vi.restoreAllMocks();
  });

  it('does not attach Authorization to auth endpoints', async () => {
    const { api } = await loadAxiosConfig();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'access-token');

    for (const url of [
      API_ENDPOINTS.AUTH.SIGNIN,
      API_ENDPOINTS.AUTH.SIGNUP,
      API_ENDPOINTS.AUTH.REFRESH,
    ]) {
      const config = api.requestInterceptor.fulfilled?.({ url, headers: {} });

      expect(config.headers.Authorization).toBeUndefined();
    }
  });

  it('attaches Authorization to protected endpoints', async () => {
    const { api } = await loadAxiosConfig();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'access-token');

    const config = api.requestInterceptor.fulfilled?.({ url: API_ENDPOINTS.URLS.LIST, headers: {} });

    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('does not refresh when an auth endpoint returns 401', async () => {
    const { raw, api } = await loadAxiosConfig();
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');

    await expect(
      api.responseInterceptor.rejected?.({
        config: { url: API_ENDPOINTS.AUTH.SIGNIN, headers: {} },
        response: { status: 401 },
      })
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(raw.instance.post).not.toHaveBeenCalled();
  });

  it('refreshes, stores rotated tokens, and retries protected requests once', async () => {
    const { axiosInstance, raw, api } = await loadAxiosConfig();
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'old-refresh-token');
    raw.instance.post.mockResolvedValue({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    });

    const originalRequest = {
      url: API_ENDPOINTS.URLS.LIST,
      headers: {},
    };

    await api.responseInterceptor.rejected?.({
      config: originalRequest,
      response: { status: 401 },
    });

    expect(raw.instance.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: 'old-refresh-token',
    });
    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBe('new-access-token');
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('new-refresh-token');
    expect((originalRequest.headers as Record<string, string>).Authorization).toBe('Bearer new-access-token');
    expect(axiosInstance).toHaveBeenCalledTimes(1);
    expect(axiosInstance).toHaveBeenCalledWith(originalRequest);
  });

  it('logs out and redirects protected pages to sign-in when refresh fails', async () => {
    const { raw, api } = await loadAxiosConfig();
    const replace = vi.fn();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'access-token');
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');
    raw.instance.post.mockRejectedValue(new Error('refresh failed'));
    window.history.pushState({}, '', '/account/security');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        pathname: '/account/security',
        replace,
      },
    });

    await expect(
      api.responseInterceptor.rejected?.({
        config: { url: API_ENDPOINTS.URLS.LIST, headers: {} },
        response: { status: 401 },
      })
    ).rejects.toThrow('refresh failed');

    expect(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBeNull();
    expect(replace).toHaveBeenCalledWith('/signin');
  });
});
