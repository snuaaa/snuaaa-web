import { ChangeEvent, useState, useCallback } from 'react';

import Loading from '../../components/Common/Loading';
import SelectBox from '../../components/Common/SelectBox';
import Paginator from '../../components/Common/Paginator';
import DocuList from '../../components/Document/DocuList';
import CreateDocu from './CreateDocu';
import BoardName from '../../components/Board/BoardName';
import DocuService from '../../services/DocuService';

import { useLocation, useHistory } from 'react-router-dom'; // Fix import path
import { Board } from 'services/types';
import { useFetch } from 'hooks/useFetch';
import { useAuth } from 'contexts/auth';

const DOCROWNUM = 10;

type DocuBoardProps = {
  boardInfo: Board;
};

type LocationState = {
  category: string;
  generation: number;
  page: number;
};

function DocuBoard({ boardInfo }: DocuBoardProps) {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useAuth();

  const [isCreating, setIsCreating] = useState(false);

  const category = location.state?.category ?? '';
  const generation = location.state?.generation ?? 0;
  const pageIdx = location.state?.page ?? 1;

  const fetchFunction = useCallback(() => {
    return DocuService.retrieveDocuments(pageIdx, category, generation);
  }, [category, generation, pageIdx]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const docCount = data?.docCount ?? 0;
  const documents = data?.docInfo ?? [];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const category =
      location.state && location.state.category ? location.state.category : '';
    const generation =
      location.state && location.state.generation
        ? location.state.generation
        : 0;

    if (e.target.name === 'category') {
      history.push({
        state: {
          category: e.target.value,
          generation: generation,
          page: 1,
        },
      });
    }
    if (e.target.name === 'generation') {
      history.push({
        state: {
          category: category,
          generation: e.target.value,
          page: 1,
        },
      });
    }
  };

  const clickPage = (idx: number) => {
    const category =
      location.state && location.state.category ? location.state.category : '';
    const generation =
      location.state && location.state.generation
        ? location.state.generation
        : 0;

    history.push({
      state: {
        category: category,
        generation: generation,
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
            onSelect={handleChange}
            selectedOption={category}
          />
          <SelectBox
            selectName="generation"
            optionList={generationOptions}
            onSelect={handleChange}
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
            pageIdx={pageIdx}
            pageNum={Math.ceil(docCount / DOCROWNUM)}
            clickPage={clickPage}
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
