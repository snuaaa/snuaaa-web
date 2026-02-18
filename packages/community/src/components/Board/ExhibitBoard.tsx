import { FC, useCallback, useState } from 'react';
import { Link } from '@tanstack/react-router';
import Loading from '../../components/Common/Loading';
import { convertDateWithDay } from '../../utils/convertDate';
import BoardName from '../../components/Board/BoardName';
import Image from '../../components/Common/AaaImage';

import { Board } from '~/services/types';
import ExhibitionService from '~/services/ExhibitionService';
import { useFetch } from '~/hooks/useFetch';
import CreateExhibition from '~/components/Exhibition/CreateExhibition';
import { useAuth } from '~/contexts/auth';

type ExhibitBoardProps = {
  boardInfo: Board;
};

const ExhibitBoard: FC<ExhibitBoardProps> = ({ boardInfo }) => {
  const [isCreating, setIsCreating] = useState(false);

  const fetchFunction = useCallback(() => {
    return ExhibitionService.retrieveExhibitionsInBoard(boardInfo.board_id);
  }, [boardInfo.board_id]);

  const { data: exhibitions = [], refresh } = useFetch({
    fetch: fetchFunction,
  });

  const authContext = useAuth();

  const makeExhibitionList = useCallback(() => {
    return exhibitions.map((content) => {
      if (!content.exhibition) return null;

      return (
        <Link
          to="/exhibition/$exhibition_id"
          params={{ exhibition_id: String(content.content_id) }}
        >
          <div className="exhibition-unit">
            <div className="hanger"></div>
            <div className="poster-wrapper">
              <Image
                className="img-poster"
                imgSrc={content.exhibition.poster_thumbnail_path}
              />
            </div>
            <div className="desc-wrapper">
              <div className="desc">
                <p>제{content.exhibition.exhibition_no}회 천체사진전</p>
                <h5>{content.exhibition.slogan}</h5>
                <p className="desc-small">
                  {convertDateWithDay(content.exhibition.date_start)} ~{' '}
                  {convertDateWithDay(content.exhibition.date_end)}
                </p>
                <p className="desc-small">{content.exhibition.place}</p>
              </div>
            </div>
          </div>
        </Link>
      );
    });
  }, [exhibitions]);

  if (!exhibitions) {
    return <Loading />;
  }

  return (
    <div className="board-wrapper exhibition-board-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      <div className="board-search-wrapper">
        {authContext.authInfo.user.grade <= boardInfo.lv_write && (
          <button
            className="board-btn-write"
            onClick={() => setIsCreating(true)}
          >
            <i className="ri-gallery-line enif-f-1p2x"></i>
            <>사진전 생성</>
          </button>
        )}
      </div>
      <div className="exhibition-list-wrapper">{makeExhibitionList()}</div>
      {isCreating && (
        <CreateExhibition
          boardId={boardInfo.board_id}
          onClose={() => setIsCreating(false)}
          onCreate={() => {
            setIsCreating(false);
            refresh();
          }}
        />
      )}
    </div>
  );
};

export default ExhibitBoard;
