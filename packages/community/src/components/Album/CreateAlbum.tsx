import React, { useState, ChangeEvent, useEffect } from 'react';
import EditAlbumComponent from '../../components/Album/EditAlbumComponent';
import PhotoBoardService from '../../services/PhotoBoardService';
import CrtAlbumType from '../../types/CrtAlbumType';
import CategoryType from '../../types/CategoryType';
import useBlockBackgroundScroll from '../../hooks/useBlockBackgroundScroll';
const TAG = 'CREATEALBUM';

type CreateAlbumProps = {
    board_id: string;
    categories?: CategoryType[];
    togglePopUp: () => void;
    fetch: () => void;
}
function CreateAlbum(props: CreateAlbumProps) {

  useBlockBackgroundScroll();
  const [albumInfo, setAlbumInfo] = useState<CrtAlbumType>({
    title: '',
    text: '',
    is_private: false
  });


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlbumInfo({
      ...albumInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAlbumInfo({
      ...albumInfo,
      category_id: e.target.value
    });
  };

  const setIsPrivate = (isPrivate: boolean) => {
    setAlbumInfo({
      ...albumInfo,
      is_private: isPrivate
    });
  };

  const createAlbum = async () => {

    if (!albumInfo.title) {
      alert('제목을 입력해 주세요');
    }
    else if (props.categories && !albumInfo.category_id) {
      alert('카테고리를 선택해 주세요');
    }
    else {
      await PhotoBoardService.createAlbum(props.board_id, albumInfo)
        .then(() => {
          console.log('[%s] Create Album Success', TAG);
          props.togglePopUp();
          props.fetch();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('앨범 생성 실패');
        });
    }
  };

  return (
    <EditAlbumComponent
      caption="앨범 생성"
      title={albumInfo.title}
      text={albumInfo.text}
      isPrivate={albumInfo.is_private}
      setIsPrivate={setIsPrivate}
      checkedCategory={albumInfo.category_id}
      categories={props.categories}
      handleCategory={handleCategoryChange}
      handleChange={handleChange}
      confirmAlbum={createAlbum}
      cancelAlbum={props.togglePopUp}
    />
  );
}

export default CreateAlbum;
