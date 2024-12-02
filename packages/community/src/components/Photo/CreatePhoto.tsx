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

const defaultPhotoInfo = {
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

export const CreatePhoto: FC<Props> = ({
  boardId,
  tags,
  albumId,
  onCreatePhoto,
  onCancel,
}) => {
  useBlockBackgroundScroll();

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

    const nUploadPhotos = [];
    const newPhotoInfos = fileArray.map(() => defaultPhotoInfo);
    for (let i = 0; i < e.target.files.length; i++) {
      nUploadPhotos.push(e.target.files[i]);
      imgUrls.current.push(URL.createObjectURL(e.target.files[i]));
    }
    setPhotoInfo(photoInfo.concat(newPhotoInfos));
    setUploadPhotos(uploadPhotos.concat(nUploadPhotos));
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
