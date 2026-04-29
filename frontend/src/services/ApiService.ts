import axiosInstance from '../axiosConfig';
import { API_ENDPOINTS } from '../constants';
import type {
  SignInRequest,
  SignUpRequest,
  CreateUrlRequest,
  AuthTokens,
  User,
  UrlMapping,
  PaginatedResponse,
} from '../types';

export class ApiService {
  // Auth endpoints
  static async signIn(data: SignInRequest): Promise<AuthTokens> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SIGNIN, data);
    return response.data;
  }

  static async signUp(data: SignUpRequest): Promise<AuthTokens> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SIGNUP, data);
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return response.data;
  }

  // URL endpoints
  static async createUrl(data: CreateUrlRequest): Promise<{ shortUrl: string }> {
    const response = await axiosInstance.post(API_ENDPOINTS.URLS.CREATE, data);
    return response.data;
  }

  static async getUserUrls(page = 0, size = 6): Promise<PaginatedResponse<UrlMapping>> {
    const response = await axiosInstance.get(API_ENDPOINTS.URLS.LIST, {
      params: { page, size },
    });
    return response.data;
  }

  static async getUrlDetails(hash: string): Promise<UrlMapping> {
    const response = await axiosInstance.get(API_ENDPOINTS.URLS.DETAILS(hash));
    return response.data;
  }

  static async deleteUrl(hash: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.URLS.DELETE(hash));
  }

  // User endpoints
  static async getUserProfile(): Promise<User> {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  static async updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.UPDATE, data);
    return response.data;
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await axiosInstance.put(API_ENDPOINTS.USER.CHANGE_PASSWORD, data);
  }
}
