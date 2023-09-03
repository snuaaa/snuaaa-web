import React from 'react';
import ContentsStateEnum from 'common/ContentStateEnum';
import UserService from 'services/UserService.ts';
import ExhibitPhotoService from 'services/ExhibitPhotoService';
import EditExhibitPhotoComponent from 'components/ExhibitBoard/EditExhibitPhotoComponent';

const TAG = 'EDIT_EXHIBIT_PHOTO';

class EditExhibitPhoto extends React.Component {

  constructor(props) {
    console.log(`[${TAG}] constructor`);
    super(props);
    this.boardTags = props.boardTagInfo;

    const { contentInfo } = props;
    let exhibitPhotoInfo = contentInfo && contentInfo.exhibitPhoto;
    this.state = {
      title: contentInfo.title,
      text: contentInfo.text,
      order: exhibitPhotoInfo.order,
      photographer: {
        uuid: exhibitPhotoInfo.photographer && exhibitPhotoInfo.photographer.user_uuid,
        nickname: exhibitPhotoInfo.photographer && exhibitPhotoInfo.photographer.nickname
      },
      photographer_alt: exhibitPhotoInfo.photographer_alt,
      date: exhibitPhotoInfo.date && new Date(exhibitPhotoInfo.date),
      location: exhibitPhotoInfo.location,
      camera: exhibitPhotoInfo.camera,
      lens: exhibitPhotoInfo.lens,
      focal_length: exhibitPhotoInfo.focal_length,
      f_stop: exhibitPhotoInfo.f_stop,
      exposure_time: exhibitPhotoInfo.exposure_time,
      iso: exhibitPhotoInfo.iso,
      file_path: exhibitPhotoInfo.file_path,
      imgIdx: -1,
      searchUsers: [],
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleDate = (date) => {
    this.setState({
      date: date
    });
  };

  handlePhotographer = (e) => {
    this.setState({
      photographer_alt: e.target.value
    });
    if(e.target.value) {
      this.fetchUsers(e.target.value);
    }
  };

  fetchUsers = async (name) => {
    UserService.searchMini(name)
      .then((res) => {
        this.setState({
          searchUsers: res.data.userList
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  selectPhotographer = (index) => {
    const { searchUsers } = this.state;
    this.setState({
      photographer_alt: '',
      photographer: {
        uuid: searchUsers[index].user_uuid,
        nickname: searchUsers[index].nickname
      },
      searchUsers: []
    });
  };

  removePhotographer = () => {
    this.setState({
      photographer: {
        uuid: null,
        nickname: null
      }
    });
  };

  submit = async () => {

    this.props.setPhotoState(ContentsStateEnum.LOADING);

    const { title, text, order, date, location, camera, lens,
      focal_length, f_stop, exposure_time, iso, photographer, photographer_alt } = this.state;
    const { contentInfo, fetch } = this.props;
    const photoInfo = {
      title: title,
      text: text,
      order: order,
      photographer: photographer.uuid,
      photographer_alt: photographer_alt,
      date: date,
      location: location,
      camera: camera,
      lens: lens,
      focal_length: focal_length,
      f_stop: f_stop,
      exposure_time: exposure_time,
      iso: iso
    };

    await ExhibitPhotoService.updateExhibitPhoto(contentInfo.content_id, photoInfo)
      .then(() => {
        fetch();
      })
      .catch((err) => {
        console.error(err);
        alert('업데이트 실패');
      });
  };

  render() {
    console.log('[%s] render', TAG);

    const { handleChange, handleDate, handlePhotographer, selectPhotographer, removePhotographer, submit } = this;
    const { setPhotoState } = this.props;
    const { title, text, order, photographer, photographer_alt, date, location, camera, lens, focal_length
      , f_stop, exposure_time, iso, file_path, searchUsers } = this.state;

    const photoInfo = {
      title: title,
      text: text,
      order: order,
      photographer_alt: photographer_alt,
      date: date,
      location: location,
      camera: camera,
      lens: lens,
      focal_length: focal_length,
      f_stop: f_stop,
      exposure_time: exposure_time,
      iso: iso,
      file_path: file_path
    };

    return (
      <EditExhibitPhotoComponent
        photoInfo={photoInfo}
        photographer={photographer}
        handleChange={handleChange}
        handleDate={handleDate}
        handlePhotographer={handlePhotographer}
        selectPhotographer={selectPhotographer}
        removePhotographer={removePhotographer}
        searchUsers={searchUsers}
        setPhotoState={setPhotoState}
        updatePhoto={submit}
      />
    );
  }
}

export default EditExhibitPhoto;