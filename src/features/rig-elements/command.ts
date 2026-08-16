import type { RigCommand } from '../../editor/rig-command.js';
import { IDENTITY_POSE, normalizeQuat } from '../../kernel/math.js';
import type { RigidPose, RigDocument, RigElement } from '../../kernel/types.js';

export interface CreateRigElementInput {
  id: string;
  name: string;
  pose?: RigidPose;
}

function clonePose(pose: RigidPose): RigidPose {
  return {
    position: { ...pose.position },
    rotation: normalizeQuat(pose.rotation),
  };
}

function documentHasId(document: RigDocument, id: string): boolean {
  return document.sources.some((source) => source.id === id)
    || document.elements.some((element) => element.id === id)
    || document.frames.some((frame) => frame.id === id)
    || document.relations.some((relation) => relation.id === id);
}

export function createRigElement(input: CreateRigElementInput): RigCommand {
  const id = input.id.trim();
  const name = input.name.trim();
  if (id.length === 0) throw new Error('RigElement ID must be non-empty.');
  if (name.length === 0) throw new Error('RigElement name must be non-empty.');

  const element: RigElement = {
    id,
    name,
    pose: clonePose(input.pose ?? IDENTITY_POSE),
  };

  return {
    label: `Create element ${id}`,
    apply(document) {
      if (documentHasId(document, id)) throw new Error(`Rig ID ${id} is already in use.`);
      return {
        ...document,
        elements: [...document.elements, {
          ...element,
          pose: clonePose(element.pose),
        }],
      };
    },
  };
}
