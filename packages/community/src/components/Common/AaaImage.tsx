import React, { useState, SyntheticEvent, useMemo } from 'react';

type ImageProps = {
  imgSrc?: string;
  defaultImgSrc?: string;
  className?: string;
  onClick?: () => void;
  local?: boolean;
};

function AaaImage({
  imgSrc,
  defaultImgSrc,
  className,
  onClick,
  local,
  ...rest
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const imgUrl = useMemo(() => {
    return local
      ? imgSrc
      : process.env.REACT_APP_SERVER_URL + 'static' + imgSrc;
  }, [imgSrc, local]);

  const onLoad = (e: SyntheticEvent) => {
    setIsLoaded(true);
  };

  return (
    <img
      src={imgSrc ? imgUrl : defaultImgSrc}
      className={`${className ?? ''} ${isLoaded ? 'aaa-img-loaded' : 'aaa-img-loading'}`}
      alt="Img"
      onClick={onClick}
      onLoad={onLoad}
      {...rest}
    />
  );
}

export default AaaImage;
