import { ChangeEvent, useCallback, useState } from 'react';
import { List } from 'immutable';
import PhotoService, { CreatePhotoRequest } from '~/services/PhotoService';
import UploadService from '~/services/UploadService';

type Props = {
  boardId: string;
  albumId?: number;
  onCreatePhoto: () => void;
};

type CreatePhotoForm = Partial<CreatePhotoRequest>;

const MAX_SIZE = 100 * 1024 * 1024;
const DEFAULT_PHOTO_INFO = {
  title: '',
  text: '',
  board_id: '',
  // date: '',
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: '',
  tags: [],
};

const useCreatePhoto = ({ boardId, albumId, onCreatePhoto }: Props) => {
  const [photoInfo, setPhotoInfo] = useState(List<CreatePhotoForm>());
  const [editingIdx, setEditingIdx] = useState(-1);
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const name: string = e.target.name;
      setPhotoInfo(
        photoInfo.set(editingIdx, {
          ...photoInfo.get(editingIdx),
          [name]: e.target.value,
        }),
      );
    },
    [editingIdx, photoInfo],
  );

  const handleDate = useCallback(
    (date: Date) => {
      if (
        editingIdx >= 0 &&
        editingIdx < photoInfo.size &&
        photoInfo.get(editingIdx)
      ) {
        setPhotoInfo(
          photoInfo.set(editingIdx, {
            ...photoInfo.get(editingIdx),
            date: date,
          }),
        );
      }
    },
    [editingIdx, photoInfo],
  );

  const uploadImage = useCallback(async (file: File, index: number) => {
    const { data } = await UploadService.uploadImage(file, true);
    setPhotoInfo((photoInfo) =>
      photoInfo.set(index, {
        ...photoInfo.get(index),
        img_url: data.imgUrl,
        thumbnail_url: data.thumbnailUrl,
      }),
    );
  }, []);

  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    if (e.target.files.length > 50) {
      alert('한 번에 50장 이상의 사진은 업로드 할 수 없습니다.');
      return;
    }

    const fileArray = Array.from(e.target.files);
    const sizeSum = fileArray.reduce((acc, file) => {
      return acc + file.size;
    }, 0);
    if (sizeSum > MAX_SIZE) {
      alert('한 번에 100MB 이상의 사진은 업로드 할 수 없습니다.');
      return;
    }

    const newPhotoInfos = fileArray.map(() => DEFAULT_PHOTO_INFO);
    setPhotoInfo(photoInfo.concat(newPhotoInfos));
    fileArray.forEach((file, index) =>
      uploadImage(file, photoInfo.size + index),
    );
  };

  const removeImg = useCallback(
    (index: number) => {
      setEditingIdx(editingIdx - 1);
      setPhotoInfo(photoInfo.delete(index));
    },
    [editingIdx, photoInfo],
  );

  const handleChangeTag = useCallback(
    (tagId: string) => {
      const info = photoInfo.get(editingIdx);

      if (info && info.tags) {
        if (info.tags.includes(tagId)) {
          setPhotoInfo(
            photoInfo.set(editingIdx, {
              ...photoInfo.get(editingIdx),
              tags: info.tags.filter((tag) => tagId !== tag),
            }),
          );
        } else {
          setPhotoInfo(
            photoInfo.set(editingIdx, {
              ...photoInfo.get(editingIdx),
              tags: info.tags.concat(tagId),
            }),
          );
        }
      }
    },
    [editingIdx, photoInfo],
  );

  const createPhotos = useCallback(async () => {
    setIsCreating(true);
    try {
      await PhotoService.createPhoto({
        list: photoInfo.toJS() as CreatePhotoRequest[],
        album_id: albumId,
        board_id: boardId,
      });
      onCreatePhoto();
    } catch (err) {
      console.error(err);
      alert('사진 생성 실패');
      setIsCreating(false);
    }
  }, [albumId, boardId, onCreatePhoto, photoInfo]);

  return {
    editingIdx,
    photoInfo,
    isCreating,
    handleChange,
    handleDate,
    setEditingIdx,
    handleChangeFile,
    removeImg,
    handleChangeTag,
    createPhotos,
  };
};

export default useCreatePhoto;
