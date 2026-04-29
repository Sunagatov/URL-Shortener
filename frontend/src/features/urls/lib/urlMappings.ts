export const PAGE_SIZE = 6;

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
