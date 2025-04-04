import { useState, useMemo } from 'react';
import { SERVER_URL } from '~/constants/env';

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
    if (imgSrc?.startsWith('http')) {
      return imgSrc;
    }
    return local ? imgSrc : SERVER_URL + 'static' + imgSrc;
  }, [imgSrc, local]);

  const onLoad = () => {
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
