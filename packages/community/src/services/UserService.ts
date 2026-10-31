import { API } from './index';

import { UsersSearchType } from '../types/SearchTypes';

import { User } from './types';

// TODO: 타입 개선 필요
export type UpdateUserInfoRequest = {
  username: string;
  aaa_no: string;
  email: string;
  mobile: string;
  major: string;
  col_no: string;
  profile_url?: string;
  /** @deprecated sent back unchanged so the update doesn't clear it */
  profile_path?: string;
  introduction?: string;
};
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

  updateMyUserInfo: function (data: UpdateUserInfoRequest) {
    return API.patch('user', data);
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

  /** Grade 1–3 only; see `canChangeGrade`. */
  updateUserGrade: function (user_uuid: string, grade: number) {
    return API.patch(`user/${user_uuid}/grade`, { grade });
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
