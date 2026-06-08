export interface UrlMapping {
  urlHash: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  qrScanCount: number;
  createdAt: string;
  expirationDate: string;
  disabled?: boolean;
  disabledReason?: string | null;
  disabledAt?: string | null;
  safetyInterstitialRequired?: boolean;
  safetyInterstitialReason?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateUrlRequest {
  originalUrl: string;
  daysCount?: number | undefined;
  customAlias?: string | undefined;
  turnstileToken?: string | undefined;
}

export interface AbuseReportRequest {
  shortUrlOrHash: string;
  reason?: string | undefined;
}

export interface AbuseReportResponse {
  reportId: string | null;
  urlHash: string;
}
