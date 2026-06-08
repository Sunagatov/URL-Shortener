export {
  createUrl,
  deleteUrl,
  getAllUserUrls,
  getUrlDetails,
  getUserUrls,
  getUserUrlsUpTo,
  MAX_USER_URLS_PAGE_SIZE,
  reportAbuse,
  updateUrl,
} from '@/shared/api/urlMappingsApi';

export type {
  AbuseReportRequest,
  AbuseReportResponse,
  CreateUrlRequest,
  PaginatedResponse,
  UrlMapping,
} from '@/shared/api/urlMappingsApi';
