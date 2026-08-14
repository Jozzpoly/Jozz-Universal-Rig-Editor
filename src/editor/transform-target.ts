import { relativePose } from '../kernel/math.js';
import type { RigidPose, RigDocument, RigId } from '../kernel/types.js';

export type TransformTargetKind = 'element' | 'frame';

export interface TransformTarget {
  kind: TransformTargetKind;
  id: RigId;
}

export function worldPoseToAuthoredPose(
  document: RigDocument,
  target: TransformTarget,
  worldPose: RigidPose,
): RigidPose {
  if (target.kind === 'element') {
    const element = document.elements.find((entry) => entry.id === target.id);
    if (!element) throw new Error(`Element ${target.id} not found.`);
    return worldPose;
  }

  const frame = document.frames.find((entry) => entry.id === target.id);
  if (!frame) throw new Error(`Frame ${target.id} not found.`);
  if (!frame.ownerElementId) return worldPose;

  const owner = document.elements.find((entry) => entry.id === frame.ownerElementId);
  if (!owner) throw new Error(`Owner ${frame.ownerElementId} not found.`);
  return relativePose(owner.pose, worldPose);
}
