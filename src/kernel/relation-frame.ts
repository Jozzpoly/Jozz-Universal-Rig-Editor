import { distance, rotateVec3 } from './math.js';
import type { RigidPose, Vec3 } from './types.js';

export const RELATION_PRIMARY_AXIS_LOCAL: Readonly<Vec3> = Object.freeze({ x: 0, y: 0, z: 1 });

export interface RevoluteFrameResidual {
  originResidualM: number;
  axisDot: number;
  axisAngleRad: number;
  axisAWorld: Vec3;
  axisBWorld: Vec3;
}

export function relationPrimaryAxisWorld(frameWorldPose: RigidPose): Vec3 {
  return rotateVec3(frameWorldPose.rotation, RELATION_PRIMARY_AXIS_LOCAL);
}

/**
 * Measure neutral revolute geometry without solving, projecting or mutating
 * authored truth. Local +Z is a signed primary axis, so anti-parallel axes
 * intentionally report pi radians rather than being treated as equivalent.
 */
export function measureRevoluteFrameResidual(frameAWorldPose: RigidPose, frameBWorldPose: RigidPose): RevoluteFrameResidual {
  const axisAWorld = relationPrimaryAxisWorld(frameAWorldPose);
  const axisBWorld = relationPrimaryAxisWorld(frameBWorldPose);
  const rawDot = axisAWorld.x * axisBWorld.x + axisAWorld.y * axisBWorld.y + axisAWorld.z * axisBWorld.z;
  const axisDot = Math.max(-1, Math.min(1, rawDot));
  return {
    originResidualM: distance(frameAWorldPose.position, frameBWorldPose.position),
    axisDot,
    axisAngleRad: Math.acos(axisDot),
    axisAWorld,
    axisBWorld,
  };
}
