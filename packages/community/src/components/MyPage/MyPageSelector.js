import React from 'react';
import MyPageViewEnum from 'common/MyPageViewEnum';

const MyPageSelector = ({selected, selectPost, selectPhoto, selectComment}) => {

  const selectorPostClass = selected === MyPageViewEnum.POST ? 'selected' : '';
  const selectorPhotoClass = selected === MyPageViewEnum.PHOTO ? 'selected' : '';
  const selectorCommentClass = selected === MyPageViewEnum.COMMENT ? 'selected' : '';

  return (
    <div className="my-page-selector-wrapper">
      <div className={`my-page-selector ${selectorPostClass}`} onClick={selectPost}><span className="enif-hide-mobile">등록한 </span>게시글</div>
      <div className={`my-page-selector ${selectorPhotoClass}`} onClick={selectPhoto}><span className="enif-hide-mobile">등록한 </span>사진</div>
      <div className={`my-page-selector ${selectorCommentClass}`} onClick={selectComment}><span className="enif-hide-mobile">등록한 </span>댓글</div>
    </div>
  );
};

export default MyPageSelector;
