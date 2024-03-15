import { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import CreatePhotoComponent from '../../components/Photo/CreatePhotoComponent';
import PhotoBoardService from '../../services/PhotoBoardService';
import AlbumService from '../../services/AlbumService';
import { List } from 'immutable';
import ProgressBar from '../../components/Common/ProgressBar';
import { Tag } from 'services/types';
import { CreatePhotoRequest } from 'services/PhotoService';
import useBlockBackgroundScroll from 'hooks/useBlockBackgroundScroll';

const MAX_SIZE = 100 * 1024 * 1024;

type Props = {
  boardId: string;
  tags?: Tag[];
  albumId?: number;
  onCreatePhoto: () => void;
  onCancel: () => void;
};

export const CreatePhoto: FC<Props> = ({
  boardId,
  tags,
  albumId,
  onCreatePhoto,
  onCancel,
}) => {
  useBlockBackgroundScroll();

  const currentSize = useRef(0);
  const imgUrls = useRef<string[]>([]);

  const [photoInfo, setPhotoInfo] = useState(List<CreatePhotoRequest>());
  const [uploadPhotos, setUploadPhotos] = useState<File[]>([]);
  const [imgIdx, setImgIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [uploadIdx, setUploadIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const name: string = e.target.name;
      setPhotoInfo(
        photoInfo.set(imgIdx, {
          ...photoInfo.get(imgIdx),
          [name]: e.target.value,
        }),
      );
    },
    [imgIdx, photoInfo],
  );

  const handleDate = useCallback(
    (date: Date) => {
      if (imgIdx >= 0 && imgIdx < photoInfo.size && photoInfo.get(imgIdx)) {
        setPhotoInfo(
          photoInfo.set(imgIdx, {
            ...photoInfo.get(imgIdx),
            date: date,
          }),
        );
      }
    },
    [imgIdx, photoInfo],
  );

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (uploadPhotos.length + e.target.files.length > 20) {
        alert('한 번에 20장 이상의 사진은 업로드 할 수 없습니다.');
      } else {
        let tmpSize = currentSize.current;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }

        if (tmpSize > MAX_SIZE) {
          alert('한 번에 100MB 이상의 사진은 업로드 할 수 없습니다.');
        } else {
          currentSize.current = tmpSize;
          const nUploadPhotos = [];
          const nPhotoInfos = [];
          for (let i = 0; i < e.target.files.length; i++) {
            nUploadPhotos.push(e.target.files[i]);
            nPhotoInfos.push({
              title: '',
              text: '',
              board_id: boardId,
              // date: '',
              location: '',
              camera: '',
              lens: '',
              focal_length: '',
              f_stop: '',
              exposure_time: '',
              iso: '',
              tags: [],
            });
            imgUrls.current.push(URL.createObjectURL(e.target.files[i]));
          }
          setPhotoInfo(photoInfo.concat(nPhotoInfos));
          setUploadPhotos(uploadPhotos.concat(nUploadPhotos));
        }
      }
    }
  };

  const removeImg = useCallback(
    (index: number) => {
      imgUrls.current = imgUrls.current.filter((value, idx) => {
        return index !== idx;
      });
      setImgIdx(imgIdx - 1);
      setPhotoInfo(photoInfo.delete(index));
      setUploadPhotos(
        uploadPhotos.filter((value, idx) => {
          return index !== idx;
        }),
      );
    },
    [imgIdx, photoInfo, uploadPhotos],
  );

  const clickTag = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const tagId = e.target.id.replace('crt_', '');
      const info = photoInfo.get(imgIdx);

      if (info && info.tags) {
        if (info.tags.includes(tagId)) {
          setPhotoInfo(
            photoInfo.set(imgIdx, {
              ...photoInfo.get(imgIdx),
              tags: info.tags.filter((tag) => tagId !== tag),
            }),
          );
        } else {
          setPhotoInfo(
            photoInfo.set(imgIdx, {
              ...photoInfo.get(imgIdx),
              tags: info.tags.concat(tagId),
            }),
          );
        }
      }
    },
    [imgIdx, photoInfo],
  );

  const uploadProgress = useCallback((e: ProgressEvent) => {
    const totalLength = e.lengthComputable && e.total;
    if (totalLength) {
      setProgress(Math.round((e.loaded / totalLength) * 100));
    }
  }, []);

  const createPhotos = useCallback(async () => {
    // setReadyState();
    setIsUploading(true);

    try {
      for (let i = 0, max = uploadPhotos.length; i < max; i++) {
        const photosForm = new FormData();
        photosForm.append('photoInfo', JSON.stringify(photoInfo.get(i)));
        photosForm.append('uploadPhoto', uploadPhotos[i]);
        if (albumId) {
          await AlbumService.createPhotosInAlbum(
            albumId,
            photosForm,
            uploadProgress,
          );
        } else {
          await PhotoBoardService.createPhotosInPhotoBoard(boardId, photosForm);
        }
        setUploadIdx(uploadIdx + 1);
      }
      onCreatePhoto();
      // togglePopUp();
      // fetch();
    } catch (err) {
      console.error(err);
      alert('사진 생성 실패');
      setIsUploading(false);
    }
  }, [
    albumId,
    boardId,
    onCreatePhoto,
    photoInfo,
    uploadIdx,
    uploadPhotos,
    uploadProgress,
  ]);

  const checkForm = useCallback(() => {
    if (!uploadPhotos) {
      alert('사진을 첨부해주세요');
    } else {
      createPhotos();
    }
  }, [createPhotos, uploadPhotos]);

  return (
    <>
      <CreatePhotoComponent
        handleChange={handleChange}
        handleDate={handleDate}
        uploadFile={uploadFile}
        clickTag={clickTag}
        imgUrls={imgUrls.current}
        setImgIdx={setImgIdx}
        removeImg={removeImg}
        checkForm={checkForm}
        tags={tags}
        onCancel={onCancel}
        imgIdx={imgIdx}
        photoInfo={photoInfo.get(imgIdx)}
        isUploading={isUploading}
      />
      {isUploading && (
        <ProgressBar
          loadedPercentage={progress}
          currentIdx={uploadIdx}
          totalIdx={photoInfo.size}
        />
      )}
    </>
  );
};
