import type { MapVec3 } from '../../map/types.js';

function finiteVec3(value: MapVec3, label: string): MapVec3 {
  if (![value.x, value.y, value.z].every(Number.isFinite)) {
    throw new Error(`${label} must contain finite components.`);
  }
  return value;
}

function normalized(value: MapVec3, label: string): MapVec3 {
  finiteVec3(value, label);
  const length = Math.hypot(value.x, value.y, value.z);
  if (!Number.isFinite(length) || length <= 1e-12) {
    throw new Error(`${label} must have finite non-zero length.`);
  }
  return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function subtract(a: MapVec3, b: MapVec3): MapVec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: MapVec3, b: MapVec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Returns the parameter `s` of the point `axisOrigin + axisDirection * s`
 * closest to an infinite pointer ray line. The ray's forward constraint is not
 * used because only the change in `s` between pointer samples is consumed by
 * the resize interaction.
 *
 * `null` means the view ray and resize axis are too close to parallel for a
 * stable spatial drag. The renderer should suppress/disable that handle rather
 * than inventing an arbitrary screen-space mapping.
 */
export function closestAxisParameterToRay(
  axisOrigin: MapVec3,
  axisDirection: MapVec3,
  rayOrigin: MapVec3,
  rayDirection: MapVec3,
  parallelEpsilon = 1e-5,
): number | null {
  finiteVec3(axisOrigin, 'Resize axis origin');
  finiteVec3(rayOrigin, 'Pointer ray origin');
  if (!Number.isFinite(parallelEpsilon) || parallelEpsilon <= 0 || parallelEpsilon >= 1) {
    throw new Error('Resize axis parallel epsilon must be finite and between 0 and 1.');
  }

  const axis = normalized(axisDirection, 'Resize axis direction');
  const ray = normalized(rayDirection, 'Pointer ray direction');
  const originDelta = subtract(axisOrigin, rayOrigin);
  const alignment = dot(axis, ray);
  const denominator = 1 - alignment * alignment;
  if (denominator <= parallelEpsilon) return null;

  const axisOriginProjection = dot(axis, originDelta);
  const rayOriginProjection = dot(ray, originDelta);
  return (alignment * rayOriginProjection - axisOriginProjection) / denominator;
}
