import React from 'react';
import { convertDateWithDay, convertTime } from '../../utils/convertDate';
import { useRiseSet } from '~/hooks/queries/useHomeQueries';
import { RiseSet as RiseSetInfo } from '~/services/HomeService';

const emptyRiseSet: Partial<RiseSetInfo> = {};

function RiseSet() {
  const { data: riseSet = emptyRiseSet } = useRiseSet();
  const today = new Date();

  return (
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
        일출 {convertTime(riseSet.sunrise)} / 일몰 {convertTime(riseSet.sunset)}
      </p>
      <p>
        월출 {convertTime(riseSet.moonrise)} / 월몰{' '}
        {convertTime(riseSet.moonset)}
      </p>
      <p>
        천문박명 {convertTime(riseSet.astm)} / {convertTime(riseSet.aste)}{' '}
      </p>
    </div>
  );
}

export default RiseSet;
