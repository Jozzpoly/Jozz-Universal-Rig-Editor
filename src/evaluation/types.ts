import type { Diagnostic, RigDocument, RigId, RigidPose } from '../kernel/types.js';

export type RigEvaluationControls = Readonly<Record<string, number>>;

export interface RigEvaluationRequest {
  document: RigDocument;
  controls: RigEvaluationControls;
}

export interface RigEvaluationResult {
  evaluatorId: string;
  documentId: RigId;
  authoredRevision: number;
  elementWorldPoseOverrides: ReadonlyMap<RigId, RigidPose>;
  diagnostics: readonly Diagnostic[];
}

export interface RigEvaluator {
  id: string;
  evaluate(request: RigEvaluationRequest): RigEvaluationResult;
}

export interface RigPoseView {
  documentId: RigId;
  authoredRevision: number;
  mode: 'authored' | 'evaluated';
  elementWorldPoses: ReadonlyMap<RigId, RigidPose>;
  frameWorldPoses: ReadonlyMap<RigId, RigidPose>;
  diagnostics: readonly Diagnostic[];
}
