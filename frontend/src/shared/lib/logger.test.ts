import { logger } from '@/shared/lib/logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not crash on circular data', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const circular: { name: string; self?: unknown } = { name: 'loop' };
    circular.self = circular;

    expect(() => {
      logger.warn('circular.payload', circular);
    }).not.toThrow();

    expect(consoleWarn).toHaveBeenCalled();
  });

  it('uses sendBeacon for warn and error logs when available', () => {
    const sendBeacon = vi.fn(() => true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });

    logger.error('frontend.runtime.window_error', {
      message: 'Broken',
    });

    expect(consoleError).toHaveBeenCalled();
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('falls back to fetch when sendBeacon is unavailable', async () => {
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: undefined,
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchSpy = vi.fn(() => Promise.resolve(new Response(null, { status: 202 })));
    vi.stubGlobal('fetch', fetchSpy);

    logger.warn('frontend.api.request_failed', {
      status: 500,
    });
    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
