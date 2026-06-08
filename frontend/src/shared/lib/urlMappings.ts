export const PAGE_SIZE = 6;

const backendRestApiUrl = import.meta.env.VITE_BACKEND_REST_API_URL;

export const getVisiblePages = (page: number, totalPages: number, maxVisiblePages = 5) => {
  const startPage = Math.max(
    0,
    Math.min(page - Math.floor(maxVisiblePages / 2), Math.max(0, totalPages - maxVisiblePages)),
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePages);
  return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
};

export const getDomainLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.slice(0, 20);
  }
};

export const getShortUrlSlug = (shortUrl: string) => {
  try {
    const parsedUrl = new URL(shortUrl);
    return parsedUrl.pathname.split('/').filter(Boolean).pop() ?? shortUrl;
  } catch {
    return shortUrl.split('/').filter(Boolean).pop() ?? shortUrl;
  }
};

export const getPublicShortUrlBase = () => {
  if (!backendRestApiUrl) {
    return null;
  }

  try {
    const parsedBackendUrl = new URL(backendRestApiUrl);
    const publicHostname = parsedBackendUrl.hostname.startsWith('api.')
      ? parsedBackendUrl.hostname.slice(4)
      : parsedBackendUrl.hostname;
    const publicAuthority = parsedBackendUrl.port
      ? `${publicHostname}:${parsedBackendUrl.port}`
      : publicHostname;
    const trimmedPathname = parsedBackendUrl.pathname.replace(/\/+$/, '');
    const publicPathname = trimmedPathname.replace(/\/api(?:\/v\d+)?$/, '');
    const normalizedPathname = publicPathname ? `${publicPathname}/` : '/';
    return new URL(
      normalizedPathname,
      `${parsedBackendUrl.protocol}//${publicAuthority}`,
    ).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
};

export const normalizeShortUrl = (shortUrl: string) => {
  const publicBase = getPublicShortUrlBase();
  const shortUrlSlug = getShortUrlSlug(shortUrl);

  if (!publicBase || !shortUrlSlug) {
    return shortUrl;
  }

  try {
    const parsedShortUrl = new URL(shortUrl);
    const parsedBackendUrl = backendRestApiUrl ? new URL(backendRestApiUrl) : null;
    const normalizedPathname = parsedShortUrl.pathname.replace(/\/+$/, '');
    const apiStylePathPattern = /^\/(?:api(?:\/v\d+)?)?\/[1-9A-HJ-NP-Za-km-z]{8}$/;

    if (parsedBackendUrl && parsedShortUrl.origin !== parsedBackendUrl.origin) {
      if (!apiStylePathPattern.test(normalizedPathname)) {
        return shortUrl;
      }
    }

    return new URL(`/${shortUrlSlug}`, `${publicBase}/`).toString();
  } catch {
    return shortUrl;
  }
};

export const formatUrlDate = (dateString: string, withTime = false) => {
  const options = withTime
    ? ({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      } as const)
    : ({ year: 'numeric', month: 'short', day: 'numeric' } as const);

  return new Date(dateString).toLocaleDateString('en-US', options);
};
