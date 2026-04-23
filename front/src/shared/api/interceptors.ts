import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponseDto } from '@/shared/api/generated/api';
import { api } from '@/shared/api/index';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setupInterceptors = () => {
  api.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  api.instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _isRetry?: boolean };

      if (error.response?.status === 401 && originalRequest && !originalRequest._isRetry) {
        originalRequest._isRetry = true;
        try {
          const response = await api.api.authControllerRefresh();

          const newAccessToken = (response.data as AuthResponseDto).accessToken;
          setAccessToken(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return api.instance.request(originalRequest);
        } catch (refreshError) {
          accessToken = null;
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );
};
