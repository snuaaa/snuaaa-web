import React from 'react';
import { Link } from 'react-router-dom';
import ContentType from '../../types/ContentType';
import Editor2 from '../Common/Editor2';

const SoundBox = ({ soundBoxInfo }: { soundBoxInfo: ContentType }) => {

  return (
    <div className="soundbox-wrapper">
      <Link to='/board/brd01'><div className="soundbox-title">NOTICE</div></Link>
      <div className="soundbox-contents-wrapper">
        <div className="soundbox-contents">
          {
            soundBoxInfo &&
              <>
                <Link to={`/post/${soundBoxInfo.content_id}`}>
                  <h5>{soundBoxInfo.title}</h5>
                </Link>
                <Editor2 text={soundBoxInfo.text} setText={() => { return; }} readOnly />
              </>
          }
        </div>
      </div>
    </div>
  );
};

export default SoundBox;
