import axios, { AxiosError } from 'axios';
import { APIError } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly JWT cookie
  timeout: 15000,
});

export class ApiRequestError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

async function normalizeErrorData(error: AxiosError<APIError>): Promise<APIError | undefined> {
  const data = error.response?.data;
  // requests made with responseType: 'blob' (CSV export) still receive a Blob
  // body even on error status codes, so it must be read back to JSON first.
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      return JSON.parse(text) as APIError;
    } catch {
      return undefined;
    }
  }
  return data;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIError>) => {
    const data = await normalizeErrorData(error);
    if (data) {
      return Promise.reject(new ApiRequestError(data.message, data.error?.code ?? 'UNKNOWN_ERROR', error.response?.status));
    }
    if (error.request) {
      return Promise.reject(new ApiRequestError('Network error — check your connection', 'NETWORK_ERROR'));
    }
    return Promise.reject(new ApiRequestError(error.message, 'UNKNOWN_ERROR'));
  }
);
