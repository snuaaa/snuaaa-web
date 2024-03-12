import { API } from './index';

import { AxiosPromise } from 'axios';
import { UsersSearchType } from '../types/SearchTypes';

import { Comment, Content, Photo, User } from './types';

export interface UpdateUserInfoRequest {
  username: string;
  aaa_no: string;
  profileImg?: File;
}
export interface UpdatePasswordRequest {
  password: string;
  newPassword: string;
  newPasswordCf: string;
}
export interface FindIdRequest {
  name: string;
  email: string;
}

export interface FindPasswordRequest {
  id: string;
  name: string;
  email: string;
}

const UserService = {
  retrieveUserInfo: function (user_uuid?: string): AxiosPromise<{
    userInfo: User;
  }> {
    if (user_uuid) {
      return API.get(`userinfo/${user_uuid}`);
    } else {
      return API.get('userinfo');
    }
  },

  updateUserInfo: function (data: UpdateUserInfoRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return API.patch('userinfo', data);
  },

  deleteUserInfo: function () {
    return API.delete('userinfo');
  },

  retrieveUsers: function (sortOption?: UsersSearchType): AxiosPromise<{
    userInfo: User[];
    count: number;
  }> {
    let query = '';
    if (sortOption) {
      // query += '/sort?'
      query += '?';
      query += `sort=${sortOption.sort}&`;
      query += `order=${sortOption.order}&`;
      sortOption.limit && (query += `limit=${sortOption.limit}&`);
      sortOption.offset && (query += `offset=${sortOption.offset}&`);
      query.substring(query.length - 1);
    }

    return API.get(`userinfo/all${query}`);
  },

  retrieveUserPosts: function (user_uuid?: string): AxiosPromise<{
    postList: Content[];
  }> {
    if (user_uuid) {
      return API.get(`userinfo/${user_uuid}/posts`);
    } else {
      return API.get('userinfo/posts');
    }
  },

  retrieveUserPhotos: function (user_uuid?: string): AxiosPromise<{
    photoList: Photo[];
  }> {
    if (user_uuid) {
      return API.get(`userinfo/${user_uuid}/photos`);
    } else {
      return API.get('userinfo/photos');
    }
  },

  retrieveUserComments: function (user_uuid?: string): AxiosPromise<{
    commentList: Comment[];
  }> {
    if (user_uuid) {
      return API.get(`userinfo/${user_uuid}/comments`);
    } else {
      return API.get('userinfo/comments');
    }
  },

  updatePassword: function (data: UpdatePasswordRequest) {
    return API.patch('userinfo/password', data);
  },

  findId: function (data: FindIdRequest) {
    return API.post('userinfo/find/id', data);
  },

  findPassword: function (data: FindPasswordRequest) {
    return API.post('userinfo/find/pw', data);
  },

  searchMini: function (name: string) {
    return API.get<{ userList: User[] }>(`userinfo/search/mini?name=${name}`);
  },
};

export default UserService;
