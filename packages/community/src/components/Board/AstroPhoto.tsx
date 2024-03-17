import BoardName from '../../components/Board/BoardName';

import { useLocation, useHistory } from 'react-router';
import { Board } from 'services/types';
import { PhotoSection } from './sections/PhotoSection';
import { AlbumSection } from './sections/AlbumSection';

type AstroPhotoProps = {
  boardInfo: Board;
};

type LocationState = {
  page: number;
  isViewAlbums: boolean;
  tags: string[];
};

function AstroPhoto({ boardInfo }: AstroPhotoProps) {
  const history = useHistory();
  const location = useLocation<LocationState>();

  const setIsViewAlbums = (isViewAlbums: boolean) => {
    history.replace({
      state: {
        isViewAlbums: isViewAlbums,
        page: 1,
      },
    });
  };

  const isViewAlbums =
    location.state && location.state.isViewAlbums ? true : false;

  const albumSelectorClassName =
    'view-type-selector' + (isViewAlbums ? '' : ' selected');
  const photoSelectorClassName =
    'view-type-selector' + (isViewAlbums ? ' selected' : '');

  return (
    <div className="board-wrapper photoboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      <div className="view-type-selector-wrapper">
        <div
          className={albumSelectorClassName}
          onClick={() => setIsViewAlbums(false)}
        >
          사진
        </div>
        <div
          className={photoSelectorClassName}
          onClick={() => setIsViewAlbums(true)}
        >
          앨범
        </div>
      </div>
      {!isViewAlbums ? (
        <PhotoSection boardInfo={boardInfo} />
      ) : (
        <AlbumSection boardInfo={boardInfo} />
      )}
    </div>
  );
}

export default AstroPhoto;
