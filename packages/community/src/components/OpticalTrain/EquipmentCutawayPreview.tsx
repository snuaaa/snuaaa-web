import type { CSSProperties } from 'react';
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
  type CutawayPort,
} from './CutawayPrimitives';
import { evaluateMountSpec } from './domain/mountSpec';
import type { MountPlane, ParsedMountSpec } from './domain/types';

const finitePorts = (parsed: ParsedMountSpec): CutawayPort[] =>
  Object.entries(parsed.ports)
    .flatMap(([key, port]) =>
      typeof port.z_mm === 'number' && Number.isFinite(port.z_mm)
        ? [{ key, port, coordinate: port.z_mm }]
        : [],
    )
    .sort((left, right) => left.coordinate - right.coordinate);

const planeMarkerLineBottomGap = 10;
const planeMarkerLabelBaseline = 5;

const PlaneMarker = ({
  plane,
  x,
  depth,
}: {
  plane: MountPlane;
  x: number;
  depth: number;
}) => (
  <g className="cutaway__annotation" data-kind="plane">
    <line x1={x} x2={x} y1="0" y2={(depth - planeMarkerLineBottomGap) / 2} />
    <text x={x} y={planeMarkerLabelBaseline} textAnchor="middle">
      {plane.key}
    </text>
  </g>
);

const FocusRangeMarker = ({
  min,
  max,
  toX,
}: {
  min: number;
  max: number;
  toX: (coordinate: number) => number;
}) => {
  const start = toX(min);
  const end = toX(max);

  return (
    <g className="cutaway__annotation" data-kind="focus">
      <line x1={start} x2={end} y1="14" y2="14" />
      <line x1={start} x2={start} y1="10" y2="18" />
      <line x1={end} x2={end} y1="10" y2="18" />
      <text x={start} y="9">
        초점 {min}–{max} mm
      </text>
      <title>{`초점 범위: ${min} mm — ${max} mm`}</title>
    </g>
  );
};

const isCoordinate = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

type EquipmentCutawayPreviewProps = {
  mountSpec: unknown;
  type: CutawayBodyKind;
  compact?: boolean;
};

const EquipmentCutawayPreview = ({
  mountSpec,
  type,
  compact = false,
}: EquipmentCutawayPreviewProps) => {
  const parsed = evaluateMountSpec(mountSpec);
  const ports = finitePorts(parsed);
  const startPort = ports[0];
  const endPort = ports[ports.length - 1];
  const hasKnownSpan =
    parsed.status === 'verified' &&
    !!startPort &&
    !!endPort &&
    startPort.coordinate !== endPort.coordinate;
  const planes = Object.values(parsed.planes).filter((plane) =>
    isCoordinate(plane.z_mm),
  );
  const focus = type === 'tube' ? parsed.focus : undefined;
  const endpointProfile =
    parsed.status === 'verified'
      ? endpointVisualProfileFor({
          kind: type,
          ports,
          planes: planes.map((plane) => ({
            key: plane.key,
            coordinate: plane.z_mm,
          })),
          focus,
        })
      : undefined;
  const visualBounds = cutawayVisualXBounds({
    ports,
    endpointProfiles: endpointProfile ? [endpointProfile] : [],
  });
  const fallbackLabel = '정보 없음';
  const visibleFallbackPorts: CutawayPort[] =
    ports.length >= 2
      ? [ports[0]!, ports[ports.length - 1]!]
      : ports.slice(0, 1);
  const knownCoordinates = [
    ...ports.map((port) => port.coordinate),
    ...planes.map((plane) => plane.z_mm),
    ...(focus ? [focus.min_mm, focus.max_mm] : []),
    ...(endpointProfile ? endpointVisualCoordinates(endpointProfile) : []),
    ...(visualBounds ? [visualBounds.minX, visualBounds.maxX] : []),
  ];
  const knownStart = knownCoordinates.length
    ? Math.min(...knownCoordinates)
    : 0;
  const knownEnd = knownCoordinates.length ? Math.max(...knownCoordinates) : 0;
  const padding = 4;
  const width = Math.max(40, knownEnd - knownStart + padding * 2);
  const profileDepth =
    hasKnownSpan && startPort && endPort
      ? cutawaySilhouetteDepth(startPort, endPort)
      : endpointProfile
        ? endpointVisualDepth(endpointProfile)
        : Math.max(...visibleFallbackPorts.map(cutawayPortDepth), 25);
  const height = Math.max(
    72,
    profileDepth + 18,
    planes.length ? profileDepth + 24 : 0,
  );
  const displayStyle = {
    '--cutaway-preview-display-width': `${width}px`,
  } as CSSProperties;
  const toX = (coordinate: number) => padding + (coordinate - knownStart);
  const planeX = (plane: MountPlane, index: number) =>
    hasKnownSpan || endpointProfile ? toX(plane.z_mm) : 120 + index * 14;

  return (
    <figure
      className={`equipment-cutaway-preview${compact ? ' equipment-cutaway-preview--compact' : ''}`}
    >
      <svg
        role="img"
        viewBox={`0 -2 ${width} ${height + 2}`}
        preserveAspectRatio="xMidYMid meet"
        style={displayStyle}
      >
        <g className="cutaway__annotation" data-kind="axis">
          <line
            x1={toX(visualBounds?.minX ?? knownStart)}
            x2={toX(visualBounds?.maxX ?? knownEnd)}
            y1={0}
            y2={0}
          />
        </g>
        {hasKnownSpan && startPort && endPort ? (
          <CutawaySilhouette
            kind={type}
            left={toX(startPort.coordinate)}
            right={toX(endPort.coordinate)}
            startPort={startPort}
            endPort={endPort}
          />
        ) : endpointProfile ? (
          <EndpointSilhouette
            profile={{
              ...endpointProfile,
              ...(endpointProfile.kind === 'tube-output'
                ? {
                    port: {
                      ...endpointProfile.port,
                      coordinate: toX(endpointProfile.port.coordinate),
                    },
                    exteriorEndMm: toX(endpointProfile.exteriorEndMm),
                  }
                : endpointProfile.kind === 'terminal-no-plane'
                  ? {
                      port: {
                        ...endpointProfile.port,
                        coordinate: toX(endpointProfile.port.coordinate),
                      },
                      housingEndMm: toX(endpointProfile.housingEndMm),
                    }
                  : {
                      port: {
                        ...endpointProfile.port,
                        coordinate: toX(endpointProfile.port.coordinate),
                      },
                      plane: {
                        ...endpointProfile.plane,
                        coordinate: toX(endpointProfile.plane.coordinate),
                      },
                      housingEndMm: toX(endpointProfile.housingEndMm),
                    }),
            }}
          />
        ) : (
          <g className="cutaway__unresolved">
            <text x={0} y={profileDepth + 14} textAnchor="start">
              {fallbackLabel}
            </text>
          </g>
        )}
        {planes.map((plane, index) => (
          <PlaneMarker
            key={plane.key}
            plane={plane}
            x={planeX(plane, index)}
            depth={height}
          />
        ))}
        {focus && (
          <FocusRangeMarker min={focus.min_mm} max={focus.max_mm} toX={toX} />
        )}
      </svg>
      {!hasKnownSpan && !endpointProfile && (
        <figcaption>{fallbackLabel}</figcaption>
      )}
    </figure>
  );
};

export default EquipmentCutawayPreview;
