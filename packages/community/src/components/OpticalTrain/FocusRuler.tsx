import type { CSSProperties } from 'react';
import type { EvaluatedFocusRange, EvaluatedPlane } from './domain';

type FocusRulerProps = {
  focus?: EvaluatedFocusRange;
  terminal?: EvaluatedPlane;
};

const formatDistance = (distance: number) =>
  `${distance > 0 ? '+' : ''}${distance} mm`;

export const FocusRuler = ({ focus, terminal }: FocusRulerProps) => {
  if (!focus || !terminal) {
    return (
      <p className="rail-evaluation__ruler-empty">
        형상 정보가 없어 눈금을 표시할 수 없습니다.
      </p>
    );
  }

  const minimum = Math.min(focus.min_mm, terminal.z_mm);
  const maximum = Math.max(focus.max_mm, terminal.z_mm);
  const span = maximum - minimum || 1;
  const focusStart = ((focus.min_mm - minimum) / span) * 100;
  const focusWidth = ((focus.max_mm - focus.min_mm) / span) * 100;
  const terminalPosition = ((terminal.z_mm - minimum) / span) * 100;

  return (
    <figure
      className="rail-evaluation__ruler"
      aria-label="초점 범위와 터미널 평면의 선형 위치"
    >
      <div className="rail-evaluation__ruler-legend" aria-hidden="true">
        <span>초점 범위</span>
        <span>터미널</span>
      </div>
      <div className="rail-evaluation__ruler-track">
        <span
          className="rail-evaluation__focus-band"
          style={
            {
              '--focus-start': `${focusStart}%`,
              '--focus-width': `${focusWidth}%`,
            } as CSSProperties
          }
        />
        <span
          className="rail-evaluation__terminal-marker"
          style={
            { '--terminal-position': `${terminalPosition}%` } as CSSProperties
          }
        />
      </div>
      <figcaption>
        <span>{formatDistance(focus.min_mm)}</span>
        <span>{formatDistance(focus.max_mm)}</span>
        <strong>
          {terminal.key}: {formatDistance(terminal.z_mm)}
        </strong>
      </figcaption>
    </figure>
  );
};
