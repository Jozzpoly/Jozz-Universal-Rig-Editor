import { createRigElement } from '../../features/rig-elements/command.js';
import { IDENTITY_POSE } from '../../kernel/math.js';
import type { RigidPose, RigDocument } from '../../kernel/types.js';
import { applyRigCommandToProject } from '../../project/commands.js';
import { adoptSourceDatumAsElement } from '../../project/source-element-adoption.js';
import type { ExactPlacedSourceDatum } from '../../project/source-datum.js';
import type { JureProjectModel } from '../../project/types.js';
import {
  applyProjectAuthoringCommand,
  selectProjectRigTarget,
  visibleProjectAuthoringProject,
  visibleProjectAuthoringRig,
  type ProjectAuthoringState,
} from './project-authoring.js';

function slug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'element';
}

function rigIdInUse(document: RigDocument, id: string): boolean {
  return document.sources.some((source) => source.id === id)
    || document.elements.some((element) => element.id === id)
    || document.frames.some((frame) => frame.id === id)
    || document.relations.some((relation) => relation.id === id);
}

function projectTopLevelIdInUse(project: JureProjectModel, id: string): boolean {
  return project.sourceRevisions.some((source) => source.id === id)
    || project.sourceInstances.some((instance) => instance.id === id)
    || project.consumerReferences.some((reference) => reference.id === id)
    || project.sourceAdoptions.some((adoption) => adoption.id === id)
    || project.authoredDocuments.some((authored) => authored.document.documentId === id);
}

export function allocateRigElementId(document: RigDocument, preferredName: string): string {
  const trimmedName = preferredName.trim();
  if (trimmedName.length === 0) throw new Error('RigElement name must be non-empty.');
  const stem = `element.${slug(trimmedName)}`;
  for (let index = 1; index < 10000; index += 1) {
    const id = index === 1 ? stem : `${stem}.${index}`;
    if (!rigIdInUse(document, id)) return id;
  }
  throw new Error(`Could not allocate RigElement ID for ${trimmedName}.`);
}

function allocateElementAdoptionId(project: JureProjectModel, elementId: string): string {
  const stem = `adoption.${elementId}`;
  for (let index = 1; index < 10000; index += 1) {
    const id = index === 1 ? stem : `${stem}.${index}`;
    if (!projectTopLevelIdInUse(project, id)) return id;
  }
  throw new Error(`Could not allocate source adoption ID for ${elementId}.`);
}

export function createProjectRigElement(
  state: ProjectAuthoringState,
  name: string,
  pose: RigidPose = IDENTITY_POSE,
): ProjectAuthoringState {
  if (state.activeOperation) throw new Error('Cannot create a RigElement while another project authoring operation is active.');
  const document = visibleProjectAuthoringRig(state);
  const id = allocateRigElementId(document, name);
  const created = applyProjectAuthoringCommand(
    state,
    applyRigCommandToProject(
      state.rigDocumentId,
      createRigElement({ id, name, pose }),
    ),
  );
  return selectProjectRigTarget(created, { kind: 'element', id });
}

export function createProjectRigElementFromSource(
  state: ProjectAuthoringState,
  name: string,
  sourceDatum: ExactPlacedSourceDatum,
): ProjectAuthoringState {
  if (state.activeOperation) throw new Error('Cannot adopt SOURCE as a RigElement while another project authoring operation is active.');
  const project = visibleProjectAuthoringProject(state);
  const document = visibleProjectAuthoringRig(state);
  const elementId = allocateRigElementId(document, name);
  const adoptionId = allocateElementAdoptionId(project, elementId);
  const created = applyProjectAuthoringCommand(
    state,
    adoptSourceDatumAsElement({
      rigDocumentId: state.rigDocumentId,
      elementId,
      elementName: name,
      adoptionId,
      sourceDatum,
    }),
  );
  return selectProjectRigTarget(created, { kind: 'element', id: elementId });
}
