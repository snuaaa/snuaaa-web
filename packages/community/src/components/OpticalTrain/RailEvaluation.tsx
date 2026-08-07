import type {
  EvaluatedJoin,
  LinearTrainEvaluation,
  TrainStatus,
} from './domain';
import { FocusRuler } from './FocusRuler';
import './RailEvaluation.scss';

type RailEvaluationProps = {
  evaluation: LinearTrainEvaluation;
};

const statusLabels: Record<TrainStatus, string> = {
  compatible: '호환',
  incompatible: '결합 불가',
  unverified: '확인 필요',
  incomplete: '구성 필요',
};

const predicateLabels = {
  kind: '결합 방식',
  std: '규격',
  sex: '성별',
  facing: '방향',
  separation: '분리 거리',
} as const;

const formatDistance = (distance: number | undefined) =>
  distance === undefined
    ? '알 수 없음'
    : `${distance > 0 ? '+' : ''}${distance} mm`;

const joinTitle = (join: EvaluatedJoin) =>
  join.leftPortKey && join.rightPortKey
    ? `${join.leftPortKey} → ${join.rightPortKey}`
    : '선택된 포트 정보 없음';

const MechanicalFinding = ({ join }: { join: EvaluatedJoin }) => {
  const failedPredicates = join.failedPredicates.map(
    (predicate) => predicateLabels[predicate],
  );

  return (
    <li className="rail-evaluation__finding">
      <div>
        <strong>{joinTitle(join)}</strong>
        <span
          className={`rail-evaluation__join-status rail-evaluation__join-status--${join.status}`}
        >
          {join.status === 'compatible'
            ? '호환'
            : join.status === 'incompatible'
              ? '결합 불가'
              : '확인 필요'}
        </span>
      </div>
      {failedPredicates.length > 0 ? (
        <p>맞지 않는 항목: {failedPredicates.join(', ')}</p>
      ) : join.status === 'unverified' ? (
        <p>포트 또는 규격을 확인하세요.</p>
      ) : (
        <p>결합할 수 있습니다.</p>
      )}
    </li>
  );
};

export const RailEvaluation = ({ evaluation }: RailEvaluationProps) => {
  const geometryIsKnown = evaluation.geometryStatus === 'known';

  return (
    <div
      role="region"
      className="rail-evaluation"
      aria-labelledby="rail-evaluation-title"
    >
      <header className="rail-evaluation__header">
        <h3
          id="rail-evaluation-title"
          className="mb-2 text-base font-bold text-gray-950"
        >
          기계 결합 · 초점 도달성
        </h3>
        <span
          className={`rail-evaluation__status rail-evaluation__status--${evaluation.status}`}
        >
          {statusLabels[evaluation.status]}
        </span>
      </header>

      <div className="rail-evaluation__grid">
        <div
          role="region"
          className="rail-evaluation__section"
          aria-labelledby="mechanical-findings-title"
        >
          <h4 id="mechanical-findings-title">기계 결합</h4>
          {evaluation.joins.length > 0 ? (
            <ul className="rail-evaluation__findings">
              {evaluation.joins.map((join) => (
                <MechanicalFinding join={join} key={join.key} />
              ))}
            </ul>
          ) : (
            <p className="rail-evaluation__unknown">구성품을 더 추가하세요.</p>
          )}
        </div>

        <div
          role="region"
          className="rail-evaluation__section"
          aria-labelledby="geometry-findings-title"
        >
          <h4 id="geometry-findings-title">광학 형상</h4>
          <dl className="rail-evaluation__measurements">
            <div>
              <dt>초점 범위</dt>
              <dd>
                {geometryIsKnown && evaluation.focus
                  ? `${formatDistance(evaluation.focus.min_mm)} ~ ${formatDistance(evaluation.focus.max_mm)}`
                  : '알 수 없음'}
              </dd>
            </div>
            <div>
              <dt>터미널 평면</dt>
              <dd>
                {geometryIsKnown && evaluation.terminal
                  ? evaluation.terminal.key
                  : '알 수 없음'}
              </dd>
            </div>
            <div>
              <dt>부호 거리</dt>
              <dd>
                {geometryIsKnown
                  ? formatDistance(evaluation.terminal?.z_mm)
                  : '알 수 없음'}
              </dd>
            </div>
            <div>
              <dt>초점 도달</dt>
              <dd>
                {evaluation.terminalReachability === 'reachable'
                  ? '범위 안'
                  : evaluation.terminalReachability === 'out_of_range'
                    ? '범위 밖'
                    : '알 수 없음'}
              </dd>
            </div>
          </dl>
          <FocusRuler
            focus={geometryIsKnown ? evaluation.focus : undefined}
            terminal={geometryIsKnown ? evaluation.terminal : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default RailEvaluation;
