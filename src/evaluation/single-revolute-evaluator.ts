import { composePose, IDENTITY_POSE, relativePose } from '../kernel/math.js';
import { measureRevoluteFrameResidual } from '../kernel/relation-frame.js';
import { resolveRigDocument } from '../kernel/resolve.js';
import type { Diagnostic, RigidPose, RevoluteRelation, RigDocument, RigElement, RigFrame } from '../kernel/types.js';
import type { RigEvaluationRequest, RigEvaluationResult, RigEvaluator } from './types.js';

const NEUTRAL_ORIGIN_TOLERANCE_M = 1e-6;
const NEUTRAL_AXIS_TOLERANCE_RAD = 1e-6;

export interface SingleRevoluteEvaluatorConfig {
  relationId: string;
  movingElementId: string;
  controlId?: string;
}

interface ResolvedSingleRevolute {
  relation: RevoluteRelation;
  movingElement: RigElement;
  movingFrame: RigFrame;
  fixedFrame: RigFrame;
  movingFrameWorld: RigidPose;
  fixedFrameWorld: RigidPose;
}

function nonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} must be non-empty.`);
  return trimmed;
}

function resolveSingleRevolute(document: RigDocument, relationId: string, movingElementId: string): ResolvedSingleRevolute {
  const relation = document.relations.find((candidate) => candidate.id === relationId);
  if (!relation) throw new Error(`TEST revolute relation ${relationId} not found.`);
  if (relation.type !== 'revolute') throw new Error(`TEST relation ${relationId} must be revolute, received ${relation.type}.`);

  const movingElement = document.elements.find((element) => element.id === movingElementId);
  if (!movingElement) throw new Error(`TEST moving element ${movingElementId} not found.`);
  const frameA = document.frames.find((frame) => frame.id === relation.frameA);
  const frameB = document.frames.find((frame) => frame.id === relation.frameB);
  if (!frameA || !frameB) throw new Error(`TEST revolute ${relationId} references missing authored frame(s).`);

  const aMoves = frameA.ownerElementId === movingElementId;
  const bMoves = frameB.ownerElementId === movingElementId;
  if (aMoves === bMoves) {
    throw new Error(`TEST moving element ${movingElementId} must own exactly one side of revolute ${relationId}.`);
  }
  const movingFrame = aMoves ? frameA : frameB;
  const fixedFrame = aMoves ? frameB : frameA;

  const resolved = resolveRigDocument(document);
  const movingFrameWorld = resolved.frameWorldPoses.get(movingFrame.id);
  const fixedFrameWorld = resolved.frameWorldPoses.get(fixedFrame.id);
  if (!movingFrameWorld || !fixedFrameWorld) throw new Error(`TEST revolute ${relationId} could not resolve both authored frame poses.`);

  const neutralResidual = measureRevoluteFrameResidual(movingFrameWorld, fixedFrameWorld);
  if (neutralResidual.originResidualM > NEUTRAL_ORIGIN_TOLERANCE_M || neutralResidual.axisAngleRad > NEUTRAL_AXIS_TOLERANCE_RAD) {
    throw new Error(`TEST revolute ${relationId} neutral geometry is not satisfied: origin=${neutralResidual.originResidualM} m, axis=${neutralResidual.axisAngleRad} rad.`);
  }

  return { relation, movingElement, movingFrame, fixedFrame, movingFrameWorld, fixedFrameWorld };
}

function zRotationPose(angleRad: number): RigidPose {
  const half = angleRad / 2;
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: Math.sin(half), w: Math.cos(half) },
  };
}

function evaluateSingleRevolute(document: RigDocument, controls: Readonly<Record<string, number>>, config: Required<SingleRevoluteEvaluatorConfig>, evaluatorId: string): RigEvaluationResult {
  const resolved = resolveSingleRevolute(document, config.relationId, config.movingElementId);
  const unknownControls = Object.keys(controls).filter((controlId) => controlId !== config.controlId);
  if (unknownControls.length > 0) throw new Error(`Single-revolute evaluator received unsupported control(s): ${unknownControls.join(', ')}.`);

  const angleRad = controls[config.controlId] ?? 0;
  if (!Number.isFinite(angleRad)) throw new Error(`TEST control ${config.controlId} must be finite.`);
  if (resolved.relation.limits && (angleRad < resolved.relation.limits.lowerRad || angleRad > resolved.relation.limits.upperRad)) {
    throw new Error(`TEST control ${config.controlId}=${angleRad} rad is outside revolute limits [${resolved.relation.limits.lowerRad}, ${resolved.relation.limits.upperRad}].`);
  }

  const desiredMovingFrameWorld = composePose(resolved.fixedFrameWorld, zRotationPose(angleRad));
  const movingFrameInverse = relativePose(resolved.movingFrame.pose, IDENTITY_POSE);
  const evaluatedMovingElementWorld = composePose(desiredMovingFrameWorld, movingFrameInverse);
  const diagnostics: Diagnostic[] = [{
    code: 'evaluation.single-revolute.applied',
    severity: 'info',
    message: `${resolved.relation.id}: TEST angle ${(angleRad * 180 / Math.PI).toFixed(3)}° applied to ${resolved.movingElement.id}.`,
    references: [resolved.relation.id, resolved.movingElement.id, resolved.movingFrame.id, resolved.fixedFrame.id],
    metrics: { angleRad },
  }];

  return {
    evaluatorId,
    documentId: document.documentId,
    authoredRevision: document.revision,
    elementWorldPoseOverrides: new Map([[resolved.movingElement.id, evaluatedMovingElementWorld]]),
    diagnostics,
  };
}

export function createSingleRevoluteEvaluator(input: SingleRevoluteEvaluatorConfig): RigEvaluator {
  const relationId = nonEmpty(input.relationId, 'Single-revolute relationId');
  const movingElementId = nonEmpty(input.movingElementId, 'Single-revolute movingElementId');
  const controlId = nonEmpty(input.controlId ?? `${relationId}.angle-rad`, 'Single-revolute controlId');
  const config = Object.freeze({ relationId, movingElementId, controlId });
  const id = `single-revolute-v1:${encodeURIComponent(relationId)}:${encodeURIComponent(movingElementId)}`;
  return {
    id,
    evaluate(request: RigEvaluationRequest): RigEvaluationResult {
      return evaluateSingleRevolute(request.document, request.controls, config, id);
    },
  };
}
