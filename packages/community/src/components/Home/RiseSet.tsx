import React, { useContext } from 'react';
import { convertDateWithDay, convertTime } from '../../utils/convertDate';
import RiseSetContext from '../../contexts/RiseSetContext';

function RiseSet() {

  const riseSetContext = useContext(RiseSetContext);
  const today = new Date();

  return (
    <div className="rise-set-wrapper">
      <div className="moon-phase-wrapper">
        <div className="moon-container">
          <div className={`phase-${Math.round(riseSetContext.lunAge * 100 / 29.7)} northern-hemisphere`}>
            <div className="half">
              <div className="ellipse white"></div>
              <div className="ellipse black"></div>
            </div>
            <div className="half">
              <div className="ellipse black"></div>
              <div className="ellipse white"></div>
            </div>
          </div>
        </div>
      </div>
      <h5>{convertDateWithDay(today)}</h5>
      <p>월령 {riseSetContext.lunAge}</p>
      <br />
      <p>일출 {convertTime(riseSetContext.sunrise)} / 일몰 {convertTime(riseSetContext.sunset)}</p>
      <p>월출 {convertTime(riseSetContext.moonrise)} / 월몰 {convertTime(riseSetContext.moonset)}</p>
      <p>천문박명 {convertTime(riseSetContext.astm)} / {convertTime(riseSetContext.aste)} </p>
    </div>
  );
}

export default RiseSet;
