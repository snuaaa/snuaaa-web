import React from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Common/Loading';
import BoardStateEnum from '../../common/BoardStateEnum';
import { convertDateWithDay } from '../../utils/convertDate';
import BoardService from '../../services/BoardService';
import BoardName from '../../components/Board/BoardName';
import Image from '../../components/Common/AaaImage';
import BoardType from '../../types/BoardType';
import AuthContext from '../../contexts/AuthContext';
import ExhibitionType from '../../types/ExhibitionType';
import CreateExhibition from '../ExhibitBoard/CreateExhibition';

const TAG = 'EXHIBITBOARD';

type ExhibitBoardProps = {
    boardInfo: BoardType;
}

type ExhibitBoardState = {
    boardState: number;
}

class ExhibitBoard extends React.Component<ExhibitBoardProps, ExhibitBoardState> {

  exhibitions: ExhibitionType[];

  constructor(props: ExhibitBoardProps) {
    super(props);
    console.log(`[${TAG}] Constructor`);
    this.exhibitions = [];
    this.state = {
      boardState: BoardStateEnum.LOADING
    };
  }

  componentDidMount() {
    console.log(`[${TAG}] ComponentDidMount`);
    this.fetch();
  }

  setBoardState = (state: number) => {
    this.setState({
      boardState: state
    });
  };

  fetch = async () => {
    const { boardInfo } = this.props;

    this.setBoardState(BoardStateEnum.LOADING);
    await BoardService.retrieveExhibitionsInBoard(boardInfo.board_id)
      .then((res) => {
        this.exhibitions = res.data;
        this.setBoardState(BoardStateEnum.READY);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  makeExhibitionList = () => {
    const { exhibitions } = this;
    if (exhibitions && exhibitions.length > 0) {
      return exhibitions.map((content) => {
        if (content.exhibition) {
          return (
            <Link to={`/exhibition/${content.content_id}`}>
              <div className="exhibition-unit">
                <div className="hanger"></div>
                <div className="poster-wrapper">
                  <Image className="img-poster" imgSrc={content.exhibition.poster_thumbnail_path} />
                </div>
                <div className="desc-wrapper">
                  <div className="desc">
                    <p>제{content.exhibition.exhibition_no}회 천체사진전</p>
                    <h5>{content.exhibition.slogan}</h5>
                    <p className="desc-small">{convertDateWithDay(content.exhibition.date_start)} ~ {convertDateWithDay(content.exhibition.date_end)}</p>
                    <p className="desc-small">{content.exhibition.place}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        }
      });
    }
  };

  render() {
    console.log(`[${TAG}] render.. `);

    const { makeExhibitionList } = this;
    const { boardInfo } = this.props;
    const { boardState } = this.state;

    return (
      <AuthContext.Consumer>
        {
          authContext => (
            <>
              {
                (() => {
                  if (boardState === BoardStateEnum.LOADING) {
                    return <Loading />;
                  }
                  else if (boardState === BoardStateEnum.READY || boardState === BoardStateEnum.WRITING) {
                    return (
                      <div className="board-wrapper exhibition-board-wrapper">
                        <BoardName board_id={boardInfo.board_id} board_name={boardInfo.board_name} />
                        <div className="board-desc">
                          {boardInfo.board_desc}
                        </div>
                        <div className="board-search-wrapper">
                          {
                            authContext.authInfo.user.grade <= boardInfo.lv_write &&
                                                        <button className="board-btn-write" onClick={() => this.setBoardState(BoardStateEnum.WRITING)}>
                                                          <i className="ri-gallery-line enif-f-1p2x"></i>
                                                          <>사진전 생성</>
                                                        </button>
                          }
                        </div>
                        {
                          (boardState === BoardStateEnum.READY || boardState === BoardStateEnum.WRITING) &&
                                                    <>
                                                      <div className="exhibition-list-wrapper">
                                                        {makeExhibitionList()}
                                                      </div>
                                                    </>
                        }
                        {
                          boardState === BoardStateEnum.WRITING &&
                                                    <CreateExhibition
                                                      board_id={boardInfo.board_id}
                                                      boardInfo={boardInfo}
                                                      // confirm={() => }
                                                      close={() => this.setBoardState(BoardStateEnum.READY)}
                                                      fetch={this.fetch} />
                        }
                      </div>
                    );
                  }
                  else return (
                    <div>ERROR PAGE</div>
                  );
                })()
              }
            </>
          )
        }
      </AuthContext.Consumer>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    level: state.authentication.level,
  };
};

export default ExhibitBoard;
