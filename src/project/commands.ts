import type { RigCommand } from '../editor/session.js';
import { normalizeQuat } from '../kernel/math.js';
import type { RigidPose } from '../kernel/types.js';
import type { JureProjectCommand } from './session.js';

function cloneNormalizedPose(pose: RigidPose): RigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

function samePose(a: RigidPose, b: RigidPose): boolean {
  return a.position.x === b.position.x
    && a.position.y === b.position.y
    && a.position.z === b.position.z
    && a.rotation.x === b.rotation.x
    && a.rotation.y === b.rotation.y
    && a.rotation.z === b.rotation.z
    && a.rotation.w === b.rotation.w;
}

export function setSourceInstancePose(sourceInstanceId: string, pose: RigidPose): JureProjectCommand {
  const nextPose = cloneNormalizedPose(pose);
  return {
    label: `Set SOURCE instance pose: ${sourceInstanceId}`,
    apply(project) {
      let found = false;
      let changed = false;
      const sourceInstances = project.sourceInstances.map((instance) => {
        if (instance.id !== sourceInstanceId) return instance;
        found = true;
        if (samePose(instance.pose, nextPose)) return instance;
        changed = true;
        return { ...instance, pose: cloneNormalizedPose(nextPose) };
      });
      if (!found) throw new Error(`SourceInstance ${sourceInstanceId} not found.`);
      return changed ? { ...project, sourceInstances } : project;
    },
  };
}

export function applyRigCommandToProject(rigDocumentId: string, rigCommand: RigCommand): JureProjectCommand {
  return {
    label: rigCommand.label,
    apply(project) {
      let found = false;
      let changed = false;
      const authoredDocuments = project.authoredDocuments.map((entry) => {
        if (entry.kind !== 'rig' || entry.document.documentId !== rigDocumentId) return entry;
        found = true;
        const nextDocument = rigCommand.apply(entry.document);
        if (nextDocument === entry.document) return entry;
        changed = true;
        return {
          kind: 'rig' as const,
          document: {
            ...nextDocument,
            revision: entry.document.revision + 1,
          },
        };
      });
      if (!found) throw new Error(`RigDocument ${rigDocumentId} not found in project.`);
      return changed ? { ...project, authoredDocuments } : project;
    },
  };
}
