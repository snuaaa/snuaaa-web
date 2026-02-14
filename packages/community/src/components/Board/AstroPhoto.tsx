import BoardName from '../../components/Board/BoardName';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { Board } from '~/services/types';
import { PhotoSection } from './PhotoBoard/PhotoSection';
import { AlbumSection } from './PhotoBoard/AlbumSection';

type AstroPhotoProps = {
  boardInfo: Board;
};

type ViewMode = 'photo' | 'album';

const baseViewModeClassName =
  'w-1/2 text-center py-[10px] transition-all duration-500';

const selectedViewModeClassName = 'bg-[#49A0AE] text-white';

const unselectedViewModeClassName =
  'bg-[#F1F1F1] text-[#A3A3A3] hover:text-[#646464]';

function AstroPhoto({ boardInfo }: AstroPhotoProps) {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });

  const viewMode: ViewMode = searchParams.view === 'album' ? 'album' : 'photo';

  const setViewMode = (mode: ViewMode) => {
    navigate({
      search: (prev) => ({
        ...prev,
        view: mode,
        page: 1,
      }),
    });
  };

  return (
    <div className="board-wrapper photoboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      <div className="w-full flex text-[20px] mb-3">
        <button
          className={`${baseViewModeClassName} ${
            viewMode === 'photo'
              ? selectedViewModeClassName
              : unselectedViewModeClassName
          }`}
          onClick={() => setViewMode('photo')}
        >
          사진
        </button>
        <button
          className={`${baseViewModeClassName} ${
            viewMode === 'album'
              ? selectedViewModeClassName
              : unselectedViewModeClassName
          }`}
          onClick={() => setViewMode('album')}
        >
          앨범
        </button>
      </div>
      {viewMode === 'photo' ? (
        <PhotoSection boardInfo={boardInfo} />
      ) : (
        <AlbumSection boardInfo={boardInfo} />
      )}
    </div>
  );
}

export default AstroPhoto;
