import {
  Facing,
  FocusRange,
  MountPlane,
  MountPort,
  ParsedMountSpec,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readFacing(value: unknown): Facing | undefined {
  return value === '+' || value === '-' ? value : undefined;
}

function parsePort(key: string, value: unknown): MountPort | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const port: MountPort = { key };
  if (isFiniteNumber(value.z_mm)) {
    port.z_mm = value.z_mm;
  }
  if (readFacing(value.facing)) {
    port.facing = readFacing(value.facing);
  }
  if (readString(value.kind)) {
    port.kind = readString(value.kind);
  }
  if (readString(value.std)) {
    port.std = readString(value.std);
  }
  if (readString(value.sex)) {
    port.sex = readString(value.sex);
  }
  if (isFiniteNumber(value.engage_mm)) {
    port.engage_mm = value.engage_mm;
  }

  return port;
}

function parsePlane(key: string, value: unknown): MountPlane | undefined {
  if (!isRecord(value) || !isFiniteNumber(value.z_mm)) {
    return undefined;
  }

  return { key, z_mm: value.z_mm };
}

function parseFocus(value: unknown): FocusRange | undefined {
  if (
    !isRecord(value) ||
    !Array.isArray(value.z_mm) ||
    value.z_mm.length !== 2
  ) {
    return undefined;
  }

  const [min_mm, max_mm] = value.z_mm;
  if (!isFiniteNumber(min_mm) || !isFiniteNumber(max_mm) || min_mm > max_mm) {
    return undefined;
  }

  return { min_mm, max_mm };
}

export function parseMountSpec(mountSpec: unknown): ParsedMountSpec {
  const issues: string[] = [];
  const ports: Record<string, MountPort> = {};
  const planes: Record<string, MountPlane> = {};
  let focus: FocusRange | undefined;

  if (!isRecord(mountSpec)) {
    return {
      status: 'unverified',
      ports,
      planes,
      issues: ['mount_spec is absent or malformed'],
    };
  }

  if (!isRecord(mountSpec.ports)) {
    issues.push('ports is absent or malformed');
  } else {
    Object.entries(mountSpec.ports).forEach(([key, value]) => {
      const port = parsePort(key, value);
      if (!port) {
        issues.push(`port ${key} is malformed`);
        return;
      }
      ports[key] = port;
    });

    if (Object.keys(ports).length === 0) {
      issues.push('ports is empty');
    }
  }

  if (mountSpec.planes !== undefined) {
    if (!isRecord(mountSpec.planes)) {
      issues.push('planes is malformed');
    } else {
      Object.entries(mountSpec.planes).forEach(([key, value]) => {
        if (key === 'focus') {
          focus = parseFocus(value);
          if (!focus) {
            issues.push('focus plane is malformed');
          }
          return;
        }

        const plane = parsePlane(key, value);
        if (!plane) {
          issues.push(`plane ${key} is malformed`);
          return;
        }
        planes[key] = plane;
      });
    }
  }

  return {
    status: issues.length === 0 ? 'verified' : 'unverified',
    ports,
    planes,
    focus,
    issues,
  };
}

function reverseFacing(facing: Facing | undefined): Facing | undefined {
  if (facing === '+') {
    return '-';
  }
  if (facing === '-') {
    return '+';
  }
  return undefined;
}

function flipMountSpec(mountSpec: ParsedMountSpec): ParsedMountSpec {
  const ports: Record<string, MountPort> = {};
  const planes: Record<string, MountPlane> = {};

  Object.entries(mountSpec.ports).forEach(([key, port]) => {
    ports[key] = {
      ...port,
      z_mm: port.z_mm === undefined ? undefined : -port.z_mm,
      facing: reverseFacing(port.facing),
    };
  });

  Object.entries(mountSpec.planes).forEach(([key, plane]) => {
    planes[key] = { ...plane, z_mm: -plane.z_mm };
  });

  return {
    ...mountSpec,
    ports,
    planes,
    focus: mountSpec.focus
      ? {
          min_mm: -mountSpec.focus.max_mm,
          max_mm: -mountSpec.focus.min_mm,
        }
      : undefined,
    issues: [...mountSpec.issues],
  };
}

export default flipMountSpec;

export function evaluateMountSpec(
  mountSpec: unknown,
  flipped = false,
): ParsedMountSpec {
  const parsed = parseMountSpec(mountSpec);
  return flipped ? flipMountSpec(parsed) : parsed;
}
