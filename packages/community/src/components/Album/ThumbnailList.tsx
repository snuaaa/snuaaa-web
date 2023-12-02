import React from 'react';

type ThumbnailListProps = {
    imgUrls: string[];
    imgIdx: number;
    setImgIdx: (idx: number) => void;
    removeImg: (idx: number) => void;
}

function ThumbnailList({ imgUrls, imgIdx, setImgIdx, removeImg }: ThumbnailListProps) {

  const makeThumbnails = () => {

    const thumbnailList = imgUrls.map((imgUrl, index) => {
      const imgClass = index === imgIdx ? 'photo-thumbnail selected' : 'photo-thumbnail default';
      return (
        <div key={index} className="block-constant">
          <div className="remove-icon-wrapper" onClick={() => removeImg(index)}>
            <i className="ri-close-circle-line enif-pointer enif-f-1p5x"></i>
          </div>
          <img
            className={imgClass}
            src={imgUrl}
            alt="thumbnail"
            onClick={() => setImgIdx(index)} />
        </div>
      );
    });
    return thumbnailList;
  };

  return (
    <>
      {makeThumbnails()}
    </>
  );
}

export default ThumbnailList;
