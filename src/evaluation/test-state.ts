import type { RigDocument } from '../kernel/types.js';
import type { RigEvaluationControls, RigEvaluationResult, RigEvaluator } from './types.js';

export interface RigTestState {
  active: boolean;
  controls: RigEvaluationControls;
  result: RigEvaluationResult | null;
}

export function createRigTestState(): RigTestState {
  return { active: false, controls: Object.freeze({}), result: null };
}

export function beginRigTest(state: RigTestState): RigTestState {
  return { ...state, active: true, result: null };
}

export function setRigTestControl(state: RigTestState, controlId: string, value: number): RigTestState {
  if (!state.active) throw new Error('Rig TEST must be active before setting evaluator controls.');
  if (typeof controlId !== 'string' || controlId.trim().length === 0 || !Number.isFinite(value)) throw new Error('Rig TEST control requires a non-empty ID and finite value.');
  return { ...state, controls: Object.freeze({ ...state.controls, [controlId]: value }), result: null };
}

export function evaluateRigTest(document: RigDocument, state: RigTestState, evaluator: RigEvaluator): RigTestState {
  if (!state.active) throw new Error('Rig TEST must be active before evaluation.');
  const result = evaluator.evaluate({ document, controls: state.controls });
  if (result.evaluatorId !== evaluator.id || result.documentId !== document.documentId || result.authoredRevision !== document.revision) {
    throw new Error('Rig evaluator returned a result for the wrong evaluator/document/revision.');
  }
  return { ...state, result };
}

export function resetRigTest(state: RigTestState): RigTestState {
  return { active: state.active, controls: Object.freeze({}), result: null };
}

export function endRigTest(): RigTestState {
  return createRigTestState();
}
