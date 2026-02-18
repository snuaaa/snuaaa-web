import { ChangeEvent, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import Loading from '../../components/Common/Loading';
import SelectBox from '../../components/Common/SelectBox';
import Paginator from '../../components/Common/Paginator';
import DocuList from '../../components/Document/DocuList';
import CreateDocu from './CreateDocu';
import BoardName from '../../components/Board/BoardName';

import { Board } from '~/services/types';
import { useDocuments, docuKeys } from '~/hooks/queries/useDocuQueries';
import { useAuth } from '~/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

const DOCROWNUM = 10;

type DocuBoardProps = {
  boardInfo: Board;
};

function DocuBoard({ boardInfo }: DocuBoardProps) {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const authContext = useAuth();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);

  const { category, generation } = searchParams;
  const page = Number(searchParams.page ?? 1);

  const { data } = useDocuments({
    page,
    category,
    generation: generation ? Number(generation) : undefined,
  });

  const docCount = data?.docCount ?? 0;
  const documents = data?.docInfo ?? [];

  const handleChangeCategory = (e: ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category: e.target.value,
        page: 1,
      }),
    });
  };

  const handleChangeGeneration = (e: ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        generation: e.target.value,
        page: 1,
      }),
    });
  };

  const handleClickPage = (idx: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: idx,
      }),
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
            fetch={() => {
              queryClient.invalidateQueries({ queryKey: docuKeys.list() });
            }}
            boardInfo={boardInfo}
            onClose={() => setIsCreating(false)}
          />
        )}
      </>
    </div>
  );
}

export default DocuBoard;
