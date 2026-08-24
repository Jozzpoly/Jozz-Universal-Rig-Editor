import { createSingleRevoluteEvaluator } from '../../evaluation/single-revolute-evaluator.js';
import {
  beginRigTest,
  createRigTestState,
  endRigTest,
  evaluateRigTest,
  resetRigTest,
  setRigTestControl,
  type RigTestState,
} from '../../evaluation/test-state.js';
import type { RigDocument } from '../../kernel/types.js';

export interface RevoluteTestSession {
  relationId: string | null;
  movingElementId: string | null;
  state: RigTestState;
}

export function createRevoluteTestSession(): RevoluteTestSession {
  return { relationId: null, movingElementId: null, state: createRigTestState() };
}

export function revoluteTestControlId(relationId: string): string {
  const id = relationId.trim();
  if (!id) throw new Error('Revolute TEST relationId must be non-empty.');
  return `${id}.angle-rad`;
}

export function revoluteTestMovingElementIds(document: RigDocument, relationId: string): string[] {
  const relation = document.relations.find((candidate) => candidate.id === relationId);
  if (!relation) throw new Error(`TEST revolute relation ${relationId} not found.`);
  if (relation.type !== 'revolute') throw new Error(`TEST relation ${relationId} must be revolute, received ${relation.type}.`);
  const frameA = document.frames.find((frame) => frame.id === relation.frameA);
  const frameB = document.frames.find((frame) => frame.id === relation.frameB);
  if (!frameA || !frameB) throw new Error(`TEST revolute ${relationId} references missing authored frame(s).`);
  return [...new Set([frameA.ownerElementId, frameB.ownerElementId].filter((owner): owner is string => owner !== null))];
}

function evaluatorFor(session: RevoluteTestSession) {
  if (!session.relationId || !session.movingElementId) throw new Error('Revolute TEST session has no active relation/moving element configuration.');
  return createSingleRevoluteEvaluator({
    relationId: session.relationId,
    movingElementId: session.movingElementId,
    controlId: revoluteTestControlId(session.relationId),
  });
}

export function beginRevoluteTestSession(
  document: RigDocument,
  relationId: string,
  movingElementId: string,
): RevoluteTestSession {
  const movingOptions = revoluteTestMovingElementIds(document, relationId);
  if (!movingOptions.includes(movingElementId)) {
    throw new Error(`Element ${movingElementId} does not own a frame side of revolute ${relationId}.`);
  }
  const session: RevoluteTestSession = {
    relationId,
    movingElementId,
    state: beginRigTest(createRigTestState()),
  };
  const controlId = revoluteTestControlId(relationId);
  const zero = setRigTestControl(session.state, controlId, 0);
  return { ...session, state: evaluateRigTest(document, zero, evaluatorFor(session)) };
}

export function setRevoluteTestAngle(
  document: RigDocument,
  session: RevoluteTestSession,
  angleRad: number,
): RevoluteTestSession {
  if (!session.state.active) throw new Error('Revolute TEST must be active before setting an angle.');
  if (!session.relationId) throw new Error('Revolute TEST session has no relationId.');
  const next = setRigTestControl(session.state, revoluteTestControlId(session.relationId), angleRad);
  return { ...session, state: evaluateRigTest(document, next, evaluatorFor(session)) };
}

export function revoluteTestAngleRad(session: RevoluteTestSession): number {
  if (!session.relationId) return 0;
  const value = session.state.controls[revoluteTestControlId(session.relationId)];
  return Number.isFinite(value) ? value : 0;
}

export function resetRevoluteTestSession(session: RevoluteTestSession): RevoluteTestSession {
  if (!session.state.active) return session;
  return { ...session, state: resetRigTest(session.state) };
}

export function endRevoluteTestSession(): RevoluteTestSession {
  return { relationId: null, movingElementId: null, state: endRigTest() };
}
