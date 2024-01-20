import React, { useState, SyntheticEvent, useEffect } from 'react';

type ImageProps = {
  imgSrc?: string;
  defaultImgSrc?: string;
  className?: string;
  onClick?: () => void;
  local?: boolean;
}


function AaaImage({ imgSrc, defaultImgSrc, className, onClick, local, ...rest }: ImageProps) {

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [imgSrc]);

  let imgUrl;
  if (local) {
    imgUrl = imgSrc;
  } else {
    imgUrl = process.env.REACT_APP_SERVER_URL + 'static' + imgSrc;
  }

  const onLoad = (e: SyntheticEvent) => {
    // console.log(e)
    setIsLoaded(true);
  };

  return (
    <img
      src={imgSrc ? imgUrl : defaultImgSrc}
      className={`${className ? className : ''} ${isLoaded ? 'aaa-img-loaded' : 'aaa-img-loading'}`}
      alt="Img"
      onClick={onClick}
      onLoad={onLoad}
      {...rest} />
  );
}

export default AaaImage;