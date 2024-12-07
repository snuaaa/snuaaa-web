import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { getToken } from '../utils/token';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const setApiAuth = (token: string) => {
  axiosInstance.defaults.headers.Authorization = 'Bearer ' + token;
};

export const API = {
  get: async function <Response>(url: string) {
    const response = await axiosInstance.get<Response>(
      `${SERVER_URL}api/${url}`,
    );
    return response.data;
  },

  // TODO: fix
  post: function <T>(url: string, data: unknown, config?: AxiosRequestConfig) {
    return axiosInstance.post<T>(`${SERVER_URL}api/${url}`, data, config);
  },

  postWithProgress: function (
    url: string,
    data: unknown,
    cb: (pg: ProgressEvent) => void,
  ) {
    return axiosInstance.post(`${SERVER_URL}api/${url}`, data, {
      onUploadProgress: cb,
    });
  },

  patch: function (url: string, data: unknown): AxiosPromise {
    return axiosInstance.patch(`${SERVER_URL}api/${url}`, data);
  },

  delete: function (url: string): AxiosPromise {
    return axiosInstance.delete(`${SERVER_URL}api/${url}`);
  },
};
