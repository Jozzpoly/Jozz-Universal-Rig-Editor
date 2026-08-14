import type { TransformTarget } from '../../editor/transform-target.js';
import type { RigCommand } from '../../editor/session.js';
import { normalizeQuat } from '../../kernel/math.js';
import type { RigidPose, RigDocument, RigId } from '../../kernel/types.js';

function cloneNormalizedPose(pose: RigidPose): RigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

export function setElementPose(elementId: RigId, pose: RigidPose): RigCommand {
  return {
    label: `Set element pose: ${elementId}`,
    apply(document: RigDocument): RigDocument {
      let found = false;
      const elements = document.elements.map((element) => {
        if (element.id !== elementId) return element;
        found = true;
        return { ...element, pose: cloneNormalizedPose(pose) };
      });
      if (!found) throw new Error(`Element ${elementId} not found.`);
      return { ...document, elements };
    },
  };
}

export function setFramePose(frameId: RigId, pose: RigidPose): RigCommand {
  return {
    label: `Set frame pose: ${frameId}`,
    apply(document: RigDocument): RigDocument {
      let found = false;
      const frames = document.frames.map((frame) => {
        if (frame.id !== frameId) return frame;
        found = true;
        return {
          ...frame,
          pose: cloneNormalizedPose(pose),
          provenance: { ...frame.provenance, kind: 'owner-authored' as const },
        };
      });
      if (!found) throw new Error(`Frame ${frameId} not found.`);
      return { ...document, frames };
    },
  };
}

export function setTransformTargetPose(target: TransformTarget, pose: RigidPose): RigCommand {
  return target.kind === 'element'
    ? setElementPose(target.id, pose)
    : setFramePose(target.id, pose);
}
