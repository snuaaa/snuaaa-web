import React, { useState } from 'react';

type ActionDrawerProps = {
    clickEdit: () => void;
    clickDelete: () => void;
    isPhoto?: boolean;
    clickSetThumbnail?: () => void;
}

function ActionDrawer({ clickEdit, clickDelete, isPhoto, clickSetThumbnail }: ActionDrawerProps) {

  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="actions-drawer">
      <i className="ri-more-2-fill enif-pointer"
        onClick={() => setIsOpened(!isOpened)}></i>
      {
        // isOpened &&
        <div className={`actions-wrapper ${isOpened && ' opened'}`}>
          <div className="edit-delete-wrapper">
            {
              isPhoto && clickSetThumbnail &&
                            <div className="action-unit-wrapper edit-wrapper"
                              onClick={() => {
                                clickSetThumbnail();
                                setIsOpened(false);
                              }}>
                              <div className="action-unit">
                                <i className="ri-gallery-line enif-f-1p2x"></i>
                                <p>썸네일로 설정</p>
                              </div>
                            </div>
            }
            <div className="action-unit-wrapper edit-wrapper"
              onClick={() => {
                clickEdit();
                setIsOpened(false);
              }}>
              <div className="action-unit">
                <i className="ri-edit-line enif-f-1p2x"></i>&nbsp;수정
              </div>
            </div>
            <div className="action-unit-wrapper delete-wrapper"
              onClick={() => {
                clickDelete();
                setIsOpened(false);
              }}>
              <div className="action-unit">
                <i className="ri-delete-bin-line enif-f-1p2x"></i>&nbsp;삭제
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default ActionDrawer;