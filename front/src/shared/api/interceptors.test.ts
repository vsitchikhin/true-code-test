import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { api } from '@/shared/api/index';
import { setupInterceptors } from '@/shared/api/interceptors';

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

  it('should set withCredentials to true for all requests', () => {
    // Получаем функцию-обработчик запроса
    const useMock = vi.mocked(api.instance.interceptors.request.use);
    const requestHandler = useMock.mock.calls[0][0] as (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig;

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = requestHandler(config);

    expect(result.withCredentials).toBe(true);
  });
});
