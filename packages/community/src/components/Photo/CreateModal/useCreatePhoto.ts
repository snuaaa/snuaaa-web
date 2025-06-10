import { formOptions } from '@tanstack/react-form';
import { ChangeEvent, useCallback, useState } from 'react';
import PhotoService, { CreatePhotoRequest } from '~/services/PhotoService';
import UploadService from '~/services/UploadService';
import { useAppForm } from './formContext';

type Props = {
  boardId: string;
  albumId?: number;
  onCreatePhoto: () => void;
};

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
  const [editingIdx, setEditingIdx] = useState(-1);

  const formOpts = formOptions({
    defaultValues: {
      list: [],
      board_id: boardId,
      album_id: albumId,
    } as CreatePhotoRequest,
  });

  const form = useAppForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      const { list, board_id, album_id } = value;
      if (list.some((info) => !info.img_url)) {
        alert('사진 업로드를 기다려주세요.');
        return;
      }
      try {
        await PhotoService.createPhoto({
          list,
          board_id,
          album_id,
        });
        onCreatePhoto();
      } catch (err) {
        console.error(err);
        alert('사진 생성 실패');
      }
    },
  });

  const uploadImage = useCallback(
    async (file: File, index: number) => {
      console.log(index);
      const { data } = await UploadService.uploadImage(file, true);
      form.setFieldValue(`list[${index}]`, {
        ...form.getFieldValue(`list[${index}]`),
        img_url: data.imgUrl,
        thumbnail_url: data.thumbnailUrl,
      });
    },
    [form],
  );

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

    const prevListLength = form.getFieldValue('list').length;
    form.setFieldValue(
      'list',
      form.getFieldValue('list').concat(newPhotoInfos),
    );

    fileArray.forEach((file, index) =>
      uploadImage(file, prevListLength + index),
    );
  };

  const removeImg = useCallback(
    (index: number) => {
      const updatedList = form
        .getFieldValue('list')
        .filter((_, idx) => idx !== index);
      form.setFieldValue('list', updatedList);
      setEditingIdx(editingIdx - 1);
    },
    [editingIdx, form],
  );

  const handleChangeTag = useCallback(
    (tagId: string) => {
      const photoInfo = form.getFieldValue(`list[${editingIdx}]`);

      if (!photoInfo) {
        return;
      }

      if (photoInfo.tags.includes(tagId)) {
        form.setFieldValue(`list[${editingIdx}]`, {
          ...photoInfo,
          tags: photoInfo.tags.filter((tag) => tag !== tagId),
        });
      } else {
        form.setFieldValue(`list[${editingIdx}]`, {
          ...photoInfo,
          tags: [...photoInfo.tags, tagId],
        });
      }
    },
    [editingIdx, form],
  );

  return {
    editingIdx,
    form,
    setEditingIdx,
    handleChangeFile,
    removeImg,
    handleChangeTag,
  };
};

export default useCreatePhoto;
