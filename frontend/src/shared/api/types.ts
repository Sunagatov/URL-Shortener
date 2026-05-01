export interface ApiError {
  errorMessage: string;
  status: number;
  code?: string;
  retryAfterSeconds?: number;
}
