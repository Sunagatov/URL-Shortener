import {
  getUnhandledRejectionContext,
  getWindowErrorContext,
  resolveFrontendLogEndpoint,
} from '@/app/diagnostics';

describe('diagnostics helpers', () => {
  it('prefers an explicit frontend log endpoint', () => {
    expect(
      resolveFrontendLogEndpoint({
        backendRestApiUrl: 'https://api.example.com',
        frontendLogEndpoint: '  https://logs.example.com/frontend  ',
      }),
    ).toBe('https://logs.example.com/frontend');
  });

  it('builds the default frontend log endpoint from the backend URL', () => {
    expect(
      resolveFrontendLogEndpoint({
        backendRestApiUrl: 'https://api.example.com/base/',
      }),
    ).toBe('https://api.example.com/api/v1/frontend/logs');
  });

  it('returns null when the backend URL is missing or invalid', () => {
    expect(resolveFrontendLogEndpoint({ backendRestApiUrl: '' })).toBeNull();
    expect(resolveFrontendLogEndpoint({ backendRestApiUrl: 'not a url' })).toBeNull();
  });

  it('serializes non-Error promise rejection reasons safely', () => {
    expect(getUnhandledRejectionContext('failed')).toEqual({
      reason: { value: 'failed' },
    });
  });

  it('preserves Error instances for unhandled rejection logs', () => {
    const reason = new Error('Boom');

    expect(getUnhandledRejectionContext(reason)).toEqual({
      reason,
    });
  });

  it('maps window error events into log context', () => {
    const event = {
      colno: 22,
      error: new Error('Broken'),
      filename: '/assets/app.js',
      lineno: 11,
      message: 'Broken',
    } as ErrorEvent;

    expect(getWindowErrorContext(event)).toEqual({
      column: 22,
      error: event.error,
      filename: '/assets/app.js',
      line: 11,
      message: 'Broken',
    });
  });
});
