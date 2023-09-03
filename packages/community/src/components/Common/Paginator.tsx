import React, { useState } from 'react';

const PAGELISTNUM = 10;

type PagenatorType = {
    pageIdx: number;
    pageNum: number;
    clickPage: (page: number) => void;
}

function Paginator({ pageIdx, pageNum, clickPage }: PagenatorType) {

  const [pageIdxOffset, setPageIdxOffset] = useState(Math.floor((pageIdx - 1) / PAGELISTNUM) * PAGELISTNUM + 1);

  pageIdx = Number(pageIdx);
  const makePaginator = () => {
    const pageList = [];
    for (let i = 0; i < PAGELISTNUM; i++) {
      if (i + pageIdxOffset > pageNum) break;
      pageList.push(<li key={i + pageIdxOffset} className={pageIdx === i + pageIdxOffset ? 'current' : ''} onClick={() => clickPage(i + pageIdxOffset)}>{i + pageIdxOffset}</li>);
    }
    return pageList;
  };

  const clickBefore = () => {
    if (pageIdxOffset > PAGELISTNUM) {
      setPageIdxOffset(pageIdxOffset - PAGELISTNUM);
    }
  };

  const clickNext = () => {
    if (pageIdxOffset <= pageNum - PAGELISTNUM) {
      setPageIdxOffset(pageIdxOffset + PAGELISTNUM);
    }
  };

  return (
    <div className="paginator-wrapper">
      <i className="ri-arrow-left-s-line enif-f-1p5x enif-pointer" onClick={clickBefore}></i>
      <ul>
        {makePaginator()}
      </ul>
      <i className="ri-arrow-right-s-line enif-f-1p5x enif-pointer" onClick={clickNext} ></i>
    </div>
  );
}

export default Paginator;