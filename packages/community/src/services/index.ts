import axios, { AxiosPromise } from 'axios';
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
  get: function (url: string) {
    return axiosInstance.get(`${SERVER_URL}api/${url}`);
  },

  post: function (url: string, data: unknown): AxiosPromise {
    return axiosInstance.post(`${SERVER_URL}api/${url}`, data);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAttachedImage(data: any) {
  return axiosInstance.post(SERVER_URL + 'api/image', data);
}
