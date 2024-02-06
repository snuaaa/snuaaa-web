import React from 'react';
import { Link } from 'react-router-dom';
import Editor from '../Common/Editor';
import { SoundBoxResponse } from 'services/HomeService';

const SoundBox = ({ soundBoxInfo }: { soundBoxInfo: SoundBoxResponse }) => {
  return (
    <div className="soundbox-wrapper">
      <Link to="/board/brd01">
        <div className="soundbox-title">NOTICE</div>
      </Link>
      <div className="soundbox-contents-wrapper">
        <div className="soundbox-contents">
          {soundBoxInfo && (
            <>
              <Link to={`/post/${soundBoxInfo.content_id}`}>
                <h5>{soundBoxInfo.title}</h5>
              </Link>
              <Editor
                text={soundBoxInfo.text}
                setText={() => {
                  return;
                }}
                readOnly
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoundBox;
