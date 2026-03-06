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
    <div className="flex-[2] min-h-0 max-h-full hidden md:block">
      <div
        className="relative flex justify-center bg-[#1d1d1d] h-full group"
        ref={fullscreenRef}
        onMouseMove={handleMouseHover}
      >
        {isArrowVisible && (
          <div className="absolute left-0 top-0 h-full z-10 flex items-center pl-2 transition-opacity duration-200">
            <button
              className="bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center transition-colors duration-200"
              onClick={onClickNext}
            >
              <i className="ri-arrow-left-s-line text-2xl text-white"></i>
            </button>
          </div>
        )}
        <Image imgSrc={imgUrl} />
        {isArrowVisible && (
          <div className="absolute right-0 top-0 h-full z-10 flex items-center pr-2 transition-opacity duration-200">
            <button
              className="bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center transition-colors duration-200"
              onClick={onClickPrev}
            >
              <i className="ri-arrow-right-s-line text-2xl text-white"></i>
            </button>
          </div>
        )}
        <button className="absolute right-2 bottom-2 z-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm p-2 md:p-3 rounded-full flex items-center justify-center transition-colors duration-200">
          <i
            className={`${fullscreenClass} text-white cursor-pointer text-lg`}
            onClick={clickFullScreen}
          ></i>
        </button>
      </div>
    </div>
  );
};
export default PhotoViewer;
