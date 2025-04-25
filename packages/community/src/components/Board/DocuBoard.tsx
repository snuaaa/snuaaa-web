import { ChangeEvent, useState, useCallback } from 'react';

import Loading from '../../components/Common/Loading';
import SelectBox from '../../components/Common/SelectBox';
import Paginator from '../../components/Common/Paginator';
import DocuList from '../../components/Document/DocuList';
import CreateDocu from './CreateDocu';
import BoardName from '../../components/Board/BoardName';
import DocuService from '../../services/DocuService';

import { useLocation, useHistory } from 'react-router-dom';
import { Board } from '~/services/types';
import { useFetch } from '~/hooks/useFetch';
import { useAuth } from '~/contexts/auth';

const DOCROWNUM = 10;

type DocuBoardProps = {
  boardInfo: Board;
};

type LocationState = {
  category?: string;
  generation?: number;
  page?: number;
};

function DocuBoard({ boardInfo }: DocuBoardProps) {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useAuth();

  const [isCreating, setIsCreating] = useState(false);

  const { category, generation, page = 1 } = location.state ?? {};

  const fetchFunction = useCallback(() => {
    return DocuService.retrieveDocuments({
      pageIdx: page,
      category,
      generation,
    });
  }, [category, generation, page]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const docCount = data?.docCount ?? 0;
  const documents = data?.docInfo ?? [];

  const handleChangeCategory = (e: ChangeEvent<HTMLInputElement>) => {
    history.push({
      state: {
        ...location.state,
        category: e.target.value,
        page: 1,
      },
    });
  };

  const handleChangeGeneration = (e: ChangeEvent<HTMLInputElement>) => {
    history.push({
      state: {
        ...location.state,
        generation: e.target.value,
        page: 1,
      },
    });
  };

  const handleClickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx,
      },
    });
  };

  const categoryOptions = boardInfo.categories.map((category) => {
    return {
      id: category.category_id,
      name: category.category_name,
    };
  });

  const generationOptions: { id: number; name: string }[] = [];
  const today = new Date();
  let currentGen = 2 * (today.getFullYear() - 1980);
  if (today.getMonth() > 5) currentGen++;

  for (let i = currentGen; i > 0; i--) {
    generationOptions.push({
      id: i,
      name: i + '대',
    });
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="board-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      {/* <div className="docboard-top-menu-wrapper"> */}
      <div className="board-search-wrapper">
        <div className="board-select-wrapper">
          <SelectBox
            selectName="category"
            optionList={categoryOptions}
            onSelect={handleChangeCategory}
            selectedOption={category}
          />
          <SelectBox
            selectName="generation"
            optionList={generationOptions}
            onSelect={handleChangeGeneration}
            selectedOption={generation}
          />
        </div>
        {authContext.authInfo.user.grade <= boardInfo.lv_write && (
          <button
            className="board-btn-write"
            onClick={() => setIsCreating(true)}
          >
            <i className="ri-file-add-line enif-f-1p2x"></i>문서생성
          </button>
        )}
      </div>
      {/* </div> */}
      <>
        <DocuList documents={documents} />
        {docCount > 0 && (
          <Paginator
            pageIdx={page}
            pageNum={Math.ceil(docCount / DOCROWNUM)}
            clickPage={handleClickPage}
          />
        )}
        {isCreating && (
          <CreateDocu
            fetch={refresh}
            boardInfo={boardInfo}
            onClose={() => setIsCreating(false)}
          />
        )}
      </>
    </div>
  );
}

export default DocuBoard;
