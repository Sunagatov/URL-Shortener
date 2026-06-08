describe('urlMappings helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('extracts the slug from a short url', async () => {
    const { getShortUrlSlug } = await import('@/features/urls/lib/urlMappings');

    expect(getShortUrlSlug('http://116.203.197.65/api/FkMwSG2B')).toBe('FkMwSG2B');
    expect(getShortUrlSlug('https://sho.rt/FkMwSG2B')).toBe('FkMwSG2B');
  });

  it('normalizes backend api short urls into public redirect urls', async () => {
    vi.stubEnv('VITE_BACKEND_REST_API_URL', 'http://116.203.197.65/api');
    vi.resetModules();

    const helpers = await import('@/features/urls/lib/urlMappings');

    expect(helpers.getPublicShortUrlBase()).toBe('http://116.203.197.65');
    expect(helpers.normalizeShortUrl('http://116.203.197.65/api/FkMwSG2B')).toBe(
      'http://116.203.197.65/FkMwSG2B'
    );
  });

  it('preserves the backend port for localhost redirect urls in local development', async () => {
    vi.stubEnv('VITE_BACKEND_REST_API_URL', 'http://localhost:8080');
    vi.resetModules();

    const helpers = await import('@/features/urls/lib/urlMappings');

    expect(helpers.getPublicShortUrlBase()).toBe('http://localhost:8080');
    expect(helpers.normalizeShortUrl('http://localhost:8080/HZezBeaR')).toBe(
      'http://localhost:8080/HZezBeaR'
    );
  });

  it('keeps already-public short urls unchanged', async () => {
    vi.stubEnv('VITE_BACKEND_REST_API_URL', 'http://116.203.197.65/api');
    vi.resetModules();

    const helpers = await import('@/features/urls/lib/urlMappings');

    expect(helpers.normalizeShortUrl('https://sho.rt/FkMwSG2B')).toBe('https://sho.rt/FkMwSG2B');
  });

  it('normalizes legacy ip-based api short urls into the current public redirect url', async () => {
    vi.stubEnv('VITE_BACKEND_REST_API_URL', 'https://api.zuf.uk/api/v1');
    vi.resetModules();

    const helpers = await import('@/features/urls/lib/urlMappings');

    expect(helpers.getPublicShortUrlBase()).toBe('https://zuf.uk');
    expect(helpers.normalizeShortUrl('http://116.203.197.65/api/a7kvs1gB')).toBe(
      'https://zuf.uk/a7kvs1gB'
    );
  });
});
