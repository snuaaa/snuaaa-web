import { FC, useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Common/Loading';
import { convertDateWithDay } from '../../utils/convertDate';
import BoardName from '../../components/Board/BoardName';
import Image from '../../components/Common/AaaImage';

import AuthContext from '../../contexts/AuthContext';

import CreateExhibition from '../ExhibitBoard/CreateExhibition';
import { Board } from 'services/types';
import ExhibitionService from 'services/ExhibitionService';
import { useFetch } from 'hooks/useFetch';

type ExhibitBoardProps = {
  boardInfo: Board;
};

const ExhibitBoard: FC<ExhibitBoardProps> = ({ boardInfo }) => {
  const [isCreating, setIsCreating] = useState(false);

  const fetchFunction = useCallback(() => {
    return ExhibitionService.retrieveExhibitionsInBoard(boardInfo.board_id);
  }, [boardInfo.board_id]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const exhibitions = useMemo(() => data?.data ?? [], [data?.data]);

  const authContext = useContext(AuthContext);

  const makeExhibitionList = useCallback(() => {
    return exhibitions.map((content) => {
      if (!content.exhibition) return null;

      return (
        <Link to={`/exhibition/${content.content_id}`}>
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

  if (!data) {
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
          onCreate={refresh}
        />
      )}
    </div>
  );
};

export default ExhibitBoard;
