import React, { useRef, useEffect } from 'react';

type ProgressBarProps = {
    loadedPercentage: number;
    currentIdx?: number;
    totalIdx?: number;
}

function ProgressBar({ loadedPercentage, currentIdx, totalIdx }: ProgressBarProps) {

  const svgPath = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (svgPath.current) {
      const totalLength = svgPath.current.getTotalLength();
      svgPath.current.style.strokeDasharray = totalLength.toString();
    }
  }, []);

  useEffect(() => {
    if (svgPath.current) {
      const totalLength = svgPath.current.getTotalLength();
      svgPath.current.style.strokeDashoffset = String(totalLength + (100 - totalLength * loadedPercentage) / 100);
    }
  }, [loadedPercentage]);

  return (
    <div className="enif-modal-wrapper">
      <div className="progress-wrapper">
        <svg id="svg" height="400" width="450">
          <path ref={svgPath} id="svgPathStar" d="M 90 350 l 130 -300 l 150 300 l -300 -170 l 280 -50 Z" stroke="white"
            strokeWidth="6" fill="none" />
          {
            totalIdx &&
                        <text x="200" y="400" fill="white">{currentIdx} / {totalIdx}</text>
          }
        </svg>
      </div>
    </div>
  );
}

export default ProgressBar;