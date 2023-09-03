import React, { ChangeEvent } from 'react';

import EditAlbumComponent from '../../components/Album/EditAlbumComponent';
import ContentStateEnum from '../../common/ContentStateEnum';
import AlbumService from '../../services/AlbumService';
import ContentType from '../../types/ContentType';
import { RecordOf, Record } from 'immutable';
import CategoryType from '../../types/CategoryType';
import AlbumType from '../../types/AlbumType';

const TAG = 'EDITALBUM';

type EditAlbumProps = {
    albumInfo: AlbumType;
    categoryInfo?: CategoryType[];
    setAlbumState: (state: number) => void;
    fetch: () => void;
}

type EditAlbumState = {
    albumInfo: RecordOf<AlbumType>;
}

class EditAlbum extends React.Component<EditAlbumProps, EditAlbumState> {

  constructor(props: EditAlbumProps) {
    super(props);
    console.log(`[${TAG}] constructor`);

    this.state = {
      albumInfo: Record(props.albumInfo)()
    };
  }

  handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { albumInfo } = this.state;
    const name: string = e.target.name;

    if (name === 'title' || name === 'text') {
      this.setState({
        albumInfo: albumInfo.set(name, e.target.value)
      });
    }
  };

  setIsPrivate = (isPrivate: boolean) => {
    const { albumInfo } = this.state;
    this.setState({
      albumInfo: albumInfo.setIn(['album', 'is_private'], isPrivate)
    });
  };

  handleCategoryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { albumInfo } = this.state;

    this.setState({
      albumInfo: albumInfo.set('category_id', e.target.value)
    });
  };

  updateAlbum = async () => {

    const { categoryInfo } = this.props;
    const { albumInfo } = this.state;

    if(!albumInfo.album) {
      alert('앨범 정보 오류');
    }
    else if(!albumInfo.title) {
      alert('제목을 입력해 주세요');
    }
    else if(categoryInfo && categoryInfo.length > 0 && !albumInfo.category_id) {
      alert('카테고리를 선택해 주세요');
    }
    else {
            
      await AlbumService.updateAlbum(albumInfo.content_id, albumInfo.toJSON())
        .then(() => {
          console.log('[%s] Update Album Success', TAG);
          this.props.setAlbumState(ContentStateEnum.READY);
          this.props.fetch();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('업데이트 실패');
        });
    }
  };


  render() {
    console.log('[%s] render', TAG);
    const { categoryInfo } = this.props;
    const { albumInfo } = this.state;

    return (
      <EditAlbumComponent
        caption="앨범 수정"
        // albumInfo={albumInfo}
        title={albumInfo.title}
        text={albumInfo.text}
        isPrivate={albumInfo.album ? albumInfo.album.is_private : false}
        checkedCategory={albumInfo.category_id}
        setIsPrivate={this.setIsPrivate}
        categories={categoryInfo}
        handleCategory={this.handleCategoryChange}
        handleChange={this.handleChange}
        confirmAlbum={() => this.updateAlbum()}
        cancelAlbum={() => this.props.setAlbumState(ContentStateEnum.READY)}
      />
    ); 
  }

}

export default EditAlbum;