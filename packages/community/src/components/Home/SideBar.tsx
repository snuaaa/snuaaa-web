import React from 'react';
import icon_weather from 'assets/img/common/icon_weather.png';
import icon_stella from 'assets/img/common/icon_stella.png';
import icon_apod from 'assets/img/common/icon_apod.png';

function SideBar() {

  return (
    <div className="side-right">
      <div className="side-bar-wrapper">
        <a href="https://www.kma.go.kr" target="_blank" rel="noopener noreferrer">
          <img src={icon_weather} alt="weather" />
        </a>
        <a href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer">
          <img src={icon_stella} alt="stellarium" />
        </a>
        <a href="https://apod.nasa.gov/apod/" target="_blank" rel="noopener noreferrer">
          <img src={icon_apod} alt="apod" />
        </a>
        <a href="#aaa-top" className="btn-top-up-link">
          <div className="btn-top-up">
            <i className="ri-arrow-up-s-line enif-pointer"></i>
                        TOP
          </div>
        </a>
      </div>
    </div>
  );
}

export default SideBar;

