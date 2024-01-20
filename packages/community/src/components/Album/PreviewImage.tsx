import React from 'react';

type PreviewImageProps = {
    imgUrl: string;
}

function PreviewImage({ imgUrl }: PreviewImageProps) {

  return (
    <>
      {
        imgUrl &&
                <img src={imgUrl} alt="previewImg" />
      }
    </>
  );
}

export default PreviewImage;
