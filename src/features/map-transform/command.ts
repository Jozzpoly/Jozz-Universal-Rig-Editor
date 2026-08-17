import type { EditorCommand } from '../../editor/session.js';
import type { MapDocument, MapQuat, MapRigidPose } from '../../map/types.js';

function normalizeQuat(quaternion: MapQuat): MapQuat {
  const length = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  if (!Number.isFinite(length) || length <= 1e-12) throw new Error('Map entity rotation quaternion must have finite non-zero length.');
  return {
    x: quaternion.x / length,
    y: quaternion.y / length,
    z: quaternion.z / length,
    w: quaternion.w / length,
  };
}

function cloneNormalizedPose(pose: MapRigidPose): MapRigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

export function setMapEntityPose(entityId: string, pose: MapRigidPose): EditorCommand<MapDocument> {
  return {
    label: `Set map entity pose: ${entityId}`,
    apply(document: MapDocument): MapDocument {
      let found = false;
      const entities = document.entities.map((entity) => {
        if (entity.id !== entityId) return entity;
        found = true;
        return { ...entity, pose: cloneNormalizedPose(pose) };
      });
      if (!found) throw new Error(`Map entity ${entityId} not found.`);
      return { ...document, entities };
    },
  };
}
