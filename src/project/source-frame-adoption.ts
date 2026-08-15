import { composePose, normalizeQuat, relativePose } from '../kernel/math.js';
import type { RigidPose, RigFrame, SourceRevision } from '../kernel/types.js';
import type { SourceNodeInspection } from '../source/types.js';
import { createSourceAdoptionRecord } from './source-adoption.js';
import type { JureProjectCommand } from './session.js';

export interface AdoptSourceDatumAsFrameInput {
  rigDocumentId: string;
  frameId: string;
  frameName: string;
  ownerElementId: string | null;
  adoptionId: string;
  sourceInstanceId: string;
  sourceRevisionId: string;
  sourceNode: SourceNodeInspection;
}

function cloneNormalizedPose(pose: RigidPose): RigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

function sameExactSourceRevision(a: SourceRevision, b: SourceRevision): boolean {
  return a.id === b.id
    && a.sha256.toLowerCase() === b.sha256.toLowerCase()
    && a.adapter.id === b.adapter.id
    && a.adapter.version === b.adapter.version;
}

export function adoptSourceDatumAsFrame(input: AdoptSourceDatumAsFrameInput): JureProjectCommand {
  if (input.sourceNode.rigidCompatibility !== 'rigid' || !input.sourceNode.worldRigidPose) throw new Error(`SOURCE datum ${input.sourceNode.locator} is not rigid-compatible and cannot be adopted as a RigFrame.`);
  if (input.sourceNode.locator.trim().length === 0) throw new Error('SOURCE datum locator must be non-empty.');
  const sourceDatumRevisionWorldPose = cloneNormalizedPose(input.sourceNode.worldRigidPose);
  const locator = input.sourceNode.locator;

  return {
    label: `Adopt SOURCE datum as frame: ${input.frameId}`,
    apply(project) {
      if (project.sourceAdoptions.some((adoption) => adoption.id === input.adoptionId)
        || project.sourceRevisions.some((source) => source.id === input.adoptionId)
        || project.sourceInstances.some((instance) => instance.id === input.adoptionId)
        || project.consumerReferences.some((reference) => reference.id === input.adoptionId)
        || project.authoredDocuments.some((authored) => authored.document.documentId === input.adoptionId)) {
        throw new Error(`Project ID ${input.adoptionId} is already in use.`);
      }

      const sourceRevision = project.sourceRevisions.find((source) => source.id === input.sourceRevisionId);
      if (!sourceRevision) throw new Error(`SourceRevision ${input.sourceRevisionId} not found in project.`);
      const sourceInstance = project.sourceInstances.find((instance) => instance.id === input.sourceInstanceId);
      if (!sourceInstance) throw new Error(`SourceInstance ${input.sourceInstanceId} not found in project.`);
      if (sourceInstance.sourceRevisionId !== input.sourceRevisionId) throw new Error(`SourceInstance ${input.sourceInstanceId} no longer uses exact revision ${input.sourceRevisionId}. Re-select the SOURCE datum.`);

      let targetRigFound = false;
      let adoptedFrame: RigFrame | null = null;
      const authoredDocuments = project.authoredDocuments.map((authored) => {
        if (authored.kind !== 'rig' || authored.document.documentId !== input.rigDocumentId) return authored;
        targetRigFound = true;
        if (authored.document.frames.some((frame) => frame.id === input.frameId)
          || authored.document.elements.some((element) => element.id === input.frameId)
          || authored.document.relations.some((relation) => relation.id === input.frameId)) {
          throw new Error(`Rig ID ${input.frameId} is already in use in ${input.rigDocumentId}.`);
        }

        const ownerElement = input.ownerElementId === null
          ? null
          : authored.document.elements.find((element) => element.id === input.ownerElementId) ?? null;
        if (input.ownerElementId !== null && !ownerElement) throw new Error(`Owner element ${input.ownerElementId} not found in ${input.rigDocumentId}.`);

        const sourceDatumProjectWorldPose = composePose(sourceInstance.pose, sourceDatumRevisionWorldPose);
        const authoredPose = ownerElement
          ? relativePose(ownerElement.pose, sourceDatumProjectWorldPose)
          : sourceDatumProjectWorldPose;

        adoptedFrame = {
          id: input.frameId,
          name: input.frameName,
          ownerElementId: input.ownerElementId,
          pose: cloneNormalizedPose(authoredPose),
          source: { sourceRevisionId: sourceRevision.id, locator },
          provenance: { kind: 'owner-authored' },
        };

        const existingRigSource = authored.document.sources.find((source) => source.id === sourceRevision.id);
        if (existingRigSource && !sameExactSourceRevision(existingRigSource, sourceRevision)) throw new Error(`Rig ${input.rigDocumentId} disagrees with exact project SourceRevision ${sourceRevision.id}.`);
        const sources = existingRigSource ? authored.document.sources : [...authored.document.sources, sourceRevision];

        return {
          kind: 'rig' as const,
          document: {
            ...authored.document,
            revision: authored.document.revision + 1,
            sources,
            frames: [...authored.document.frames, adoptedFrame],
          },
        };
      });

      if (!targetRigFound || !adoptedFrame) throw new Error(`RigDocument ${input.rigDocumentId} not found in project.`);

      const adoption = createSourceAdoptionRecord({
        id: input.adoptionId,
        sourceInstance,
        locator,
        target: { documentId: input.rigDocumentId, kind: 'frame', id: input.frameId },
      });

      return {
        ...project,
        sourceAdoptions: [...project.sourceAdoptions, adoption],
        authoredDocuments,
      };
    },
  };
}
