import { Api } from '@/shared/api/generated/api';

export const api = new Api({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

export * from '@/shared/api/generated/api';
export { apiInstance } from '@/shared/api/base';
