import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { api } from '@/shared/api/index';

export const setupInterceptors = () => {
  api.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.withCredentials = true;
    return config;
  });

  api.instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _isRetry?: boolean };

      const isLoginRequest = originalRequest.url?.includes('/api/auth/login');
      const isRefreshRequest = originalRequest.url?.includes('/api/auth/refresh');

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._isRetry &&
        !isLoginRequest &&
        !isRefreshRequest
      ) {
        originalRequest._isRetry = true;
        try {
          await api.api.authControllerRefresh();
          return api.instance.request(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );
};
