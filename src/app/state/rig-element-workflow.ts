import { createRigElement } from '../../features/rig-elements/command.js';
import { IDENTITY_POSE } from '../../kernel/math.js';
import type { RigidPose, RigDocument } from '../../kernel/types.js';
import { applyRigCommandToProject } from '../../project/commands.js';
import {
  applyProjectAuthoringCommand,
  selectProjectRigTarget,
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
