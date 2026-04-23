import { Api } from './generated/api';

export const api = new Api({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export * from './generated/api';
export { apiInstance } from './base';
