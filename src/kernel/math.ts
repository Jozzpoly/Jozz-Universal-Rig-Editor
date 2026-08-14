import type { Quat, RigidPose, Vec3 } from './types.js';

export const IDENTITY_POSE: RigidPose = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
};

export function vec3(x = 0, y = 0, z = 0): Vec3 { return { x, y, z }; }
export function quat(x = 0, y = 0, z = 0, w = 1): Quat { return normalizeQuat({ x, y, z, w }); }

export function normalizeQuat(q: Quat): Quat {
  const length = Math.hypot(q.x, q.y, q.z, q.w);
  if (!Number.isFinite(length) || length <= 1e-12) throw new Error('Quaternion must have finite non-zero length.');
  return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
}

export function multiplyQuat(a: Quat, b: Quat): Quat {
  return normalizeQuat({
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  });
}

export function rotateVec3(q: Quat, v: Vec3): Vec3 {
  const ix = q.w * v.x + q.y * v.z - q.z * v.y;
  const iy = q.w * v.y + q.z * v.x - q.x * v.z;
  const iz = q.w * v.z + q.x * v.y - q.y * v.x;
  const iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  return {
    x: ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    y: iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    z: iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
  };
}

export function composePose(parent: RigidPose, local: RigidPose): RigidPose {
  const p = rotateVec3(parent.rotation, local.position);
  return {
    position: { x: parent.position.x + p.x, y: parent.position.y + p.y, z: parent.position.z + p.z },
    rotation: multiplyQuat(parent.rotation, local.rotation),
  };
}

export function invertQuat(q: Quat): Quat { return normalizeQuat({ x: -q.x, y: -q.y, z: -q.z, w: q.w }); }

export function inverseTransformPoint(pose: RigidPose, worldPoint: Vec3): Vec3 {
  return rotateVec3(invertQuat(pose.rotation), {
    x: worldPoint.x - pose.position.x,
    y: worldPoint.y - pose.position.y,
    z: worldPoint.z - pose.position.z,
  });
}

export function relativePose(parent: RigidPose, world: RigidPose): RigidPose {
  const inv = invertQuat(parent.rotation);
  return {
    position: inverseTransformPoint(parent, world.position),
    rotation: multiplyQuat(inv, world.rotation),
  };
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
