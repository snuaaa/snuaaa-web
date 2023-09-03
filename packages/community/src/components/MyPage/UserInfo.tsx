import React, { useState, useEffect } from 'react';
import Loading from '../Common/Loading';
import MyProfile from './MyProfile';
import MyPostList from './MyPostList';
import MyPhotoList from './MyPhotoList';
import MyCommentList from './MyCommentList';
import MyPageSelector from './MyPageSelector';
import MyPageViewEnum from '../../common/MyPageViewEnum';
import UserService from '../../services/UserService';
import UserType from '../../types/UserType';
import ContentType from '../../types/ContentType';
import PhotoType from '../../types/PhotoType';
import CommentType from '../../types/CommentType';

type UserInfoProps = {
    user_uuid?: string;
    isMyinfo: boolean;
}

function UserInfo ({user_uuid, isMyinfo} : UserInfoProps) {

  const [postList, setPostList] = useState<ContentType[]>([]);
  const [photoList, setPhotoList] = useState<PhotoType[]>([]);
  const [commentList, setCommentList] = useState<CommentType[]>([]);
  const [userInfo, setUserInfo] = useState<UserType>();
  const [isShow, setIsShow] = useState<boolean>(false);
  const [userContentView, setUserContentView] = useState<number>(MyPageViewEnum.POST);

  useEffect(() => {
    fetch();
  }, [userContentView]);


  const fetch = async () => {

    setIsShow(false);

    if (!userInfo) {
      await Promise.all([UserService.retrieveUserInfo(user_uuid), UserService.retrieveUserPosts(user_uuid)])
        .then((res) => {
          setUserInfo(res[0].data.userInfo);
          setPostList(res[1].data.postList);
          setIsShow(true);
        });
    }
    else {
      if (userContentView === MyPageViewEnum.POST) {
        await UserService.retrieveUserPosts(user_uuid)
          .then((res) => {
            setPostList(res.data.postList);
            setIsShow(true);
          });
      }
      else if (userContentView === MyPageViewEnum.PHOTO) {
        await UserService.retrieveUserPhotos(user_uuid)
          .then((res) => {
            setPhotoList(res.data.photoList);
            setIsShow(true);
          });
      }
      else if (userContentView === MyPageViewEnum.COMMENT) {
        await UserService.retrieveUserComments(user_uuid)
          .then((res) => {
            setCommentList(res.data.commentList);
            setIsShow(true);
          });
      }
      else {
        console.error('contentView Exception');
      }
    }
  };

  const makeMyContentsList = () => {

    if (userContentView === MyPageViewEnum.POST) {
      return (
        <MyPostList posts={postList} />
      );
    }
    else if (userContentView === MyPageViewEnum.PHOTO) {
      return (
        <MyPhotoList photos={photoList} />
      );
    }
    else if (userContentView === MyPageViewEnum.COMMENT) {
      return (
        <MyCommentList comments={commentList} />
      );
    }
    else {
      return;
    }
  };

  return (
    <>
      {!isShow && <Loading />}
      <div className="my-wrapper">
        <div className="my-title-wrapper">
          <h3>{isMyinfo ? 'My' : 'User'} Page</h3>
        </div>
        {userInfo && <MyProfile userInfo={userInfo} isCanEdit={isMyinfo}/>}

        <MyPageSelector
          selected={userContentView}
          selectPost={() => setUserContentView(MyPageViewEnum.POST)}
          selectPhoto={() => setUserContentView(MyPageViewEnum.PHOTO)}
          selectComment={() => setUserContentView(MyPageViewEnum.COMMENT)}
        />
        {makeMyContentsList()}
      </div>
    </>
  );
}

export default UserInfo;
