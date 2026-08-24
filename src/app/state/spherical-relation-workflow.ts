import { createSphericalRelation } from '../../features/rig-relations/create-spherical.js';
import type { RigDocument } from '../../kernel/types.js';
import { applyRigCommandToProject } from '../../project/commands.js';
import {
  applyProjectAuthoringCommand,
  visibleProjectAuthoringRig,
  type ProjectAuthoringState,
} from './project-authoring.js';

function slug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'spherical';
}

function rigIdInUse(document: RigDocument, id: string): boolean {
  return document.sources.some((source) => source.id === id)
    || document.elements.some((element) => element.id === id)
    || document.frames.some((frame) => frame.id === id)
    || document.relations.some((relation) => relation.id === id);
}

export function allocateSphericalRelationId(document: RigDocument, frameAId: string, frameBId: string): string {
  const frameA = document.frames.find((frame) => frame.id === frameAId);
  const frameB = document.frames.find((frame) => frame.id === frameBId);
  if (!frameA) throw new Error(`Spherical frameA ${frameAId} not found.`);
  if (!frameB) throw new Error(`Spherical frameB ${frameBId} not found.`);
  if (frameA.id === frameB.id) throw new Error('Spherical relation requires two distinct frames.');
  const stem = `relation.spherical.${slug(frameA.name)}-${slug(frameB.name)}`;
  for (let index = 1; index < 10000; index += 1) {
    const id = index === 1 ? stem : `${stem}.${index}`;
    if (!rigIdInUse(document, id)) return id;
  }
  throw new Error(`Could not allocate spherical relation ID for ${frameAId} and ${frameBId}.`);
}

export function createProjectSphericalRelation(
  state: ProjectAuthoringState,
  frameAId: string,
  frameBId: string,
): ProjectAuthoringState {
  if (state.activeOperation) throw new Error('Cannot create a spherical relation while another project authoring operation is active.');
  const document = visibleProjectAuthoringRig(state);
  const existing = document.relations.find((relation) => relation.type === 'spherical'
    && ((relation.frameA === frameAId && relation.frameB === frameBId)
      || (relation.frameA === frameBId && relation.frameB === frameAId)));
  if (existing) throw new Error(`Frames ${frameAId} and ${frameBId} already have spherical ${existing.id}.`);
  const id = allocateSphericalRelationId(document, frameAId, frameBId);
  return applyProjectAuthoringCommand(
    state,
    applyRigCommandToProject(
      state.rigDocumentId,
      createSphericalRelation({ id, frameA: frameAId, frameB: frameBId }),
    ),
  );
}
