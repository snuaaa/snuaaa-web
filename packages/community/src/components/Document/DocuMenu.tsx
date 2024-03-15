import React, { FC, useCallback, useRef } from 'react';

type Props = {
  retrieveDocumentsByGeneration: (idx: number) => void;
};

export const DocuMenu: FC<Props> = ({ retrieveDocumentsByGeneration }) => {
  const generationList = useRef<HTMLUListElement>(null);
  const genFlowIndex = useRef(0);

  const createGeneration = useCallback(() => {
    let currentGen = 2 * (new Date().getFullYear() - 1980);
    if (new Date().getMonth() > 5) currentGen++;
    const genList = [];
    for (let i = currentGen; i > 0; i--) {
      genList.push(
        <li key={i} onClick={() => retrieveDocumentsByGeneration(i)}>
          {i}대
        </li>,
      );
    }
    return genList;
  }, []);

  const leftHandler = useCallback(() => {
    if (!generationList.current) {
      return;
    }
    if (genFlowIndex.current < 0) {
      genFlowIndex.current += generationList.current.clientWidth;
      generationList.current.style.transform = `translateX(${genFlowIndex.current}px)`;
    }
  }, []);

  const rightHandler = useCallback(() => {
    if (!generationList.current) {
      return;
    }

    if (genFlowIndex.current >= -3000) {
      genFlowIndex.current -= generationList.current.clientWidth;
      generationList.current.style.transform = `translateX(${genFlowIndex.current}px)`;
    }
  }, []);

  return (
    <div className="documenu-wrapper">
      <div className="doc-gen-list-handler" onClick={leftHandler}>
        &lt;&lt;
      </div>
      <div className="doc-gen-list-wrapper">
        <ul className="doc-gen-list" ref={generationList}>
          {createGeneration()}
        </ul>
      </div>
      <div className="doc-gen-list-handler" onClick={rightHandler}>
        &gt;&gt;
      </div>
    </div>
  );
};
