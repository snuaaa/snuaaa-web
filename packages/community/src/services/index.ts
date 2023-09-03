import axios, { AxiosResponse, AxiosPromise } from 'axios';
import { getToken } from '../utils/tokenManager';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

axios.defaults.headers.common['Authorization'] = 'Bearer ' + getToken();


interface IAaaService {
    get: (url: string) => AxiosPromise;
}

export const AaaService: any = {
    
 
  get: function(url: string) {
    return axios.get(`${SERVER_URL}api/${url}`);
  },
    
  post: function(url: string, data: unknown): AxiosPromise {
    return axios.post(`${SERVER_URL}api/${url}`, data);
  },

  postWithProgress: function(url: string, data: unknown, cb: (pg: ProgressEvent)=> void) {
    return axios.post(`${SERVER_URL}api/${url}`, data, {
      onUploadProgress: cb
    });
  },

  patch: function(url: string, data: unknown): AxiosPromise {
    return axios.patch(`${SERVER_URL}api/${url}`, data);
  },
    
  delete: function(url: string): AxiosPromise {
    return axios.delete(`${SERVER_URL}api/${url}`);
  }
};


// export class AaaService<T> {
    
//     get = function(url: string): AxiosPromise<T> {
//         return axios.get(`${SERVER_URL}api/${url}`)
//     }
    
//     post = function(url: string, data: object): AxiosPromise<T> {
//         return axios.post(`${SERVER_URL}api/${url}`, data)
//     }

//     patch = function(url: string, data: object): AxiosPromise<T> {
//         return axios.patch(`${SERVER_URL}api/${url}`, data)
//     }
    
//     delete = function(url: string): AxiosPromise<T> {
//         return axios.delete(`${SERVER_URL}api/${url}`)
//     }
// }


export function createAttachedImage(data: any) {
  return axios.post(SERVER_URL + 'api/image', data);
}
