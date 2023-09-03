import React from 'react';
import icon_weather from 'assets/img/common/icon_weather.png';
import icon_stella from 'assets/img/common/icon_stella.png';
import icon_apod from 'assets/img/common/icon_apod.png';

function ExtLinkMobile() {

  return (
    <div className="ext-link-mobile">
      <a className="link-img" href="https://m.kma.go.kr/m/index.jsp" target="_blank" rel="noopener noreferrer">
        <img src={icon_weather} alt="weather" />
      </a>
      <a className="link-img" href="https://stellarium-web.org/" target="_blank" rel="noopener noreferrer">
        <img src={icon_stella} alt="stellarium" />
      </a>
      <a className="link-img" href="https://apod.nasa.gov/apod/" target="_blank" rel="noopener noreferrer">
        <img src={icon_apod} alt="apod" />
      </a>
    </div>
  );
}

export default ExtLinkMobile;

