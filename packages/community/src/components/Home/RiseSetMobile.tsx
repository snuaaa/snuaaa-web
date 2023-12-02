import React, { useContext, useState, useEffect } from 'react';
import { convertDateWithDay, convertTime } from '../../utils/convertDate';
import RiseSetContext from '../../contexts/RiseSetContext';

function RiseSetMobile() {
  const riseSetContext = useContext(RiseSetContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const today = new Date();

  useEffect(() => {
    if(isExpanded) {
      document.body.classList.add('enif-overflow-hidden');
    }
    else {
      document.body.classList.remove('enif-overflow-hidden');
    }
  }, [isExpanded]);

  return (
    <>
      <div className="rise-set-mobile-wrapper" onClick={() => setIsExpanded(true)}>
        <div className="moon-phase-wrapper">
          {/* <div className="moon-phase"></div> */}
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
        <div className="rise-set-desc">
          <h5>{convertDateWithDay(today)}</h5>
          <p>월령 {riseSetContext.lunAge}</p>
        </div>
      </div>
      {
        isExpanded &&
                <div className="enif-popup" onClick={() => setIsExpanded(false)}>
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
                </div>
      }
      {/* <p>일출 {convertTime(riseSetInfo.sunrise)} / 일몰 {convertTime(riseSetInfo.sunset)}</p>
            <p>월출 {convertTime(riseSetInfo.moonrise)} / 월몰 {convertTime(riseSetInfo.moonset)}</p>
            <p>천문박명 {convertTime(riseSetInfo.astm)} / {convertTime(riseSetInfo.aste)} </p> */}
    </>
  );
}

export default RiseSetMobile;
