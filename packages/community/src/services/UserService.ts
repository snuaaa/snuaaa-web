import { AaaService } from './index';
import UserType from '../types/UserType';
import { AxiosPromise } from 'axios';
import { UsersSearchType } from '../types/SearchTypes';
import ContentType from '../types/ContentType';
import CommentType from '../types/CommentType';
import PhotoType from '../types/PhotoType';

const UserService = {

  retrieveUserInfo: function (user_uuid?: string): AxiosPromise<{
        userInfo: UserType
    }> {
    if (user_uuid) {
      return AaaService.get(`userinfo/${user_uuid}`);
    }
    else {
      return AaaService.get('userinfo');
    }
  },

  updateUserInfo: function (data: any) {
    return AaaService.patch('userinfo', data);
  },

  deleteUserInfo: function () {
    return AaaService.delete('userinfo');
  },

  retrieveUsers: function (sortOption?: UsersSearchType): AxiosPromise<{
        userInfo: UserType[],
        count: number
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

    return AaaService.get(`userinfo/all${query}`);
  },

  retrieveUserPosts: function (user_uuid?: string): AxiosPromise<{
        postList: ContentType[]
    }> {
    if (user_uuid) {
      return AaaService.get(`userinfo/${user_uuid}/posts`);
    }
    else {
      return AaaService.get('userinfo/posts');
    }
  },

  retrieveUserPhotos: function (user_uuid?: string): AxiosPromise<{
        photoList: PhotoType[]
    }> {
    if (user_uuid) {
      return AaaService.get(`userinfo/${user_uuid}/photos`);
    }
    else {
      return AaaService.get('userinfo/photos');
    }
  },

  retrieveUserComments: function (user_uuid?: string): AxiosPromise<{
        commentList: CommentType[]
    }> {
    if (user_uuid) {
      return AaaService.get(`userinfo/${user_uuid}/comments`);
    }
    else {
      return AaaService.get('userinfo/comments');
    }
  },

  updatePassword: function (data: any) {
    return AaaService.patch('userinfo/password', data);
  },

  findId: function (data: any) {
    return AaaService.post('userinfo/find/id', data);
  },

  findPw: function (data: any) {
    return AaaService.post('userinfo/find/pw', data);
  },

  searchMini: function (name: string) {
    if (name) {
      return AaaService.get(`userinfo/search/mini?name=${name}`);
    }
  }
};


// class UserService extends AaaService<UserType> {

//     retrieveUserInfo(user_uuid: string): AxiosPromise<UserType> {
//         if (user_uuid) {
//             return this.get(`userinfo/${user_uuid}`)
//         }
//         else {
//             return this.get(`userinfo`);
//         }
//     }

//     updateUserInfo(data: UserType) {
//         return this.patch('userinfo', data);
//     }

//     deleteUserInfo() {
//         return this.delete('userinfo');
//     }

//     retrieveUserPosts(user_uuid: string) {
//         if (user_uuid) {
//             return this.get(`userinfo/${user_uuid}/posts`);
//         }
//         else {
//             return this.get('userinfo/posts');
//         }
//     }

//     retrieveUserPhotos(user_uuid: string) {
//         if (user_uuid) {
//             return this.get(`userinfo/${user_uuid}/photos`);
//         }
//         else {
//             return this.get('userinfo/photos');
//         }
//     }

//     retrieveUserComments(user_uuid: string) {
//         if (user_uuid) {
//             return this.get(`userinfo/${user_uuid}/comments`);
//         }
//         else {
//             return this.get(`userinfo/comments`);
//         }
//     }

//     updatePassword(data: any) {
//         return this.patch(`userinfo/password`, data)
//     }

//     findId(data: any) {
//         return this.post(`userinfo/find/id`, data)
//     }

//     findPw(data: any) {
//         return this.post(`userinfo/find/pw`, data)
//     }

//     searchMini(name: string) {
//         if (name) {
//             return this.get(`userinfo/search/mini?name=${name}`)
//         }
//     }
// }

export default UserService;
