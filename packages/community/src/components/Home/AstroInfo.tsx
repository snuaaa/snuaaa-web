import { useContext } from 'react';
import { convertDateWithDay, convertTime } from '../../utils/convertDate';
import RiseSetContext from '../../contexts/RiseSetContext';

function AstroInfo() {
  const riseSetContext = useContext(RiseSetContext);
  const today = new Date();

  return (
    <div className="rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 p-5 text-white">
      <div className="flex items-center gap-4 mb-4">
        {/* Moon phase */}
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(116,185,255,0.3)]">
          <div className="moon-container w-12 h-12 relative">
            <div
              className={`phase-${Math.round((riseSetContext.lunAge * 100) / 29.7)} northern-hemisphere`}
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
        <div>
          <p className="text-sm font-bold">{convertDateWithDay(today)}</p>
          <p className="text-xs text-white/60 mt-1">
            월령 {riseSetContext.lunAge}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5 text-xs text-white/70">
        <div className="flex items-center gap-2">
          <i className="ri-sun-line text-amber-400"></i>
          <span>
            일출 {convertTime(riseSetContext.sunrise)} / 일몰{' '}
            {convertTime(riseSetContext.sunset)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-moon-line text-blue-300"></i>
          <span>
            월출 {convertTime(riseSetContext.moonrise)} / 월몰{' '}
            {convertTime(riseSetContext.moonset)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ri-contrast-2-line text-purple-300"></i>
          <span>
            천문박명 {convertTime(riseSetContext.astm)} /{' '}
            {convertTime(riseSetContext.aste)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AstroInfo;
