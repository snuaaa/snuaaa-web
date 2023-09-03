import React, { ChangeEvent } from 'react';
import CreatePhotoComponent from '../../components/Photo/CreatePhotoComponent';
import PhotoBoardService from '../../services/PhotoBoardService';
import AlbumService from '../../services/AlbumService';
import immutable, { Map, RecordOf, Record, List, setIn } from 'immutable';
import CrtPhotoType from '../../types/CrtPhotoType';
import TagType from '../../types/TagType';
import ProgressBar from '../../components/Common/ProgressBar';

const TAG = 'CREATEPHOTO';
const MAX_SIZE = 100 * 1024 * 1024;

type CreatePhotoProps = {
    board_id: string;
    tags?: TagType[];
    album_id?: number;
    setReadyState: () => void;
    togglePopUp: () => void;
    fetch: () => void;
}

type CreatePhotoState = {
    photoInfo: List<CrtPhotoType>;
    uploadPhotos: File[];
    imgIdx: number,
    progress: number,
    uploadIdx: number,
    isUploading: boolean,
}

const recordPhotoInfo: Record.Factory<CrtPhotoType> = Record<CrtPhotoType>({
  title: '',
  text: '',
  location: '',
  camera: '',
  lens: '',
  focal_length: '',
  f_stop: '',
  exposure_time: '',
  iso: ''
});

class CreatePhoto extends React.Component<CreatePhotoProps, CreatePhotoState> {

  currentSize: number;
  imgUrls: string[];

  constructor(props: CreatePhotoProps) {
    super(props);
    console.log('[%s] constructor', TAG);

    this.currentSize = 0;
    this.imgUrls = [];
    this.state = {
      photoInfo: List<CrtPhotoType>(),
      uploadPhotos: [],
      imgIdx: -1,
      progress: 0,
      uploadIdx: 0,
      isUploading: false
    };
  }

  componentDidMount() {
    document.body.classList.add('enif-overflow-hidden');
  }

  componentWillUnmount() {
    document.body.classList.remove('enif-overflow-hidden');
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { photoInfo, imgIdx } = this.state;
    const name: string = e.target.name;
    this.setState({
      photoInfo: photoInfo.set(imgIdx,
        {
          ...photoInfo.get(imgIdx),
          [name]: e.target.value
        })
    });
  };

  handleDate = (date: Date) => {
    const { photoInfo, imgIdx } = this.state;
    if (imgIdx >= 0 && imgIdx < photoInfo.size && photoInfo.get(imgIdx)) {
      this.setState({
        photoInfo: photoInfo.set(imgIdx,
          {
            ...photoInfo.get(imgIdx),
            'date': date
          })
      });
    }
  };

  uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const { board_id } = this.props;
    const { uploadPhotos, photoInfo } = this.state;
    if (e.target.files) {

      if (uploadPhotos.length + e.target.files.length > 20) {
        alert('한 번에 20장 이상의 사진은 업로드 할 수 없습니다.');
      }
      else {
        let tmpSize = this.currentSize;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }

        if (tmpSize > MAX_SIZE) {
          alert('한 번에 100MB 이상의 사진은 업로드 할 수 없습니다.');
        }
        else {
          this.currentSize = tmpSize;
          const nUploadPhotos = [];
          const nPhotoInfos = [];
          for (let i = 0; i < e.target.files.length; i++) {
            nUploadPhotos.push(e.target.files[i]);
            nPhotoInfos.push({
              title: '',
              text: '',
              board_id: board_id,
              // date: '',
              location: '',
              camera: '',
              lens: '',
              focal_length: '',
              f_stop: '',
              exposure_time: '',
              iso: '',
              tags: []
            });
            this.imgUrls.push(URL.createObjectURL(e.target.files[i]));
          }
          this.setState({
            photoInfo: photoInfo.concat(nPhotoInfos),
            uploadPhotos: uploadPhotos.concat(nUploadPhotos)
          });
          // this.imgUrls.push(...(e.target.files.map(file => URL.createObjectURL(file))))
        }
      }
    }
  };

  setImgIdx = (index: number) => {

    this.setState({
      imgIdx: index,
    });
  };

  removeImg = (index: number) => {
    const { imgIdx, photoInfo, uploadPhotos } = this.state;
    this.imgUrls = this.imgUrls.filter((value, idx) => {
      return index !== idx;
    });
    this.setState({
      imgIdx: imgIdx - 1,
      photoInfo: photoInfo.delete(index),
      uploadPhotos: uploadPhotos.filter((value, idx) => {
        return index !== idx;
      })
    });
  };

  clickTag = (e: ChangeEvent<HTMLInputElement>) => {
    const { photoInfo, imgIdx } = this.state;

    const tagId = e.target.id.replace('crt_', '');
    const info = photoInfo.get(imgIdx);

    if (info && info.tags) {
      if (info.tags.includes(tagId)) {
        this.setState({
          photoInfo: photoInfo.set(imgIdx,
            {
              ...photoInfo.get(imgIdx),
              'tags': info.tags.filter(tag => tagId !== tag)
            })
        });
      }
      else {
        this.setState({
          photoInfo: photoInfo.set(imgIdx,
            {
              ...photoInfo.get(imgIdx),
              'tags': info.tags.concat(tagId)
            })
        });
      }
    }
  };

  checkForm = () => {
    if (!this.state.uploadPhotos) {
      alert('사진을 첨부해주세요');
    }
    else {
      this.createPhotos();
    }
  };

  uploadProgress = (e: ProgressEvent) => {
    const totalLength = e.lengthComputable && e.total;
    console.log('onUploadProgress', totalLength);
    if (totalLength) {
      // this.updateProgressBarValue(Math.round( (progressEvent.loaded * 100) / totalLength ));
      this.setState({
        progress: Math.round(e.loaded / totalLength * 100)
      });
    }
  };

  createPhotos = async () => {

    const { fetch, togglePopUp, board_id, album_id, setReadyState } = this.props;
    const { photoInfo, uploadPhotos } = this.state;
    const { uploadProgress } = this;

    setReadyState();
    this.setState({
      isUploading: true
    });

    try {
      for (let i = 0, max = uploadPhotos.length; i < max; i++) {
        const photosForm = new FormData();
        photosForm.append('photoInfo', JSON.stringify(photoInfo.get(i)));
        photosForm.append('uploadPhoto', uploadPhotos[i]);
        if (album_id) {
          await AlbumService.createPhotosInAlbum(album_id, photosForm, uploadProgress);
        }
        else {
          await PhotoBoardService.createPhotosInPhotoBoard(board_id, photosForm);
        }
        this.setState({
          uploadIdx: this.state.uploadIdx + 1
        });
      }
      togglePopUp();
      fetch();
    }
    catch (err) {
      console.error(`[${TAG}] ${err}`);
      alert('사진 생성 실패');
      this.setState({
        isUploading: false
      });
    }
  };

  render() {
    console.log('[%s] render', TAG);
    const { handleChange, handleDate, uploadFile, clickTag, imgUrls, setImgIdx, removeImg, checkForm } = this;
    const { tags, togglePopUp } = this.props;
    const { imgIdx, progress, photoInfo, isUploading, uploadIdx } = this.state;

    return (
      <>
        <CreatePhotoComponent
          handleChange={handleChange}
          handleDate={handleDate}
          uploadFile={uploadFile}
          clickTag={clickTag}
          imgUrls={imgUrls}
          setImgIdx={setImgIdx}
          removeImg={removeImg}
          checkForm={checkForm}
          tags={tags}
          togglePopUp={togglePopUp}
          imgIdx={imgIdx}
          photoInfo={photoInfo.get(imgIdx)}
          isUploading={isUploading}
        />
        {
          isUploading &&
                    <ProgressBar
                      loadedPercentage={progress}
                      currentIdx={uploadIdx}
                      totalIdx={photoInfo.size}/>
        }
      </>
    );
  }
}

export default CreatePhoto;