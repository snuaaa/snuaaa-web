import React, { useState } from 'react';

type ActionDrawerProps = {
  clickEdit: () => void;
  clickDelete: () => void;
  isPhoto?: boolean;
  clickSetThumbnail?: () => void;
  className?: string;
  iconClass?: string;
};

function ActionDrawer({
  clickEdit,
  clickDelete,
  isPhoto,
  clickSetThumbnail,
  className = '',
  iconClass = '',
}: ActionDrawerProps) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className={`actions-drawer ${className}`}>
      <i
        className={`ri-more-2-fill cursor-pointer ${iconClass}`}
        onClick={() => setIsOpened(!isOpened)}
      ></i>
      {
        // isOpened &&
        <div className={`actions-wrapper ${isOpened && ' opened'}`}>
          <div className="edit-delete-wrapper">
            {isPhoto && clickSetThumbnail && (
              <div
                className="action-unit-wrapper edit-wrapper"
                onClick={() => {
                  clickSetThumbnail();
                  setIsOpened(false);
                }}
              >
                <div className="action-unit">
                  <i className="ri-gallery-line enif-f-1p2x"></i>
                  <p>썸네일로 설정</p>
                </div>
              </div>
            )}
            <div
              className="action-unit-wrapper edit-wrapper"
              onClick={() => {
                clickEdit();
                setIsOpened(false);
              }}
            >
              <div className="action-unit">
                <i className="ri-edit-line enif-f-1p2x"></i>&nbsp;수정
              </div>
            </div>
            <div
              className="action-unit-wrapper delete-wrapper"
              onClick={() => {
                clickDelete();
                setIsOpened(false);
              }}
            >
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
