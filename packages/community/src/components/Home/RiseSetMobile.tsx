import React, { useState, useEffect } from 'react';
import { convertDateWithDay, convertTime } from '../../utils/convertDate';
import { useRiseSet } from '~/hooks/queries/useHomeQueries';
import { RiseSet as RiseSetInfo } from '~/services/HomeService';

const emptyRiseSet: Partial<RiseSetInfo> = {};

function RiseSetMobile() {
  const { data: riseSet = emptyRiseSet } = useRiseSet();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const today = new Date();

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isExpanded]);

  return (
    <>
      <div
        className="rise-set-mobile-wrapper"
        onClick={() => setIsExpanded(true)}
      >
        <div className="moon-phase-wrapper">
          {/* <div className="moon-phase"></div> */}
          <div className="moon-container">
            <div
              className={`phase-${Math.round(((riseSet.lunAge ?? 0) * 100) / 29.7)} northern-hemisphere`}
            >
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
          <p>월령 {riseSet.lunAge ?? '-'}</p>
        </div>
      </div>
      {isExpanded && (
        <div className="enif-popup" onClick={() => setIsExpanded(false)}>
          <div className="rise-set-wrapper">
            <div className="moon-phase-wrapper">
              <div className="moon-container">
                <div
                  className={`phase-${Math.round(((riseSet.lunAge ?? 0) * 100) / 29.7)} northern-hemisphere`}
                >
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
            <p>월령 {riseSet.lunAge ?? '-'}</p>
            <br />
            <p>
              일출 {convertTime(riseSet.sunrise)} / 일몰{' '}
              {convertTime(riseSet.sunset)}
            </p>
            <p>
              월출 {convertTime(riseSet.moonrise)} / 월몰{' '}
              {convertTime(riseSet.moonset)}
            </p>
            <p>
              천문박명 {convertTime(riseSet.astm)} /{' '}
              {convertTime(riseSet.aste)}{' '}
            </p>
          </div>
        </div>
      )}
      {/* <p>일출 {convertTime(riseSetInfo.sunrise)} / 일몰 {convertTime(riseSetInfo.sunset)}</p>
            <p>월출 {convertTime(riseSetInfo.moonrise)} / 월몰 {convertTime(riseSetInfo.moonset)}</p>
            <p>천문박명 {convertTime(riseSetInfo.astm)} / {convertTime(riseSetInfo.aste)} </p> */}
    </>
  );
}

export default RiseSetMobile;
