import React, { useState, useEffect } from 'react';

const VISIBLE_TIME = 3;

function TopUpButton() {

  const [isVisible, setIsVisible] = useState(true);
  const [isTop, setIsTop] = useState(false);

  let timer = VISIBLE_TIME;
  let lastScrollTop = window.pageYOffset;

  const handleScroll = function () {
    let tmpScrollTop = window.pageYOffset;
    // console.log(document.documentElement.scrollTop);
    if (lastScrollTop > tmpScrollTop) {
      setIsTop(true);
    }
    else {
      setIsTop(false);
    }
    lastScrollTop = tmpScrollTop;
    timer = VISIBLE_TIME;       
    setIsVisible(true);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (timer < 0) {
        setIsVisible(false);
      }
      else {
        timer--;
      }
    }, 1000);
    window.addEventListener('scroll', handleScroll, true);

    return function () {
      clearInterval(tick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  let btnClass = isVisible ? 'enif-visible' : 'enif-unvisible';
  let iconClass = isTop ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line';
  return (
    <a href={isTop ? '#aaa-top' : '#aaa-bottom'} className={`btn-top-up-link btn-top-up-mobile enif-hide-desktop ${btnClass}`}>
      <div className="btn-top-up">
        <i className={`${iconClass} enif-pointer enif-f-1p2x`}></i>
      </div>
    </a>
  );
}

export default TopUpButton;