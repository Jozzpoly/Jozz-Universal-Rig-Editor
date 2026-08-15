import type { RigCommand } from '../editor/session.js';
import { normalizeQuat } from '../kernel/math.js';
import type { RigidPose } from '../kernel/types.js';
import type { JureProjectCommand } from './session.js';
import type { JureProjectModel, SourceInstance } from './types.js';

function cloneNormalizedPose(pose: RigidPose): RigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

function cloneSourceInstance(instance: SourceInstance): SourceInstance {
  return {
    id: instance.id,
    name: instance.name,
    sourceRevisionId: instance.sourceRevisionId,
    pose: cloneNormalizedPose(instance.pose),
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

function projectHasTopLevelId(project: JureProjectModel, id: string): boolean {
  return project.sourceRevisions.some((source) => source.id === id)
    || project.sourceInstances.some((instance) => instance.id === id)
    || project.consumerReferences.some((reference) => reference.id === id)
    || project.sourceAdoptions.some((adoption) => adoption.id === id)
    || project.authoredDocuments.some((authored) => authored.document.documentId === id);
}

function representationUsesSourceInstance(project: JureProjectModel, sourceInstanceId: string): boolean {
  return project.authoredDocuments.some((authored) => authored.kind === 'rig-representation'
    && authored.document.bindings.some((binding) => binding.target.sourceInstanceId === sourceInstanceId));
}

export function addSourceInstance(instance: SourceInstance): JureProjectCommand {
  const snapshot = cloneSourceInstance(instance);
  return {
    label: `Add SOURCE instance: ${snapshot.id}`,
    apply(project) {
      if (projectHasTopLevelId(project, snapshot.id)) throw new Error(`Project ID ${snapshot.id} is already in use.`);
      if (!project.sourceRevisions.some((source) => source.id === snapshot.sourceRevisionId)) throw new Error(`SourceRevision ${snapshot.sourceRevisionId} not found.`);
      return { ...project, sourceInstances: [...project.sourceInstances, cloneSourceInstance(snapshot)] };
    },
  };
}

export function removeSourceInstance(sourceInstanceId: string): JureProjectCommand {
  return {
    label: `Remove SOURCE instance: ${sourceInstanceId}`,
    apply(project) {
      if (!project.sourceInstances.some((instance) => instance.id === sourceInstanceId)) throw new Error(`SourceInstance ${sourceInstanceId} not found.`);
      if (representationUsesSourceInstance(project, sourceInstanceId)) throw new Error(`Cannot remove SourceInstance ${sourceInstanceId} while authored representation bindings reference it. Rebind or remove those bindings explicitly first.`);
      return { ...project, sourceInstances: project.sourceInstances.filter((instance) => instance.id !== sourceInstanceId) };
    },
  };
}

export function setSourceInstanceRevision(sourceInstanceId: string, sourceRevisionId: string): JureProjectCommand {
  return {
    label: `Set SOURCE instance revision: ${sourceInstanceId} -> ${sourceRevisionId}`,
    apply(project) {
      if (!project.sourceRevisions.some((source) => source.id === sourceRevisionId)) throw new Error(`SourceRevision ${sourceRevisionId} not found.`);
      const current = project.sourceInstances.find((instance) => instance.id === sourceInstanceId);
      if (!current) throw new Error(`SourceInstance ${sourceInstanceId} not found.`);
      if (current.sourceRevisionId === sourceRevisionId) return project;
      if (representationUsesSourceInstance(project, sourceInstanceId)) throw new Error(`Cannot re-register SourceInstance ${sourceInstanceId} while authored representation bindings reference its exact revision. Rebind explicitly first.`);
      return {
        ...project,
        sourceInstances: project.sourceInstances.map((instance) => instance.id === sourceInstanceId
          ? { ...instance, sourceRevisionId }
          : instance),
      };
    },
  };
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
