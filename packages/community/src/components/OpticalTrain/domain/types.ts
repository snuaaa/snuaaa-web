export type Facing = '+' | '-';

export type JoinPredicate = 'kind' | 'std' | 'sex' | 'facing' | 'separation';

export type JoinStatus = 'compatible' | 'incompatible' | 'unverified';

export type TrainStatus =
  | 'compatible'
  | 'incompatible'
  | 'unverified'
  | 'incomplete';

export type GeometryStatus = 'known' | 'unknown';

export type ReachabilityStatus = 'reachable' | 'out_of_range' | 'unknown';

export interface MountPort {
  key: string;
  z_mm: number;
  facing: Facing;
  kind?: string;
  std?: string;
  sex: 'm' | 'f';
  engage_mm?: number;
}

export interface MountPlane {
  key: string;
  z_mm: number;
}

export interface FocusRange {
  min_mm: number;
  max_mm: number;
}

export interface ParsedMountSpec {
  status: 'verified' | 'unverified';
  ports: Readonly<Record<string, MountPort>>;
  planes: Readonly<Record<string, MountPlane>>;
  focus?: FocusRange;
  issues: readonly string[];
}

export interface PortJoinEvaluation {
  status: JoinStatus;
  failedPredicates: readonly JoinPredicate[];
  leftPort?: MountPort;
  rightPort?: MountPort;
  separation_mm?: number;
}

export interface PortPairEvaluation extends PortJoinEvaluation {
  leftPortKey: string;
  rightPortKey: string;
}

export interface LinearTrainItem {
  id: string;
  mountSpec: unknown;
  flipped?: boolean;
  incomingPortKey?: string;
  outgoingPortKey?: string;
  terminalPlaneKey?: string;
}

export interface EvaluatedTrainItem {
  id: string;
  mountSpec: ParsedMountSpec;
  origin_mm?: number;
  ports: Readonly<Record<string, MountPort>>;
  planes: Readonly<Record<string, MountPlane>>;
  focus?: FocusRange;
}

export interface EvaluatedJoin extends PortJoinEvaluation {
  key: string;
  leftItemId: string;
  rightItemId: string;
  leftPortKey?: string;
  rightPortKey?: string;
  leftDatum_mm?: number;
  rightDatum_mm?: number;
}

export type EvaluatedFocusRange = FocusRange;

export type EvaluatedPlane = MountPlane;

export interface LinearTrainEvaluation {
  status: TrainStatus;
  geometryStatus: GeometryStatus;
  items: readonly EvaluatedTrainItem[];
  joins: readonly EvaluatedJoin[];
  focus?: EvaluatedFocusRange;
  terminal?: EvaluatedPlane;
  terminalReachability: ReachabilityStatus;
}
