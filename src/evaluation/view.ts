import { composePose } from '../kernel/math.js';
import type { Diagnostic, RigDocument, RigId, RigidPose } from '../kernel/types.js';
import type { RigEvaluationResult, RigPoseView } from './types.js';

function poseValid(pose: RigidPose): boolean {
  const values = [pose.position.x, pose.position.y, pose.position.z, pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w];
  const length = Math.hypot(pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w);
  return values.every(Number.isFinite) && Math.abs(length - 1) <= 1e-6;
}

export function resolveRigPoseView(document: RigDocument, result: RigEvaluationResult | null): RigPoseView {
  const diagnostics: Diagnostic[] = [];
  const resultMatches = result !== null && result.documentId === document.documentId && result.authoredRevision === document.revision;
  if (result && !resultMatches) diagnostics.push({ code: 'evaluation.result.stale', severity: 'warning', message: `Evaluation ${result.evaluatorId} targets ${result.documentId}@${result.authoredRevision}, not current ${document.documentId}@${document.revision}.`, references: [document.documentId] });

  const elementIds = new Set(document.elements.map((element) => element.id));
  const elementWorldPoses = new Map<RigId, RigidPose>();
  for (const element of document.elements) elementWorldPoses.set(element.id, element.pose);

  if (resultMatches && result) {
    for (const [elementId, pose] of result.elementWorldPoseOverrides) {
      if (!elementIds.has(elementId)) {
        diagnostics.push({ code: 'evaluation.element.missing', severity: 'error', message: `Evaluator ${result.evaluatorId} returned an unknown element ${elementId}.`, references: [elementId] });
        continue;
      }
      if (!poseValid(pose)) {
        diagnostics.push({ code: 'evaluation.pose.invalid', severity: 'error', message: `Evaluator ${result.evaluatorId} returned an invalid rigid pose for ${elementId}.`, references: [elementId] });
        continue;
      }
      elementWorldPoses.set(elementId, pose);
    }
    diagnostics.push(...result.diagnostics);
  }

  const frameWorldPoses = new Map<RigId, RigidPose>();
  const identity: RigidPose = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };
  for (const frame of document.frames) {
    const parent = frame.ownerElementId ? elementWorldPoses.get(frame.ownerElementId) : identity;
    if (parent) frameWorldPoses.set(frame.id, composePose(parent, frame.pose));
  }

  return {
    documentId: document.documentId,
    authoredRevision: document.revision,
    mode: resultMatches ? 'evaluated' : 'authored',
    elementWorldPoses,
    frameWorldPoses,
    diagnostics,
  };
}
