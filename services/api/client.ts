import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from '../../config/api.config';
import { getAccessToken, clearAuthStorage } from '../storage/secureStorage';
import { devLog, devError } from '../../utils/debug';
import { API_TIMEOUT } from '../../utils/constants';

/**
 * Create Axios instance with base configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds auth token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        devLog(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    } catch (error) {
      devError('Request interceptor error', error);
      return config;
    }
  },
  (error) => {
    devError('Request interceptor error', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      devLog(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (__DEV__) {
      devError('API Error', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Implement token refresh logic here
      // For now, just clear storage and force re-login
      await clearAuthStorage();

      // You could also trigger a logout event here
      // or navigate to login screen
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT',
      });
    }

    // Return formatted error
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code,
      status: error.response?.status,
    });
  }
);

export default apiClient;
