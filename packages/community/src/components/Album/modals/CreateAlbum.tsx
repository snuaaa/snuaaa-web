import { useState, ChangeEvent } from 'react';
import PhotoBoardService, {
  CreateAlbumRequest,
} from '~/services/PhotoBoardService';

import useBlockBackgroundScroll from '~/hooks/useBlockBackgroundScroll';
import { Category } from '~/services/types';
import AlbumForm from './AlbumForm';

type CreateAlbumProps = {
  board_id: string;
  categories?: Category[];
  onCreate: () => void;
  onCancel: () => void;
};
function CreateAlbum({
  board_id,
  categories,
  onCreate,
  onCancel,
}: CreateAlbumProps) {
  useBlockBackgroundScroll();
  const [albumInfo, setAlbumInfo] = useState<CreateAlbumRequest>({
    title: '',
    text: '',
    is_private: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setAlbumInfo({
      ...albumInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAlbumInfo({
      ...albumInfo,
      category_id: e.target.value,
    });
  };

  const setIsPrivate = (isPrivate: boolean) => {
    setAlbumInfo({
      ...albumInfo,
      is_private: isPrivate,
    });
  };

  const createAlbum = async () => {
    if (!albumInfo.title) {
      alert('제목을 입력해 주세요');
    } else if (categories && !albumInfo.category_id) {
      alert('카테고리를 선택해 주세요');
    } else {
      try {
        await PhotoBoardService.createAlbum(board_id, albumInfo);
        onCreate();
      } catch (err) {
        console.error(err);
        alert('앨범 생성 실패');
      }
    }
  };

  return (
    <AlbumForm
      caption="앨범 생성"
      title={albumInfo.title}
      text={albumInfo.text}
      isPrivate={albumInfo.is_private}
      setIsPrivate={setIsPrivate}
      checkedCategory={albumInfo.category_id}
      categories={categories}
      handleCategory={handleCategoryChange}
      handleChange={handleChange}
      confirmAlbum={createAlbum}
      cancelAlbum={onCancel}
    />
  );
}

export default CreateAlbum;
