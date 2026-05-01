import {
  createHttpLogReporter,
  logger,
  setLogReporter,
  type LogContext,
} from '@/shared/lib/logger';

describe('logger', () => {
  afterEach(() => {
    setLogReporter(null);
    vi.restoreAllMocks();
  });

  it('redacts sensitive keys before reporting', () => {
    const report = vi.fn();
    setLogReporter(report);

    logger.error('auth.failed', {
      accessToken: 'secret-token',
      nested: {
        password: 'super-secret',
        safe: 'value',
      },
    });

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          accessToken: '[REDACTED]',
          nested: {
            password: '[REDACTED]',
            safe: 'value',
          },
        },
      }),
    );
  });

  it('avoids crashing on circular data', () => {
    const report = vi.fn();
    const circular = { name: 'loop' } as LogContext & { self?: LogContext };
    circular.self = circular;
    setLogReporter(report);

    logger.warn('circular.payload', circular);

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          name: 'loop',
          self: '[CIRCULAR]',
        },
      }),
    );
  });

  it('truncates deeply nested values before reporting', () => {
    const report = vi.fn();
    setLogReporter(report);

    logger.warn('deep.payload', {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: 'hidden',
              },
            },
          },
        },
      },
    });

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: '[TRUNCATED]',
                },
              },
            },
          },
        },
      }),
    );
  });

  it('uses sendBeacon for reportable remote logs when available', () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });
    const reporter = createHttpLogReporter({
      endpoint: 'https://logs.example.com/frontend',
      minLevel: 'warn',
    });

    reporter({
      level: 'error',
      message: 'frontend.runtime.window_error',
      runtime: 'browser',
      sessionId: 'session-1',
      timestamp: '2026-04-30T13:00:00.000Z',
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon).toHaveBeenCalledWith(
      'https://logs.example.com/frontend',
      expect.any(Blob),
    );
  });

  it('falls back to fetch when sendBeacon is unavailable', async () => {
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: undefined,
    });
    const fetchSpy = vi.fn(() => Promise.resolve(new Response(null, { status: 202 })));
    vi.stubGlobal('fetch', fetchSpy);
    const reporter = createHttpLogReporter({
      endpoint: 'https://logs.example.com/frontend',
      minLevel: 'warn',
    });

    reporter({
      level: 'warn',
      message: 'frontend.api.request_failed',
      runtime: 'browser',
      sessionId: 'session-1',
      timestamp: '2026-04-30T13:00:00.000Z',
    });
    await Promise.resolve();

    expect(fetchSpy).toHaveBeenCalledWith('https://logs.example.com/frontend', {
      body: expect.any(String),
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      method: 'POST',
    });
  });

  it('does not report entries below the remote threshold', () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });
    const reporter = createHttpLogReporter({
      endpoint: 'https://logs.example.com/frontend',
      minLevel: 'warn',
    });

    reporter({
      level: 'info',
      message: 'frontend.runtime.started',
      runtime: 'browser',
      sessionId: 'session-1',
      timestamp: '2026-04-30T13:00:00.000Z',
    });

    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
