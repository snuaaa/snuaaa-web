import type { MountPort } from './domain/types';

export type StandardProfileKind = 'thread' | 'slip' | 'bayonet' | 'unknown';

export type StandardProfile = {
  nominalDiameterMm: number;
  kind: Exclude<StandardProfileKind, 'unknown'>;
  flangeFocalDistanceMm?: number;
};

const SLIP_DIAMETERS_MM: Readonly<Record<string, number>> = {
  '1.25in': 31.75,
  '2in': 50.8,
};

const normalizeStandard = (standard: string) =>
  standard.trim().toLowerCase().replace(/\s+/, '-').replace(/-+/, '-');

const BAYONET_PROFILES: Readonly<Record<string, StandardProfile>> = {
  'sony-e': {
    nominalDiameterMm: 46.1,
    kind: 'bayonet',
    flangeFocalDistanceMm: 18,
  },
  'canon-ef': {
    nominalDiameterMm: 54,
    kind: 'bayonet',
    flangeFocalDistanceMm: 44,
  },
  'canon-rf': {
    nominalDiameterMm: 54,
    kind: 'bayonet',
    flangeFocalDistanceMm: 20,
  },
  'nikon-f': {
    nominalDiameterMm: 44,
    kind: 'bayonet',
    flangeFocalDistanceMm: 46.5,
  },
};

/**
 * Provides nominal interface-only geometry, not manufacturing dimensions.
 * Body axial spans continue to come exclusively from evaluated port z values.
 */
export const standardProfileFor = (
  port: MountPort,
): StandardProfile | undefined => {
  if (!port.std) return undefined;

  const standard = normalizeStandard(port.std);
  const bayonetProfile = BAYONET_PROFILES[standard];
  if (bayonetProfile) return bayonetProfile;

  const metricThread = /^m(\d+(?:\.\d+)?)$/.exec(standard);
  if (port.kind === 'thread' && metricThread) {
    return { nominalDiameterMm: Number(metricThread[1]), kind: 'thread' };
  }

  const slipDiameter = SLIP_DIAMETERS_MM[standard];
  if (port.kind === 'slip' && slipDiameter) {
    return { nominalDiameterMm: slipDiameter, kind: 'slip' };
  }

  return undefined;
};
