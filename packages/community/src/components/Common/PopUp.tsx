import React from 'react';

type Props = {
  title: string;
  contents: string;
  isAction?: boolean;
  cancel?: () => void;
  confirm?: () => void;
};

const PopUp: React.FC<Props> = ({
  title,
  contents,
  isAction,
  cancel,
  confirm,
}: Props) => {
  return (
    <div className="popup-wrapper">
      <div className="popup-box">
        <div className="popup-star">★</div>
        {title && <h5>{title}</h5>}
        <div className="popup-contents">
          {contents && (
            <p>
              {contents.split('\n').map((line) => {
                return (
                  <span>
                    {line} <br />
                  </span>
                );
              })}
            </p>
          )}
        </div>
        {isAction && (
          <div className="popup-action">
            <button className="btn-ok" onClick={confirm}>
              OK
            </button>
            <button className="btn-cancel" onClick={cancel}>
              CANCEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopUp;
