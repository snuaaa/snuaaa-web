
import React from 'react';

type ExhibitionInfoProps = {
    exhibition_no: number;
    slogan: string;
}

const ExhibitionInfo = ({ exhibition_no, slogan }: ExhibitionInfoProps) => {

  return (
    <div className="exhibition-info-wrapper">
      <h5>제{exhibition_no}회 천체사진전</h5>
      <div className="exhibition-slogan-wrapper">
        <div className="background-star">★★★★★★★★★★★★★★★★★★★★★★</div>
        <h3>{slogan}</h3>
        <div className="background-star">★★★★★★★★★★★★★★★★★★★★★★</div>
      </div>
    </div>
  );
};

export default ExhibitionInfo;
