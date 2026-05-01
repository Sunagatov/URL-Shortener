export interface UrlMapping {
  urlHash: string;
  shortUrl: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  expirationDate: string;
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
}
