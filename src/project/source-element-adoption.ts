import { composePose, normalizeQuat } from '../kernel/math.js';
import type { RigidPose, RigElement, SourceRevision } from '../kernel/types.js';
import { createSourceAdoptionRecord } from './source-adoption.js';
import type { ExactPlacedSourceDatum } from './source-datum.js';
import type { JureProjectCommand } from './session.js';

export interface AdoptSourceDatumAsElementInput {
  rigDocumentId: string;
  elementId: string;
  elementName: string;
  adoptionId: string;
  sourceDatum: ExactPlacedSourceDatum;
}

function nonEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function poseFinite(pose: RigidPose): boolean {
  return [pose.position.x, pose.position.y, pose.position.z, pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w].every(Number.isFinite);
}

function cloneNormalizedPose(pose: RigidPose): RigidPose {
  if (!poseFinite(pose)) throw new Error('SOURCE datum pose must be finite.');
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

export function adoptSourceDatumAsElement(input: AdoptSourceDatumAsElementInput): JureProjectCommand {
  if (!nonEmpty(input.rigDocumentId) || !nonEmpty(input.elementId) || !nonEmpty(input.adoptionId)) throw new Error('Element adoption requires non-empty rig, element and adoption IDs.');
  if (!nonEmpty(input.elementName)) throw new Error('Adopted RigElement name must be non-empty.');
  if (!nonEmpty(input.sourceDatum.sourceInstanceId) || !nonEmpty(input.sourceDatum.sourceRevisionId) || !nonEmpty(input.sourceDatum.locator)) throw new Error('Exact SOURCE datum identity is incomplete.');

  const sourceDatumRevisionWorldPose = cloneNormalizedPose(input.sourceDatum.sourceRevisionWorldPose);
  const locator = input.sourceDatum.locator;
  const elementId = input.elementId.trim();
  const elementName = input.elementName.trim();

  return {
    label: `Adopt SOURCE datum as element: ${elementId}`,
    apply(project) {
      if (project.sourceAdoptions.some((adoption) => adoption.id === input.adoptionId)
        || project.sourceRevisions.some((source) => source.id === input.adoptionId)
        || project.sourceInstances.some((instance) => instance.id === input.adoptionId)
        || project.consumerReferences.some((reference) => reference.id === input.adoptionId)
        || project.authoredDocuments.some((authored) => authored.document.documentId === input.adoptionId)) {
        throw new Error(`Project ID ${input.adoptionId} is already in use.`);
      }

      const sourceRevision = project.sourceRevisions.find((source) => source.id === input.sourceDatum.sourceRevisionId);
      if (!sourceRevision) throw new Error(`SourceRevision ${input.sourceDatum.sourceRevisionId} not found in project.`);
      const sourceInstance = project.sourceInstances.find((instance) => instance.id === input.sourceDatum.sourceInstanceId);
      if (!sourceInstance) throw new Error(`SourceInstance ${input.sourceDatum.sourceInstanceId} not found in project.`);
      if (sourceInstance.sourceRevisionId !== input.sourceDatum.sourceRevisionId) throw new Error(`SourceInstance ${input.sourceDatum.sourceInstanceId} no longer uses exact revision ${input.sourceDatum.sourceRevisionId}. Re-select the SOURCE datum.`);

      let targetRigFound = false;
      let adoptedElement: RigElement | null = null;
      const authoredDocuments = project.authoredDocuments.map((authored) => {
        if (authored.kind !== 'rig' || authored.document.documentId !== input.rigDocumentId) return authored;
        targetRigFound = true;

        if (authored.document.sources.some((source) => source.id === elementId)
          || authored.document.elements.some((element) => element.id === elementId)
          || authored.document.frames.some((frame) => frame.id === elementId)
          || authored.document.relations.some((relation) => relation.id === elementId)) {
          throw new Error(`Rig ID ${elementId} is already in use in ${input.rigDocumentId}.`);
        }

        const sourceDatumProjectWorldPose = composePose(sourceInstance.pose, sourceDatumRevisionWorldPose);
        adoptedElement = {
          id: elementId,
          name: elementName,
          pose: cloneNormalizedPose(sourceDatumProjectWorldPose),
          source: { sourceRevisionId: sourceRevision.id, locator },
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
            elements: [...authored.document.elements, adoptedElement],
          },
        };
      });

      if (!targetRigFound || !adoptedElement) throw new Error(`RigDocument ${input.rigDocumentId} not found in project.`);

      const adoption = createSourceAdoptionRecord({
        id: input.adoptionId,
        sourceInstance,
        locator,
        target: { documentId: input.rigDocumentId, kind: 'element', id: elementId },
      });

      return {
        ...project,
        sourceAdoptions: [...project.sourceAdoptions, adoption],
        authoredDocuments,
      };
    },
  };
}
