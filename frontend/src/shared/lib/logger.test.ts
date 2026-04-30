import { logger, setLogReporter, type LogContext } from '@/shared/lib/logger';

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
});
