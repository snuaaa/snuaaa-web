import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import BoardType from '../../types/BoardType';

type NavigationProps = {
    boards: BoardType[];
}

function Navigation({ boards }: NavigationProps) {

  const activeStyle = {
    fontWeight: 900,
    color: '#fad55f'
  };

  const noticeBoards: BoardType[] = [];
  const communityBoards: BoardType[] = [];
  const officialBoards: BoardType[] = [];
  const photoBoards: BoardType[] = [];

  if (boards && boards.length > 0) {
    boards.forEach((board) => {
      if (board.menu === 1) {
        noticeBoards.push(board);
      } else if (board.menu === 2) {
        communityBoards.push(board);
      } else if (board.menu === 3) {
        officialBoards.push(board);
      } else if (board.menu === 4) {
        photoBoards.push(board);
      }
    });
  }

  function makeBoardList(boards: BoardType[]) {
    const boardList = boards.map((board) => {
      return (
        <Link to={`/board/${board.board_id}`} key={board.board_id}>
          <li>{board.board_name}</li>
        </Link>
      );
    });
    return (
      <ul>{boardList}</ul>
    );
  }

  return (
    <div className={'main-menu-nav-wrapper pos-relative'}>
      <nav>
        {/* <input className="nav-toggle" id="nav-toggle" type="checkbox"/> 
                    <label className="navicon" htmlFor="nav-toggle"><span className="navicon-bar"></span></label> */}

        <ul className="nav-items">
          <li className="menu-nav">
            <NavLink to="/" activeStyle={activeStyle}>
              <div className="menu-item-1">★</div>
            </NavLink>
          </li>
          <li className="menu-nav">
            <div className="menu-item-1"><span></span>A.A.A.</div>
            {
              <div className="menu-nav-sub">
                <ul>
                  <Link to='/about/aboutAAA'><li>AAA는?</li></Link>
                  <Link to='/about/contact'><li>찾아오는길&amp;연락처</li></Link>
                  <Link to='/about/equipment'><li>장비소개</li></Link>
                  <Link to='/about/observation'><li>김태영<span> 기념</span> 관측소<span> 소개</span></li></Link>
                  <Link to='/about/history'><li>동아리 발자취</li></Link>
                  <Link to='/about/officers'><li><span>역대 </span>회장단/임원진</li></Link>
                  <Link to='/about/regulation'><li>AAA회칙</li></Link>
                  <a href="https://archive.snuaaa.net" target="_blank" rel="noopener noreferrer">
                    <li>AAArchive<i className="ri-external-link-line"></i></li>
                  </a>
                </ul>
              </div>
            }
          </li>
          <li className="menu-nav">
            <div className="menu-item-1"><span></span>A-Notice</div>
            <div className="menu-nav-sub">
              {makeBoardList(noticeBoards)}
            </div>
          </li>
          <li className="menu-nav">
            <div className="menu-item-1"><span></span>A-Daily</div>
            <div className="menu-nav-sub">
              {makeBoardList(communityBoards)}
            </div>
          </li>
          <li className="menu-nav">
            <div className="menu-item-1"><span></span>A-Docu</div>
            <div className="menu-nav-sub">
              {makeBoardList(officialBoards)}
            </div>
          </li>
          <li className="menu-nav">
            <div className="menu-item-1"><span></span>A-Photo</div>
            <div className="menu-nav-sub">
              {makeBoardList(photoBoards)}
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navigation;
