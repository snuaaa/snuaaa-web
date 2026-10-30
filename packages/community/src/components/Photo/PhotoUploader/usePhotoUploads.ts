import { useCallback, useEffect, useRef, useState } from 'react';
import { CreatePhotoInfo } from '~/services/PhotoService';
import UploadService from '~/services/UploadService';

export const MAX_COUNT = 50;
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

export type PhotoDraft = Omit<CreatePhotoInfo, 'img_url' | 'thumbnail_url'>;

export type UploadItem = {
  key: string;
  file: File;
  /** A local object URL, shown before the upload finishes. */
  preview: string;
  status: 'uploading' | 'done' | 'error';
  imgUrl?: string;
  thumbnailUrl?: string;
  info: PhotoDraft;
};

const emptyInfo = (): PhotoDraft => ({
  title: '',
  text: '',
  date: '',
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: '',
  tags: [],
});

let nextKey = 0;

/**
 * The picked photos. Each one uploads as soon as it's added, so 올리기
 * only has to send the URLs and the info.
 */
export default function usePhotoUploads() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Free the previews when the uploader closes.
  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

  const patch = useCallback((key: string, next: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...next } : item)),
    );
  }, []);

  const upload = useCallback(
    async (key: string, file: File) => {
      patch(key, { status: 'uploading' });
      try {
        const { data } = await UploadService.uploadImage(file, 'photo', true);
        patch(key, {
          status: 'done',
          imgUrl: data.imgUrl,
          thumbnailUrl: data.thumbnailUrl,
        });
      } catch (err) {
        console.error(err);
        patch(key, { status: 'error' });
      }
    },
    [patch],
  );

  /** Adds the files, or returns why they can't be added. */
  const add = (files: File[]): string | null => {
    const images = files.filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) {
      return files.length > 0 ? '사진 파일만 올릴 수 있어요.' : null;
    }
    if (items.length + images.length > MAX_COUNT) {
      return `한 번에 ${MAX_COUNT}장까지 올릴 수 있어요.`;
    }
    const total = [...items.map((item) => item.file), ...images].reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (total > MAX_TOTAL_SIZE) {
      return '한 번에 합계 100MB까지 올릴 수 있어요. 몇 장을 빼고 나눠서 올려 주세요.';
    }
    const added = images.map((file): UploadItem => ({
      key: `photo-${nextKey++}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      info: emptyInfo(),
    }));
    setItems((prev) => [...prev, ...added]);
    added.forEach((item) => upload(item.key, item.file));
    return images.length < files.length ? '사진이 아닌 파일은 뺐어요.' : null;
  };

  const remove = (key: string) => {
    const item = items.find((it) => it.key === key);
    if (item) URL.revokeObjectURL(item.preview);
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const retry = (key: string) => {
    const item = items.find((it) => it.key === key);
    if (item) upload(item.key, item.file);
  };

  const updateInfo = (key: string, info: Partial<PhotoDraft>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, info: { ...item.info, ...info } } : item,
      ),
    );
  };

  return { items, add, remove, retry, updateInfo };
}
