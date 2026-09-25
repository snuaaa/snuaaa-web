import type { CSSProperties } from 'react';
import type {
  EvaluatedJoin,
  EvaluatedTrainItem,
  LinearTrainEvaluation,
} from './domain';
import type { RailItem } from './state';
import {
  CutawaySilhouette,
  cutawayPortDepth,
  cutawaySilhouetteDepth,
  cutawayVisualXBounds,
  endpointVisualCoordinates,
  endpointVisualDepth,
  endpointVisualProfileFor,
  EndpointSilhouette,
  type CutawayBodyKind,
  type EndpointVisualProfile,
  type CutawayPort,
} from './CutawayPrimitives';

type RailSchematicProps = {
  evaluation: LinearTrainEvaluation;
  railItems: readonly RailItem[];
};
type CoordinatePort = CutawayPort & { z_mm: number };
type BodyKind = CutawayBodyKind;
type Body = {
  id: string;
  kind: BodyKind;
  start_mm: number;
  end_mm: number;
  startPort: CoordinatePort;
  endPort: CoordinatePort;
};

const isCoordinate = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const formatDistance = (distance: number) =>
  `${distance > 0 ? '+' : ''}${distance} mm`;

const itemPorts = (item: EvaluatedTrainItem): CoordinatePort[] => {
  const origin = item.origin_mm;
  if (!isCoordinate(origin)) return [];
  return Object.entries(item.ports).flatMap(([key, port]) =>
    isCoordinate(port.z_mm)
      ? [
          {
            key,
            port,
            coordinate: origin + port.z_mm,
            z_mm: origin + port.z_mm,
          },
        ]
      : [],
  );
};

const classifyItem = (
  index: number,
  items: readonly EvaluatedTrainItem[],
  railItems: readonly RailItem[],
  terminal: LinearTrainEvaluation['terminal'],
): BodyKind => {
  if (index === 0) return 'tube';
  const item = items[index];
  const origin = item.origin_mm;
  const isTerminal =
    index === items.length - 1 &&
    (railItems[index]?.type === 'terminal' ||
      (terminal &&
        isCoordinate(origin) &&
        Object.values(item.planes).some(
          (plane) =>
            plane.key === terminal.key && origin + plane.z_mm === terminal.z_mm,
        )));
  return isTerminal ? 'terminal' : 'adapter';
};

const bodyFor = (
  item: EvaluatedTrainItem,
  kind: BodyKind,
): Body | undefined => {
  const ports = itemPorts(item).sort((left, right) => left.z_mm - right.z_mm);
  if (ports.length < 2 || ports[0].z_mm === ports[ports.length - 1].z_mm)
    return undefined;
  return {
    id: item.id,
    kind,
    start_mm: ports[0].z_mm,
    end_mm: ports[ports.length - 1].z_mm,
    startPort: ports[0],
    endPort: ports[ports.length - 1],
  };
};

const itemPlanes = (item: EvaluatedTrainItem) => {
  const origin = item.origin_mm;
  if (!isCoordinate(origin)) return [];
  return Object.values(item.planes).map((plane) => ({
    key: plane.key,
    coordinate: origin + plane.z_mm,
  }));
};

const endpointFor = (
  item: EvaluatedTrainItem,
  kind: BodyKind,
  terminal: LinearTrainEvaluation['terminal'],
): EndpointVisualProfile | undefined => {
  if (item.mountSpec.status !== 'verified') return undefined;
  const planes =
    kind === 'terminal'
      ? terminal
        ? itemPlanes(item).filter(
            (plane) =>
              plane.key === terminal.key && plane.coordinate === terminal.z_mm,
          )
        : []
      : itemPlanes(item);
  const focus =
    item.focus && isCoordinate(item.origin_mm)
      ? {
          min_mm: item.origin_mm + item.focus.min_mm,
          max_mm: item.origin_mm + item.focus.max_mm,
        }
      : undefined;
  return endpointVisualProfileFor({
    kind,
    ports: itemPorts(item),
    planes,
    focus,
  });
};

const CutawayBody = ({ body }: { body: Body }) => (
  <CutawaySilhouette
    kind={body.kind}
    left={body.start_mm}
    right={body.end_mm}
    startPort={body.startPort}
    endPort={body.endPort}
  />
);

const JoinMarker = ({ join, y }: { join: EvaluatedJoin; y: number }) => {
  if (!isCoordinate(join.leftDatum_mm)) return null;
  const x = join.leftDatum_mm;
  const isSlip =
    join.leftPort?.kind === 'slip' && join.rightPort?.kind === 'slip';
  return (
    <g className="cutaway__interface" data-status={join.status}>
      {isSlip ? (
        <path
          d={`M ${x - 8} ${y} H ${x + 8} M ${x - 5} ${y - 5} V ${y + 5} M ${x + 5} ${y - 5} V ${y + 5}`}
        />
      ) : (
        <circle cx={x} cy={y} r="6" />
      )}
      <title>
        {join.status === 'compatible'
          ? '결합 가능'
          : join.status === 'incompatible'
            ? '결합 불가'
            : '확인 필요'}
      </title>
    </g>
  );
};

const RailSchematic = ({ evaluation, railItems }: RailSchematicProps) => {
  const bodies = evaluation.items.flatMap((item, index) => {
    const body = bodyFor(
      item,
      classifyItem(index, evaluation.items, railItems, evaluation.terminal),
    );
    return body ? [body] : [];
  });
  const endpointProfiles = evaluation.items.flatMap((item, index) => {
    const profile = endpointFor(
      item,
      classifyItem(index, evaluation.items, railItems, evaluation.terminal),
      evaluation.terminal,
    );
    return profile ? [{ id: item.id, profile }] : [];
  });
  const portCoordinates = evaluation.items
    .flatMap(itemPorts)
    .map((port) => port.z_mm);
  const bodyCoordinates = bodies.flatMap((body) => [
    body.start_mm,
    body.end_mm,
  ]);
  const joinCoordinates = evaluation.joins.flatMap((join) =>
    [join.leftDatum_mm, join.rightDatum_mm].filter(isCoordinate),
  );
  const focusCoordinates = evaluation.focus
    ? [evaluation.focus.min_mm, evaluation.focus.max_mm].filter(isCoordinate)
    : [];
  const terminalCoordinates =
    evaluation.terminal && isCoordinate(evaluation.terminal.z_mm)
      ? [evaluation.terminal.z_mm]
      : [];
  const endpointCoordinates = endpointProfiles.flatMap(({ profile }) =>
    endpointVisualCoordinates(profile),
  );
  const visualBounds = cutawayVisualXBounds({
    ports: evaluation.items.flatMap(itemPorts),
    endpointProfiles: endpointProfiles.map(({ profile }) => profile),
  });
  const knownCoordinates = [
    ...portCoordinates,
    ...bodyCoordinates,
    ...endpointCoordinates,
    ...joinCoordinates,
    ...focusCoordinates,
    ...terminalCoordinates,
    ...(visualBounds ? [visualBounds.minX, visualBounds.maxX] : []),
  ];
  const knownMinX = knownCoordinates.length ? Math.min(...knownCoordinates) : 0;
  const knownMaxX = knownCoordinates.length ? Math.max(...knownCoordinates) : 0;
  const unresolvedItems = evaluation.items.filter(
    (item) =>
      !bodies.some((body) => body.id === item.id) &&
      !endpointProfiles.some((endpoint) => endpoint.id === item.id),
  );
  const viewBoxPadding = 72;
  const unknownAnchor = knownCoordinates.length ? knownMaxX : undefined;
  const unknownStubLength = 48;
  // This is a labelled symbolic extension, not a physical rail coordinate.
  const unknownDisplayMargin = 176;
  const unknownExtent =
    isCoordinate(unknownAnchor) && unresolvedItems.length > 0
      ? unknownAnchor + unknownDisplayMargin
      : undefined;
  const renderedMinX = Math.min(knownMinX, unknownExtent ?? knownMinX);
  const renderedMaxX = Math.max(knownMaxX, unknownExtent ?? knownMaxX);
  const minX = renderedMinX - viewBoxPadding;
  const maxX = renderedMaxX + viewBoxPadding;
  const width = maxX - minX;
  // Coordinate invariant: x = z_mm and y = radial distance from the optical axis.
  // Padding and CSS scale affect only the viewBox and output size, never known geometry.
  const terminal =
    evaluation.terminal && isCoordinate(evaluation.terminal.z_mm)
      ? evaluation.terminal
      : undefined;
  const focus =
    evaluation.focus &&
    isCoordinate(evaluation.focus.min_mm) &&
    isCoordinate(evaluation.focus.max_mm)
      ? evaluation.focus
      : undefined;
  const stubX = unknownAnchor;
  const profileDepth = Math.max(
    ...bodies.map((body) =>
      cutawaySilhouetteDepth(body.startPort, body.endPort),
    ),
    ...endpointProfiles.map(({ profile }) => endpointVisualDepth(profile)),
    ...evaluation.items.flatMap(itemPorts).map(cutawayPortDepth),
    25,
  );
  const annotationY = profileDepth + 16;
  const terminalLabelY = annotationY + 22;
  const terminalAnnotationLineY = annotationY / 2;
  const terminalKeyLabelY = 5;
  const terminalDistanceLabelY = terminalLabelY / 2;
  const unknownLabelY = annotationY + 4;
  const unplacedStartY = terminalLabelY + 24;
  const height = Math.max(
    96,
    unplacedStartY + unresolvedItems.length * 18 + 12,
  );
  const displayStyle = {
    '--rail-schematic-display-width': `${width}px`,
    '--rail-schematic-display-height': `${height}px`,
  } as CSSProperties;

  return (
    <figure className="rail-schematic" aria-labelledby="rail-schematic-title">
      <div className="rail-schematic__scroll">
        <svg
          className="rail-schematic__svg"
          role="img"
          aria-labelledby="rail-schematic-title rail-schematic-description"
          viewBox={`${minX} -2 ${width} ${height + 2}`}
          preserveAspectRatio="xMinYMin meet"
          style={displayStyle}
        >
          <title id="rail-schematic-title">광학계 단면도</title>
          <g className="cutaway__annotation" data-kind="axis">
            <line
              x1={visualBounds?.minX ?? knownMinX}
              x2={visualBounds?.maxX ?? knownMaxX}
              y1={0}
              y2={0}
            />
          </g>
          {focus && (
            <g className="cutaway__annotation" data-kind="focus">
              <rect
                x={focus.min_mm}
                y="14"
                width={Math.max(focus.max_mm - focus.min_mm, 3)}
                height="10"
              />
              <text x={focus.min_mm} y="10">
                초점 {formatDistance(focus.min_mm)} —{' '}
                {formatDistance(focus.max_mm)}
              </text>
            </g>
          )}
          {bodies.map((body) => (
            <CutawayBody body={body} key={body.id} />
          ))}
          {endpointProfiles.map(({ id, profile }) => (
            <EndpointSilhouette profile={profile} key={id} />
          ))}
          {evaluation.joins.map((join) => (
            <JoinMarker join={join} y={annotationY} key={join.key} />
          ))}
          {terminal && (
            <g className="cutaway__annotation" data-kind="terminal">
              <line
                x1={terminal.z_mm}
                x2={terminal.z_mm}
                y1="0"
                y2={terminalAnnotationLineY}
              />
              <text x={terminal.z_mm} y={terminalKeyLabelY} textAnchor="middle">
                {terminal.key}
              </text>
              <text
                x={terminal.z_mm}
                y={terminalDistanceLabelY}
                textAnchor="middle"
              >
                {formatDistance(terminal.z_mm)}
              </text>
            </g>
          )}
          {isCoordinate(stubX) && unresolvedItems.length > 0 && (
            <g className="cutaway__unresolved">
              <line x1={stubX} x2={stubX + unknownStubLength} y1="0" y2="0" />
              <path
                d={`M ${stubX + unknownStubLength} ${annotationY - 14} V ${annotationY + 14}`}
              />
              <text x={stubX + unknownStubLength + 8} y={unknownLabelY}>
                점선 이후 형상 알 수 없음
              </text>
            </g>
          )}
          {unresolvedItems.map((item, index) => (
            <g className="cutaway__unresolved" key={item.id}>
              <path d={`M ${knownMinX} ${unplacedStartY + index * 18} h 12`} />
              <text x={knownMinX + 18} y={unplacedStartY + 4 + index * 18}>
                {item.id} · 포트 위치 알 수 없음 · 점선 표시
              </text>
            </g>
          ))}
        </svg>
      </div>
      {unresolvedItems.length > 0 && (
        <figcaption>점선 구간은 형상 정보 없음</figcaption>
      )}
    </figure>
  );
};

export default RailSchematic;
