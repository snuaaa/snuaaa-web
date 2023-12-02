
import React from 'react';
import { Link } from 'react-router-dom';

type BoardNameProps = {
    board_id?: string;
    board_name: string;
}

function BoardName ({ board_id, board_name }: BoardNameProps) {

  if (!board_id) {
    return (
      <div className="postboard-title-wrapper">
        <div className="background-star solo">★</div>
        <h2>{board_name}</h2>
        <div className="background-star">★★★★★★★★★★★★★★★★★★★★★★</div>
      </div>
    );
  }
  else if (board_id === 'brd31') {
    return (
      <Link to={`/board/${board_id}`}>
        <h2 className="memory-title">{board_name}</h2>
      </Link>
    );
  }
  else if (board_id === 'brd32') {
    return (
      <Link to={`/board/${board_id}`}>
        <h2 className="astrophoto-title">{board_name}</h2>
      </Link>
    );
  }
  else {
    return (
      <div className="postboard-title-wrapper">
        <div className="background-star solo">★</div>
        <Link to={`/board/${board_id}`}>
          <h2>{board_name}</h2>
        </Link>
        <div className="background-star">★★★★★★★★★★★★★★★★★★★★★★</div>
      </div>
    );
  }
}

export default BoardName;
