import axios, { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import { getToken } from '../utils/token';
import { SERVER_URL } from '~/constants/env';

const axiosInstance = axios.create({
  baseURL: `${SERVER_URL}api/`,
});

// Request interceptor: 매 요청마다 쿠키에서 최신 토큰을 읽어 Authorization 헤더에 설정
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = {
  get: async function <Response>(url: string, config?: AxiosRequestConfig) {
    const response = await axiosInstance.get<Response>(url, config);
    return response.data;
  },

  post: function <T>(url: string, data: unknown, config?: AxiosRequestConfig) {
    return axiosInstance.post<T>(url, data, config);
  },

  postWithProgress: function (
    url: string,
    data: unknown,
    cb: (pg: AxiosProgressEvent) => void,
  ) {
    return axiosInstance.post(url, data, {
      onUploadProgress: cb,
    });
  },

  patch: function <T = unknown>(url: string, data: unknown) {
    return axiosInstance.patch<T>(url, data);
  },

  delete: function (url: string) {
    return axiosInstance.delete(url);
  },
};
