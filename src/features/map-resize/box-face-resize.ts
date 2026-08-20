import type { EditorCommand } from '../../editor/session.js';
import type { MapDocument, MapQuat, MapRigidPose, MapVec3 } from '../../map/types.js';
import { setMapEntityPose } from '../map-transform/command.js';
import { MAP_BOX_MIN_HALF_EXTENT, setMapBoxHalfExtents } from './box-resize.js';

export type MapAxis = 'x' | 'y' | 'z';
export type MapFaceSide = -1 | 1;
export type MapBoxResizeOrigin = 'opposite-face' | 'center';

export interface MapBoxFaceFrame {
  center: MapVec3;
  outwardNormal: MapVec3;
}

export interface MapBoxFaceResizeResult {
  pose: MapRigidPose;
  halfExtents: MapVec3;
}

function assertFiniteVec3(value: MapVec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) {
    throw new Error(`${label} must contain finite components.`);
  }
}

function assertPositiveHalfExtents(value: MapVec3): void {
  assertFiniteVec3(value, 'Map box halfExtents');
  if (![value.x, value.y, value.z].every((component) => component > 0)) {
    throw new Error('Map box halfExtents must contain finite positive components.');
  }
}

function assertAxis(axis: MapAxis): void {
  if (axis !== 'x' && axis !== 'y' && axis !== 'z') {
    throw new Error(`Unsupported map box resize axis: ${String(axis)}.`);
  }
}

function assertSide(side: MapFaceSide): void {
  if (side !== -1 && side !== 1) {
    throw new Error(`Map box face side must be -1 or 1, received ${String(side)}.`);
  }
}

function normalizedQuaternion(rotation: MapQuat): MapQuat {
  const components = [rotation.x, rotation.y, rotation.z, rotation.w];
  if (!components.every(Number.isFinite)) {
    throw new Error('Map box pose rotation must contain finite components.');
  }
  const length = Math.hypot(rotation.x, rotation.y, rotation.z, rotation.w);
  if (!Number.isFinite(length) || length <= 1e-12) {
    throw new Error('Map box pose rotation must have finite non-zero length.');
  }
  return {
    x: rotation.x / length,
    y: rotation.y / length,
    z: rotation.z / length,
    w: rotation.w / length,
  };
}

function localAxisVector(axis: MapAxis): MapVec3 {
  assertAxis(axis);
  if (axis === 'x') return { x: 1, y: 0, z: 0 };
  if (axis === 'y') return { x: 0, y: 1, z: 0 };
  return { x: 0, y: 0, z: 1 };
}

function rotateVectorByQuaternion(vector: MapVec3, rotation: MapQuat): MapVec3 {
  const q = normalizedQuaternion(rotation);
  const ix = q.w * vector.x + q.y * vector.z - q.z * vector.y;
  const iy = q.w * vector.y + q.z * vector.x - q.x * vector.z;
  const iz = q.w * vector.z + q.x * vector.y - q.y * vector.x;
  const iw = -q.x * vector.x - q.y * vector.y - q.z * vector.z;

  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  };
}

function axisHalfExtent(halfExtents: MapVec3, axis: MapAxis): number {
  assertAxis(axis);
  return halfExtents[axis];
}

function withAxisHalfExtent(halfExtents: MapVec3, axis: MapAxis, value: number): MapVec3 {
  return { ...halfExtents, [axis]: value };
}

function addScaled(vector: MapVec3, direction: MapVec3, distance: number): MapVec3 {
  return {
    x: vector.x + direction.x * distance,
    y: vector.y + direction.y * distance,
    z: vector.z + direction.z * distance,
  };
}

/**
 * Returns the authored box face center and outward normal in world coordinates.
 * The face identity is explicit (`axis` + signed side) so later resize handles do
 * not have to infer +X/-X from renderer scale state.
 */
export function mapBoxFaceFrame(
  pose: MapRigidPose,
  halfExtents: MapVec3,
  axis: MapAxis,
  side: MapFaceSide,
): MapBoxFaceFrame {
  assertFiniteVec3(pose.position, 'Map box pose position');
  assertPositiveHalfExtents(halfExtents);
  assertSide(side);

  const worldAxis = rotateVectorByQuaternion(localAxisVector(axis), pose.rotation);
  const outwardNormal = {
    x: worldAxis.x * side,
    y: worldAxis.y * side,
    z: worldAxis.z * side,
  };
  const center = addScaled(pose.position, outwardNormal, axisHalfExtent(halfExtents, axis));
  return { center, outwardNormal };
}

/**
 * Plans one signed box-face resize from an authored baseline.
 *
 * `outwardDelta` is measured along the selected face's outward normal:
 * positive expands, negative contracts.
 *
 * `opposite-face` is the intended default map-authoring behavior: the opposite
 * face stays fixed and the rigid pose center moves by half of the effective
 * dimension change. `center` is the modifier behavior (planned for Alt): the
 * rigid pose stays fixed and the opposite face mirrors the dragged face.
 */
export function planMapBoxFaceResize(
  sourcePose: MapRigidPose,
  sourceHalfExtents: MapVec3,
  axis: MapAxis,
  side: MapFaceSide,
  outwardDelta: number,
  origin: MapBoxResizeOrigin = 'opposite-face',
): MapBoxFaceResizeResult {
  assertFiniteVec3(sourcePose.position, 'Map box pose position');
  assertPositiveHalfExtents(sourceHalfExtents);
  assertAxis(axis);
  assertSide(side);
  normalizedQuaternion(sourcePose.rotation);

  if (!Number.isFinite(outwardDelta)) {
    throw new Error('Map box face resize delta must be finite.');
  }
  if (origin !== 'opposite-face' && origin !== 'center') {
    throw new Error(`Unsupported map box resize origin: ${String(origin)}.`);
  }

  const sourceHalf = axisHalfExtent(sourceHalfExtents, axis);

  if (origin === 'center') {
    const nextHalf = Math.max(sourceHalf + outwardDelta, MAP_BOX_MIN_HALF_EXTENT);
    return {
      pose: {
        position: { ...sourcePose.position },
        rotation: { ...sourcePose.rotation },
      },
      halfExtents: withAxisHalfExtent(sourceHalfExtents, axis, nextHalf),
    };
  }

  const sourceFull = sourceHalf * 2;
  const nextFull = Math.max(sourceFull + outwardDelta, MAP_BOX_MIN_HALF_EXTENT * 2);
  const nextHalf = nextFull * 0.5;
  const effectiveFullDelta = nextFull - sourceFull;
  const worldAxis = rotateVectorByQuaternion(localAxisVector(axis), sourcePose.rotation);
  const centerShift = side * effectiveFullDelta * 0.5;

  return {
    pose: {
      position: addScaled(sourcePose.position, worldAxis, centerShift),
      rotation: { ...sourcePose.rotation },
    },
    halfExtents: withAxisHalfExtent(sourceHalfExtents, axis, nextHalf),
  };
}

/**
 * Commits the coupled pose + geometry result as one editor command. This is
 * intentionally atomic because EditorSession preview updates always re-apply one
 * command to the frozen preview baseline.
 */
export function setMapBoxFaceResizeResult(
  entityId: string,
  result: MapBoxFaceResizeResult,
): EditorCommand<MapDocument> {
  const poseCommand = setMapEntityPose(entityId, result.pose);
  const geometryCommand = setMapBoxHalfExtents(entityId, result.halfExtents);

  return {
    label: `Resize map box face: ${entityId}`,
    apply(document: MapDocument): MapDocument {
      return geometryCommand.apply(poseCommand.apply(document));
    },
  };
}
