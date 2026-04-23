import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api } from '@/shared/api/index';
import { setupInterceptors } from '@/shared/api/interceptors';

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

type RequestHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
type ResponseSuccessHandler = (response: AxiosResponse) => AxiosResponse;
type ResponseErrorHandler = (error: AxiosError) => Promise<unknown>;

function getHandlers() {
  const requestUseMock = vi.mocked(api.instance.interceptors.request.use);
  const responseUseMock = vi.mocked(api.instance.interceptors.response.use);

  const requestHandler = requestUseMock.mock.calls[0][0] as RequestHandler;
  const responseSuccess = responseUseMock.mock.calls[0][0] as ResponseSuccessHandler;
  const responseError = responseUseMock.mock.calls[0][1] as ResponseErrorHandler;

  return { requestHandler, responseSuccess, responseError };
}

describe('API Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupInterceptors();
  });

  it('должен зарегистрировать перехватчики запроса и ответа', () => {
    expect(api.instance.interceptors.request.use).toHaveBeenCalled();
    expect(api.instance.interceptors.response.use).toHaveBeenCalled();
  });

  it('должен устанавливать withCredentials для всех запросов', () => {
    const { requestHandler } = getHandlers();
    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = requestHandler(config);
    expect(result.withCredentials).toBe(true);
  });

  it('должен прозрачно пропускать успешные ответы', () => {
    const { responseSuccess } = getHandlers();
    const response = { status: 200, data: 'ok' } as AxiosResponse;
    expect(responseSuccess(response)).toBe(response);
  });

  it('должен повторить запрос после 401, вызвав refresh', async () => {
    const { responseError } = getHandlers();

    vi.mocked(api.api.authControllerRefresh).mockResolvedValue({} as never);
    vi.mocked(api.instance.request).mockResolvedValue({ data: 'retried' });

    const error = {
      response: { status: 401 },
      config: { url: '/api/posts', _isRetry: false },
    } as unknown as AxiosError;

    const result = await responseError(error);

    expect(api.api.authControllerRefresh).toHaveBeenCalledTimes(1);
    expect(api.instance.request).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: 'retried' });
  });

  it('должен установить _isRetry, чтобы не зациклиться', async () => {
    const { responseError } = getHandlers();

    vi.mocked(api.api.authControllerRefresh).mockResolvedValue({} as never);
    vi.mocked(api.instance.request).mockResolvedValue({});

    const config: InternalAxiosRequestConfig & { _isRetry?: boolean } = {
      url: '/api/posts',
      _isRetry: false,
      headers: {} as never,
    };
    const error = { response: { status: 401 }, config } as unknown as AxiosError;

    await responseError(error);

    expect(config._isRetry).toBe(true);
  });

  it('не должен повторять запрос если _isRetry уже true', async () => {
    const { responseError } = getHandlers();

    const error = {
      response: { status: 401 },
      config: { url: '/api/posts', _isRetry: true },
    } as unknown as AxiosError;

    await expect(responseError(error)).rejects.toBe(error);
    expect(api.api.authControllerRefresh).not.toHaveBeenCalled();
  });

  it('не должен перехватывать 401 с /api/auth/login', async () => {
    const { responseError } = getHandlers();

    const error = {
      response: { status: 401 },
      config: { url: '/api/auth/login', _isRetry: false },
    } as unknown as AxiosError;

    await expect(responseError(error)).rejects.toBe(error);
    expect(api.api.authControllerRefresh).not.toHaveBeenCalled();
  });

  it('не должен перехватывать 401 с /api/auth/refresh', async () => {
    const { responseError } = getHandlers();

    const error = {
      response: { status: 401 },
      config: { url: '/api/auth/refresh', _isRetry: false },
    } as unknown as AxiosError;

    await expect(responseError(error)).rejects.toBe(error);
    expect(api.api.authControllerRefresh).not.toHaveBeenCalled();
  });

  it('должен пробросить ошибку, если refresh сам вернул ошибку', async () => {
    const { responseError } = getHandlers();
    const refreshError = new Error('refresh failed');

    vi.mocked(api.api.authControllerRefresh).mockRejectedValue(refreshError);

    const error = {
      response: { status: 401 },
      config: { url: '/api/posts', _isRetry: false },
    } as unknown as AxiosError;

    await expect(responseError(error)).rejects.toBe(refreshError);
    expect(api.instance.request).not.toHaveBeenCalled();
  });

  it('должен пропускать ошибки не 401 без вызова refresh', async () => {
    const { responseError } = getHandlers();

    const error = {
      response: { status: 403 },
      config: { url: '/api/posts', _isRetry: false },
    } as unknown as AxiosError;

    await expect(responseError(error)).rejects.toBe(error);
    expect(api.api.authControllerRefresh).not.toHaveBeenCalled();
  });
});
