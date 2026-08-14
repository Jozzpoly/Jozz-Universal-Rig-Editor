import { composePose, relativePose } from '../kernel/math.js';
import type { RigidPose } from '../kernel/types.js';

export interface RepresentationBindingDraft {
  elementId: string;
  sourceSha256: string;
  sourceLocator: string;
  sourceNodeIndex: number;
  restPose: RigidPose;
}

export function createRepresentationBindingDraft(input: {
  elementId: string;
  elementWorldPose: RigidPose;
  sourceSha256: string;
  sourceLocator: string;
  sourceNodeIndex: number;
  sourceWorldPose: RigidPose;
}): RepresentationBindingDraft {
  return {
    elementId: input.elementId,
    sourceSha256: input.sourceSha256,
    sourceLocator: input.sourceLocator,
    sourceNodeIndex: input.sourceNodeIndex,
    restPose: relativePose(input.elementWorldPose, input.sourceWorldPose),
  };
}

export function evaluateRepresentationBindingPose(
  binding: RepresentationBindingDraft,
  elementWorldPose: RigidPose,
): RigidPose {
  return composePose(elementWorldPose, binding.restPose);
}

export function representationBindingMatchesSource(
  binding: RepresentationBindingDraft,
  sourceSha256: string,
): boolean {
  return binding.sourceSha256 === sourceSha256;
}
