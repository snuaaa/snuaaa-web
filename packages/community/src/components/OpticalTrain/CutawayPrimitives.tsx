import type { FocusRange, MountPort } from './domain/types';
import { standardProfileFor } from './standardProfiles';

export type CutawayBodyKind = 'tube' | 'adapter' | 'terminal';

export type CutawayPort = { key: string; port: MountPort; coordinate: number };
export type CutawayPlane = { key: string; coordinate: number };

export type CutawayBodyProps = {
  kind: CutawayBodyKind;
  left: number;
  right: number;
  startPort: CutawayPort;
  endPort: CutawayPort;
};

type EndpointVisualProfileInput = {
  kind: CutawayBodyKind;
  ports: readonly CutawayPort[];
  planes?: readonly CutawayPlane[];
  focus?: FocusRange;
};

export type EndpointVisualProfile =
  | {
      kind: 'tube-output';
      port: CutawayPort;
      exteriorEndMm: number;
    }
  | {
      kind: 'terminal-plane';
      port: CutawayPort;
      plane: CutawayPlane;
      housingEndMm: number;
    }
  | {
      kind: 'terminal-no-plane';
      port: CutawayPort;
      housingEndMm: number;
    };

export type CutawayVisualXBounds = { minX: number; maxX: number };

export const interfaceRadius = (port: CutawayPort) => {
  const profile = standardProfileFor(port.port);
  return profile ? profile.nominalDiameterMm / 2 : 15;
};

const INTERFACE_LABEL_GAP = 10;
const TUBE_REPRESENTATIVE_LENGTH_MM = 40;
const TERMINAL_REPRESENTATIVE_LENGTH_MM = 10;
const VISUAL_AXIS_EXTENSION = 7;

export const cutawayPortDepth = (port: CutawayPort) =>
  interfaceRadius(port) + INTERFACE_LABEL_GAP;

export const cutawaySilhouetteDepth = (
  startPort: CutawayPort,
  endPort: CutawayPort,
) => Math.max(cutawayPortDepth(startPort), cutawayPortDepth(endPort));

const equipmentSideFor = (port: MountPort): -1 | 1 | undefined => {
  if (!port.facing) return undefined;

  return port.facing === '+' ? -1 : 1;
};

const representativeLengthWithoutFocusOverlap = (
  portCoordinate: number,
  direction: -1 | 1,
  focus: FocusRange | undefined,
) => {
  if (!focus) return TUBE_REPRESENTATIVE_LENGTH_MM;

  if (direction < 0) {
    if (focus.min_mm >= portCoordinate) return TUBE_REPRESENTATIVE_LENGTH_MM;
    if (focus.max_mm >= portCoordinate) return 0;
    return Math.min(
      TUBE_REPRESENTATIVE_LENGTH_MM,
      portCoordinate - focus.max_mm,
    );
  }

  if (focus.max_mm <= portCoordinate) return TUBE_REPRESENTATIVE_LENGTH_MM;
  if (focus.min_mm <= portCoordinate) return 0;
  return Math.min(TUBE_REPRESENTATIVE_LENGTH_MM, focus.min_mm - portCoordinate);
};

export const endpointVisualProfileFor = ({
  kind,
  ports,
  planes = [],
  focus,
}: EndpointVisualProfileInput): EndpointVisualProfile | undefined => {
  if (ports.length !== 1 || !standardProfileFor(ports[0].port))
    return undefined;

  const port = ports[0];
  if (kind === 'tube') {
    const direction = equipmentSideFor(port.port);
    if (!direction) return undefined;

    const length = representativeLengthWithoutFocusOverlap(
      port.coordinate,
      direction,
      focus,
    );
    return length > 0
      ? {
          kind: 'tube-output',
          port,
          exteriorEndMm: port.coordinate + direction * length,
        }
      : undefined;
  }

  if (kind === 'terminal' && planes.length === 1) {
    const plane = planes[0];
    if (plane.coordinate === port.coordinate) {
      // Coincident terminal plane: fall back to equipment-side direction,
      // consistent with the plane-less terminal behavior.
      const direction = equipmentSideFor(port.port);
      if (!direction) return undefined;
      return {
        kind: 'terminal-no-plane',
        port,
        housingEndMm:
          port.coordinate + direction * TERMINAL_REPRESENTATIVE_LENGTH_MM,
      };
    }
    const direction = plane.coordinate > port.coordinate ? 1 : -1;
    return {
      kind: 'terminal-plane',
      port,
      plane,
      housingEndMm:
        plane.coordinate + direction * TERMINAL_REPRESENTATIVE_LENGTH_MM,
    };
  }

  if (
    kind === 'terminal' &&
    planes.length === 0 &&
    Number.isFinite(port.coordinate)
  ) {
    const direction = equipmentSideFor(port.port);
    if (!direction) return undefined;

    // Learning: without a field-stop plane, terminal reachability is unknown;
    // show only a representative housing extending toward the equipment side.
    return {
      kind: 'terminal-no-plane',
      port,
      housingEndMm:
        port.coordinate + direction * TERMINAL_REPRESENTATIVE_LENGTH_MM,
    };
  }

  return undefined;
};

export const endpointVisualCoordinates = (profile: EndpointVisualProfile) =>
  profile.kind === 'tube-output'
    ? [profile.port.coordinate, profile.exteriorEndMm]
    : profile.kind === 'terminal-plane'
      ? [
          profile.port.coordinate,
          profile.plane.coordinate,
          profile.housingEndMm,
        ]
      : [profile.port.coordinate, profile.housingEndMm];

const interfaceCollarGeometry = (x: number, port: CutawayPort) => {
  const facingDirection = port.port.facing === '+' ? 1 : -1;
  const sex = port.port.sex;
  const profileKind = standardProfileFor(port.port)?.kind ?? 'unknown';
  const collarWidth =
    profileKind === 'bayonet' ? 8 : profileKind === 'slip' ? 20 : 5;
  const shoulderX = x;
  const endX = x + (sex === 'f' ? -1 : 1) * facingDirection * collarWidth;

  return { facingDirection, sex, profileKind, collarWidth, shoulderX, endX };
};

// Centerlines follow the actual collar and endpoint extents, not just mount datums.
export const cutawayVisualXBounds = ({
  ports,
  endpointProfiles = [],
}: {
  ports: readonly CutawayPort[];
  endpointProfiles?: readonly EndpointVisualProfile[];
}): CutawayVisualXBounds | undefined => {
  const coordinates = [
    ...ports.flatMap((port) => {
      const { shoulderX, endX } = interfaceCollarGeometry(
        port.coordinate,
        port,
      );
      return [shoulderX, endX];
    }),
    ...endpointProfiles.flatMap(endpointVisualCoordinates),
  ];

  return coordinates.length
    ? {
        minX: Math.min(...coordinates) - VISUAL_AXIS_EXTENSION,
        maxX: Math.max(...coordinates) + VISUAL_AXIS_EXTENSION,
      }
    : undefined;
};

export const endpointVisualDepth = (profile: EndpointVisualProfile) => {
  const mountRadius = interfaceRadius(profile.port);
  return profile.kind === 'tube-output'
    ? Math.max(
        cutawayPortDepth(profile.port),
        mountRadius * 0.78 + INTERFACE_LABEL_GAP,
      )
    : Math.max(
        cutawayPortDepth(profile.port),
        mountRadius * 0.9 + INTERFACE_LABEL_GAP,
      );
};

const BayonetConvention = ({
  shoulderX,
  endX,
  sex,
  radius,
}: {
  shoulderX: number;
  endX: number;
  facingDirection: number;
  sex: 'm' | 'f';
  radius: number;
}) => {
  return (
    <g className="cutaway__interface">
      {sex === 'f' && (
        <path
          d={`M ${endX} ${radius * 0.8} H ${shoulderX * 0.6 + endX * 0.4} V ${radius * 0.5}`}
        />
      )}
      {sex === 'm' && (
        <path
          d={`M ${shoulderX} ${radius * 0.4} H ${shoulderX * 0.4 + endX * 0.6} V ${radius * 0.7}`}
        />
      )}
    </g>
  );
};

export const InterfaceCollar = ({
  x,
  port,
}: {
  x: number;
  port: CutawayPort;
  side: 'left' | 'right';
}) => {
  const { facingDirection, sex, profileKind, collarWidth, shoulderX, endX } =
    interfaceCollarGeometry(x, port);
  const radius = interfaceRadius(port);
  const labelY = cutawayPortDepth(port);

  return (
    <g className="cutaway__interface">
      <path d={`M ${shoulderX} 0 V ${radius} H ${endX} V 0`} />
      {profileKind === 'thread' &&
        [0, 4, 8].map((offset) => (
          <line
            className="cutaway__hatch"
            x1={Math.min(shoulderX, endX)}
            y1={radius - offset}
            x2={Math.max(shoulderX, endX)}
            y2={radius - 8 - offset}
          />
        ))}
      {profileKind === 'bayonet' && (
        <BayonetConvention
          shoulderX={shoulderX}
          endX={endX}
          facingDirection={facingDirection}
          sex={sex}
          radius={radius}
        />
      )}
      {port.port.facing && (
        <path
          className="cutaway__annotation"
          data-kind="facing"
          d={`M ${x + facingDirection * (sex === 'f' ? 3 : collarWidth + 3)} 4 l ${facingDirection * 4} 4 l ${-facingDirection * 4} 4`}
        />
      )}
      {port.port.std && (
        <text x={x} y={labelY} textAnchor="middle">
          {port.port.std}
        </text>
      )}
      <title>{`${port.key}: ${port.port.kind ?? '결합 방식 미확인'} · ${port.port.std ?? '규격 미확인'} · ${port.port.sex ?? '성별 미확인'} · ${port.port.facing ?? '방향 미확인'}`}</title>
    </g>
  );
};

export const CutawaySilhouette = ({
  left,
  right,
  startPort,
  endPort,
}: CutawayBodyProps) => {
  const startRadius = interfaceRadius(startPort);
  const endRadius = interfaceRadius(endPort);

  return (
    <g className="cutaway__body">
      <path
        className="cutaway__estimated-body"
        d={`M ${left} ${startRadius} V ${startRadius + 3} L ${right} ${endRadius + 3} V ${endRadius}`}
      />
      <InterfaceCollar x={left} port={startPort} side="left" />
      <InterfaceCollar x={right} port={endPort} side="right" />
    </g>
  );
};

export const EndpointSilhouette = ({
  profile,
}: {
  profile: EndpointVisualProfile;
}) => {
  const mountRadius = interfaceRadius(profile.port);

  if (profile.kind === 'tube-output') {
    const { port, exteriorEndMm } = profile;
    const barrelRadius = mountRadius + 8;

    return (
      <g className="cutaway__body">
        <path
          className="cutaway__estimated-body"
          d={`M ${port.coordinate} ${mountRadius} V ${barrelRadius} H ${exteriorEndMm}`}
        />
        <InterfaceCollar
          x={port.coordinate}
          port={port}
          side={exteriorEndMm < port.coordinate ? 'right' : 'left'}
        />
      </g>
    );
  }

  if (profile.kind === 'terminal-no-plane') {
    const { port, housingEndMm } = profile;
    const direction = housingEndMm > port.coordinate ? 1 : -1;
    const housingRadius = mountRadius + 10;

    return (
      <g className="cutaway__body">
        <path
          className="cutaway__estimated-body"
          d={`M ${port.coordinate} ${mountRadius} V ${housingRadius} H ${housingEndMm} V 0`}
        />
        <InterfaceCollar
          x={port.coordinate}
          port={port}
          side={direction > 0 ? 'left' : 'right'}
        />
      </g>
    );
  }

  const { port, plane, housingEndMm } = profile;
  const direction = plane.coordinate > port.coordinate ? 1 : -1;
  const housingRadius = mountRadius + 10;

  return (
    <g className="cutaway__body">
      <path
        className="cutaway__estimated-body"
        d={`M ${port.coordinate} ${mountRadius} V ${housingRadius} H ${housingEndMm + direction * 5} V 0`}
      />
      <InterfaceCollar
        x={port.coordinate}
        port={port}
        side={direction > 0 ? 'left' : 'right'}
      />
    </g>
  );
};
