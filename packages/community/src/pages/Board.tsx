import { FC } from 'react';
import { useParams } from '@tanstack/react-router';

import PostBoard from '~/components/Board/PostBoard';
import DocuBoard from '~/components/Board/DocuBoard';
import ExhibitBoard from '~/components/Board/ExhibitBoard';
import NotFound from '~/components/Common/NotFound';
import Memory from '~/components/Board/Memory';
import AstroPhoto from '~/components/Board/AstroPhoto';
import { useBoards } from '~/hooks/queries/useBoardQueries';

const BoardPage: FC = () => {
  const boardContext = useBoards();
  const { board_id } = useParams({ from: '/board/$board_id' });

  const targetBoard = boardContext.boardsInfo.find(
    (board) => board.board_id === board_id,
  );

  if (!targetBoard) {
    return <NotFound message="존재하지 않는 게시판입니다." />;
  }

  switch (targetBoard.board_type) {
    case 'N':
      return <PostBoard boardInfo={targetBoard} />;
    case 'M':
      return <Memory boardInfo={targetBoard} />;
    case 'A':
      return <AstroPhoto boardInfo={targetBoard} />;
    case 'D':
      return <DocuBoard boardInfo={targetBoard} />;
    case 'E':
      return <ExhibitBoard boardInfo={targetBoard} />;
  }
};

export default BoardPage;
