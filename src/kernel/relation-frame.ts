import { rotateVec3 } from './math.js';
import type { RigidPose, Vec3 } from './types.js';

export const RELATION_PRIMARY_AXIS_LOCAL: Readonly<Vec3> = Object.freeze({ x: 0, y: 0, z: 1 });

export function relationPrimaryAxisWorld(frameWorldPose: RigidPose): Vec3 {
  return rotateVec3(frameWorldPose.rotation, RELATION_PRIMARY_AXIS_LOCAL);
}
