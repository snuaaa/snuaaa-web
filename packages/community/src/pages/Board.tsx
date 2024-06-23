import { FC } from 'react';
import { useRouteMatch } from 'react-router';

import PostBoard from 'components/Board/PostBoard';
import DocuBoard from 'components/Board/DocuBoard';
import ExhibitBoard from 'components/Board/ExhibitBoard';
import Loading from 'components/Common/Loading';
import Memory from 'components/Board/Memory';
import AstroPhoto from 'components/Board/AstroPhoto';
import { useBoards } from 'contexts/board';

const BoardPage: FC = () => {
  const boardContext = useBoards();
  const match = useRouteMatch<{ board_id: string }>();

  const boardInfo = boardContext.boardsInfo.find(
    (board) => board.board_id === match.params.board_id,
  );

  if (!boardInfo) {
    return <Loading />;
  }

  switch (boardInfo.board_type) {
    case 'N':
      return <PostBoard boardInfo={boardInfo} />;
    case 'M':
      return <Memory boardInfo={boardInfo} />;
    case 'A':
      return <AstroPhoto boardInfo={boardInfo} />;
    case 'D':
      return <DocuBoard boardInfo={boardInfo} />;
    case 'E':
      return <ExhibitBoard boardInfo={boardInfo} />;
  }
};

export default BoardPage;
