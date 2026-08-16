import { normalizeQuat, rotateVec3 } from '../kernel/math.js';
import type { Quat, RigidPose, Vec3 } from '../kernel/types.js';

const LENGTH_EPSILON = 1e-10;

export interface SourcePointReference {
  locator: string;
  position: Vec3;
}

export interface SourceDirectionSpanReference {
  startLocator: string;
  start: Vec3;
  endLocator: string;
  end: Vec3;
}

export interface SourceDerivedFrameDatum {
  locator: string;
  name: string;
  sourceRevisionWorldPose: RigidPose;
  basis: {
    x: Vec3;
    y: Vec3;
    z: Vec3;
  };
  derivation: {
    algorithm: 'orthogonal-cross-axis-frame-v1';
    originLocator: string;
    radialEndpointLocator: string;
    upStartLocator: string;
    upEndLocator: string;
    orthogonalityError: number;
  };
}

function finiteVec3(value: Vec3, label: string): Vec3 {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must contain finite coordinates.`);
  return { x: value.x, y: value.y, z: value.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(value: Vec3, label: string): Vec3 {
  const length = Math.hypot(value.x, value.y, value.z);
  if (!Number.isFinite(length) || length <= LENGTH_EPSILON) throw new Error(`${label} must have finite non-zero length.`);
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function quatFromBasisColumns(x: Vec3, y: Vec3, z: Vec3): Quat {
  // Rotation matrix columns are the world directions of local +X/+Y/+Z.
  const m00 = x.x; const m01 = y.x; const m02 = z.x;
  const m10 = x.y; const m11 = y.y; const m12 = z.y;
  const m20 = x.z; const m21 = y.z; const m22 = z.z;
  const trace = m00 + m11 + m22;
  let q: Quat;
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    q = { x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s, w: 0.25 * s };
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    q = { x: 0.25 * s, y: (m01 + m10) / s, z: (m02 + m20) / s, w: (m21 - m12) / s };
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    q = { x: (m01 + m10) / s, y: 0.25 * s, z: (m12 + m21) / s, w: (m02 - m20) / s };
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    q = { x: (m02 + m20) / s, y: (m12 + m21) / s, z: 0.25 * s, w: (m10 - m01) / s };
  }
  return normalizeQuat(q);
}

function maxBasisError(rotation: Quat, x: Vec3, y: Vec3, z: Vec3): number {
  const actual = [
    rotateVec3(rotation, { x: 1, y: 0, z: 0 }),
    rotateVec3(rotation, { x: 0, y: 1, z: 0 }),
    rotateVec3(rotation, { x: 0, y: 0, z: 1 }),
  ];
  const expected = [x, y, z];
  return Math.max(...actual.flatMap((axis, index) => [
    Math.abs(axis.x - expected[index].x),
    Math.abs(axis.y - expected[index].y),
    Math.abs(axis.z - expected[index].z),
  ]));
}

/**
 * Construct a deterministic right-handed rigid frame from evidence that gives:
 * - an origin point,
 * - a radial/axial direction from origin to another point,
 * - an independent up direction from an exact span.
 *
 * The two input directions must already be orthogonal. Local +Y follows the up
 * span and local +Z is cross(up, radial). Local +X completes the basis as Y×Z.
 */
export function deriveOrthogonalCrossAxisFrame(input: {
  locator: string;
  name: string;
  origin: SourcePointReference;
  radialEndpoint: SourcePointReference;
  up: SourceDirectionSpanReference;
  orthogonalityTolerance?: number;
}): SourceDerivedFrameDatum {
  if (!input.locator.trim() || !input.name.trim()) throw new Error('Construction frame locator and name must be non-empty.');
  if (![input.origin.locator, input.radialEndpoint.locator, input.up.startLocator, input.up.endLocator].every((value) => value.trim().length > 0)) {
    throw new Error('Construction frame provenance locators must be non-empty.');
  }
  const tolerance = input.orthogonalityTolerance ?? 1e-6;
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance >= 1) throw new Error('Construction frame orthogonality tolerance must be finite in [0,1).');

  const origin = finiteVec3(input.origin.position, 'construction origin');
  const radialEndpoint = finiteVec3(input.radialEndpoint.position, 'construction radial endpoint');
  const upStart = finiteVec3(input.up.start, 'construction up start');
  const upEnd = finiteVec3(input.up.end, 'construction up end');
  const radial = normalize(subtract(radialEndpoint, origin), 'construction radial direction');
  const y = normalize(subtract(upEnd, upStart), 'construction up direction');
  const orthogonalityError = Math.abs(dot(radial, y));
  if (orthogonalityError > tolerance) {
    throw new Error(`Construction radial/up directions are not orthogonal: |dot|=${orthogonalityError}.`);
  }

  const z = normalize(cross(y, radial), 'construction cross/primary axis');
  const x = normalize(cross(y, z), 'construction completed X axis');
  const handedness = dot(cross(x, y), z);
  if (handedness < 1 - 1e-9) throw new Error(`Construction frame basis is not right-handed: determinant=${handedness}.`);
  const rotation = quatFromBasisColumns(x, y, z);
  const basisError = maxBasisError(rotation, x, y, z);
  if (basisError > 1e-9) throw new Error(`Construction frame quaternion does not reproduce its basis: error=${basisError}.`);

  return {
    locator: input.locator.trim(),
    name: input.name.trim(),
    sourceRevisionWorldPose: { position: origin, rotation },
    basis: { x, y, z },
    derivation: {
      algorithm: 'orthogonal-cross-axis-frame-v1',
      originLocator: input.origin.locator,
      radialEndpointLocator: input.radialEndpoint.locator,
      upStartLocator: input.up.startLocator,
      upEndLocator: input.up.endLocator,
      orthogonalityError,
    },
  };
}
