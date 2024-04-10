import { ChangeEvent, FC, useCallback, useState } from 'react';

import AlbumService from 'services/AlbumService';
import { Record } from 'immutable';

import { Album, Category } from 'services/types';
import AlbumForm from './AlbumForm';

type EditAlbumProps = {
  albumInfo: Album;
  categoryInfo?: Category[];
  onUpdateAlbum: () => void;
  onCancel: () => void;
};

export const EditAlbum: FC<EditAlbumProps> = ({
  albumInfo: albumInfoProps,
  categoryInfo,
  onUpdateAlbum,
  onCancel,
}) => {
  const [albumInfo, setAlbumInfo] = useState(Record(albumInfoProps)());

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const name: string = e.target.name;

      if (name === 'title' || name === 'text') {
        setAlbumInfo(albumInfo.set(name, e.target.value));
      }
    },
    [albumInfo],
  );

  const setIsPrivate = useCallback(
    (isPrivate: boolean) => {
      setAlbumInfo(albumInfo.setIn(['album', 'is_private'], isPrivate));
    },
    [albumInfo],
  );

  const handleCategoryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAlbumInfo(albumInfo.set('category_id', e.target.value));
    },
    [albumInfo],
  );

  const updateAlbum = useCallback(async () => {
    if (!albumInfo.album) {
      alert('앨범 정보 오류');
    } else if (!albumInfo.title) {
      alert('제목을 입력해 주세요');
    } else if (
      categoryInfo &&
      categoryInfo.length > 0 &&
      !albumInfo.category_id
    ) {
      alert('카테고리를 선택해 주세요');
    } else {
      try {
        await AlbumService.updateAlbum(
          albumInfo.content_id,
          albumInfo.toJSON(),
        );
        onUpdateAlbum();
      } catch (err) {
        console.error(err);
        alert('업데이트 실패');
      }
    }
  }, [albumInfo, categoryInfo, onUpdateAlbum]);

  return (
    <AlbumForm
      caption="앨범 수정"
      // albumInfo={albumInfo}
      title={albumInfo.title}
      text={albumInfo.text}
      isPrivate={albumInfo.album ? albumInfo.album.is_private : false}
      checkedCategory={albumInfo.category_id}
      setIsPrivate={setIsPrivate}
      categories={categoryInfo}
      handleCategory={handleCategoryChange}
      handleChange={handleChange}
      confirmAlbum={() => updateAlbum()}
      cancelAlbum={onCancel}
    />
  );
};
