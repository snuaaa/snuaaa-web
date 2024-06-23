import { useState, useEffect, useCallback, useRef } from 'react';

const VISIBLE_TIME = 3;

function TopUpButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [isTop, setIsTop] = useState(false);

  const timer = useRef(VISIBLE_TIME);
  const lastScrollTop = useRef(window.scrollY);

  const handleScroll = useCallback(() => {
    const tmpScrollTop = window.scrollY;
    if (lastScrollTop.current > tmpScrollTop) {
      setIsTop(true);
    } else {
      setIsTop(false);
    }
    lastScrollTop.current = tmpScrollTop;
    timer.current = VISIBLE_TIME;
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      if (timer.current < 0) {
        setIsVisible(false);
      } else {
        timer.current -= 1;
      }
    }, 1000);
    window.addEventListener('scroll', handleScroll, true);

    return function () {
      clearInterval(tick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleScroll, timer]);

  const btnClass = isVisible ? 'opacity-100' : 'opacity-0';
  const iconClass = isTop ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line';
  return (
    <a
      href={isTop ? '#aaa-top' : '#aaa-bottom'}
      className={`btn-top-up-link btn-top-up-mobile hidden ${btnClass}`}
    >
      <div className="btn-top-up">
        <i className={`${iconClass} cursor-pointer enif-f-1p2x`}></i>
      </div>
    </a>
  );
}

export default TopUpButton;
