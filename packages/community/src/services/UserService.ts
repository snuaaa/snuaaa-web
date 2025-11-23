import { API } from './index';

import { UsersSearchType } from '../types/SearchTypes';

import { User } from './types';

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
  retrieveUserInfo: function (user_uuid?: string) {
    const url = user_uuid ? `userinfo/${user_uuid}` : 'userinfo';
    return API.get<{
      userInfo: User;
    }>(url);
  },

  updateUserInfo: function (data: UpdateUserInfoRequest) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return API.patch('userinfo', formData);
  },

  deleteUserInfo: function () {
    return API.delete('userinfo');
  },

  retrieveUsers: function (sortOption?: UsersSearchType) {
    return API.get<{
      userInfo: User[];
      count: number;
    }>('userinfo/all', {
      params: sortOption,
    });
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
