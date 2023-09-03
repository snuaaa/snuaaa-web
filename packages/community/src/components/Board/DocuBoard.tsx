import React, { ChangeEvent, useState, useEffect } from 'react';

import Loading from '../../components/Common/Loading';
import SelectBox from '../../components/Common/SelectBox';
import Paginator from '../../components/Common/Paginator';
import DocuList from '../../components/Document/DocuList';
import CreateDocu from './CreateDocu';
import BoardStateEnum from '../../common/BoardStateEnum';
import BoardName from '../../components/Board/BoardName';
import DocuService from '../../services/DocuService';
import BoardType from '../../types/BoardType';
import ContentType from '../../types/ContentType';
import AuthContext from '../../contexts/AuthContext';
import { useLocation, useHistory } from 'react-router';

const TAG = 'DOCUBOARD';
const DOCROWNUM = 10;

type DocuBoardProps = {
    boardInfo: BoardType;
}

type LocationState = {
    category: string;
    generation: number;
    page: number;
}


function DocuBoard({ boardInfo }: DocuBoardProps) {

  // let docCount: number = 0;
  const history = useHistory();
  const location = useLocation<LocationState>();
    
  const [boardState, setBoardState] = useState<number>(BoardStateEnum.LOADING);
  const [documents, setDocuments] = useState<ContentType[]>([]);
  const [docCount, setDocCount] = useState<number>(0);

  useEffect(() => {
    fetch();
  }, [location]);


  const fetch = async () => {
    const category = (location.state && location.state.category) ? location.state.category : '';
    const generation = (location.state && location.state.generation) ? location.state.generation : 0;
    const pageIdx = (location.state && location.state.page) ? location.state.page : 1;

    setBoardState(BoardStateEnum.LOADING);
    await DocuService.retrieveDocuments(pageIdx, category, generation)
      .then((res) => {
        setDocCount(res.data.docCount);
        setDocuments(res.data.docInfo);
        setBoardState(BoardStateEnum.READY);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const clickCategory = (ctg_id: string) => {
    history.push({
      state: {
        category: ctg_id,
        page: 1
      }
    });
  };

  const clickAll = () => {
    history.push({
      state: {
        category: '',
        page: 1
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {

    const category = (location.state && location.state.category) ? location.state.category : '';
    const generation = (location.state && location.state.generation) ? location.state.generation : 0;

    if (e.target.name === 'category') {
      history.push({
        state: {
          category: e.target.value,
          generation: generation,
          page: 1
        }
      });
    }
    if (e.target.name === 'generation') {
      history.push({
        state: {
          category: category,
          generation: e.target.value,
          page: 1
        }
      });
    }
  };

  const clickPage = (idx: number) => {

    const category = (location.state && location.state.category) ? location.state.category : '';
    const generation = (location.state && location.state.generation) ? location.state.generation : 0;

    history.push({
      state: {
        category: category,
        generation: generation,
        page: idx
      }
    });
  };


  const category = (location.state && location.state.category) ? location.state.category : '';
  const generation = (location.state && location.state.generation) ? location.state.generation : 0;
  const pageIdx = (location.state && location.state.page) ? location.state.page : 1;

  const categoryOptions = boardInfo.categories.map((category) => {
    return {
      id: category.category_id,
      name: category.category_name
    };
  });

  const generationOptions: { id: number, name: string }[] = [];
  const today = new Date();
  let currentGen = 2 * (today.getFullYear() - 1980);
  if (today.getMonth() > 5) currentGen++;

  for (let i = currentGen; i > 0; i--) {
    generationOptions.push({
      id: i,
      name: i + '대'
    });
  }

  return (
    <AuthContext.Consumer>
      {
        authContext => (
          <div className="board-wrapper">
            <BoardName board_id={boardInfo.board_id} board_name={boardInfo.board_name} />
            {/* <div className="docboard-top-menu-wrapper"> */}
            <div className="board-search-wrapper">
              <div className="board-select-wrapper">
                <SelectBox
                  selectName="category"
                  optionList={categoryOptions}
                  onSelect={handleChange}
                  selectedOption={category} />
                <SelectBox
                  selectName="generation"
                  optionList={generationOptions}
                  onSelect={handleChange}
                  selectedOption={generation} />
              </div>
              {
                authContext.authInfo.user.grade <= boardInfo.lv_write &&
                                <button className="board-btn-write" onClick={() => setBoardState(BoardStateEnum.WRITING)}>
                                  <i className="ri-file-add-line enif-f-1p2x"></i>문서생성
                                </button>
              }
            </div>
            {/* </div> */}
            {(() => {
              if (boardState === BoardStateEnum.LOADING) {
                return <Loading />;
              }
              else if (boardState === BoardStateEnum.READY || boardState === BoardStateEnum.WRITING) {
                return (
                  <>
                    <DocuList documents={documents} />
                    {docCount > 0 &&
                                            <Paginator
                                              pageIdx={pageIdx}
                                              pageNum={Math.ceil(docCount / DOCROWNUM)}
                                              clickPage={clickPage} />}
                    {
                      boardState === BoardStateEnum.WRITING &&
                                            <CreateDocu
                                              fetch={fetch}
                                              boardInfo={boardInfo}
                                              close={() => setBoardState(BoardStateEnum.READY)} />
                    }
                  </>
                );
              }
              else {
                return (
                  <div>ERROR PAGE</div>
                );
              }
            })()}
          </div>

        )
      }
    </AuthContext.Consumer>
  );
}

export default DocuBoard;
