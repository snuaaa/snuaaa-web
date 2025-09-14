import { useCallback, useEffect, useRef, useState } from 'react';
import Image from '~/components/Common/AaaImage';

type Props = {
  onClickPrev: () => void;
  onClickNext: () => void;
  imgUrl?: string;
};

const VISIBLE_TIME = 3; // seconds

const PhotoViewer = ({ onClickPrev, onClickNext, imgUrl }: Props) => {
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const remainedTime = useRef(VISIBLE_TIME);
  const timer = useRef<number>();

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isArrowVisible, setIsArrowVisible] = useState(false);

  const clickFullScreen = useCallback(() => {
    const elem = fullscreenRef.current;

    if (isFullScreen && document.fullscreenElement && document.exitFullscreen) {
      // can use exitFullscreen
      document.exitFullscreen();
    } else if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }, [isFullScreen]);

  const handleMouseHover = useCallback(() => {
    remainedTime.current = VISIBLE_TIME;
    setIsArrowVisible(true);
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen((prevState) => !prevState);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', toggleFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', toggleFullScreen);
    };
  });

  useEffect(() => {
    timer.current = window.setInterval(() => {
      if (remainedTime.current > 0) {
        remainedTime.current = remainedTime.current - 1;
      } else {
        setIsArrowVisible(false);
      }
    }, 1000);

    return () => window.clearInterval(timer.current);
  });

  const fullscreenClass = isFullScreen
    ? 'ri-fullscreen-exit-fill'
    : 'ri-fullscreen-fill';

  return (
    <div className="photo-section-left">
      <div
        className="photo-img-wrapper"
        ref={fullscreenRef}
        onMouseMove={handleMouseHover}
      >
        {isArrowVisible && (
          <div className="photo-move-action prev">
            <button className="photo-move-btn" onClick={onClickNext}>
              <i className="ri-arrow-left-s-line ri-icons cursor-pointer"></i>
            </button>
          </div>
        )}
        <Image imgSrc={imgUrl} />
        {isArrowVisible && (
          <div className="photo-move-action next">
            <button
              className="photo-move-btn flex items-center center"
              onClick={onClickPrev}
            >
              <i className="ri-arrow-right-s-line ri-icons cursor-pointer"></i>
            </button>
          </div>
        )}
        <button className="absolute right-2 bottom-2 z-10 bg-gray-400 opacity-50 p-2 md:p-3 rounded-full flex items-center center">
          <i
            className={`${fullscreenClass} cursor-pointer enif-f-1p2x`}
            onClick={clickFullScreen}
          ></i>
        </button>
      </div>
    </div>
  );
};
export default PhotoViewer;
