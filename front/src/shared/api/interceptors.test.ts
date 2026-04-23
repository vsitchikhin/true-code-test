import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { api } from '@/shared/api/index';
import { setupInterceptors, setAccessToken } from '@/shared/api/interceptors';

// Мокаем сам api объект
vi.mock('./index', () => ({
  api: {
    instance: {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      request: vi.fn(),
    },
    api: {
      authControllerRefresh: vi.fn(),
    },
  },
}));

describe('API Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupInterceptors();
  });

  it('should register interceptors', () => {
    expect(api.instance.interceptors.request.use).toHaveBeenCalled();
    expect(api.instance.interceptors.response.use).toHaveBeenCalled();
  });

  it('should add Authorization header if token exists', () => {
    // Получаем функцию-обработчик запроса
    const useMock = vi.mocked(api.instance.interceptors.request.use);
    const requestHandler = useMock.mock.calls[0][0] as (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig;

    setAccessToken('test-token');

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = requestHandler(config);

    expect(result.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not add Authorization header if token is missing', () => {
    const useMock = vi.mocked(api.instance.interceptors.request.use);
    const requestHandler = useMock.mock.calls[0][0] as (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig;

    setAccessToken(null);

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = requestHandler(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
