import type { RigAuthoringState } from './rig-authoring.js';
import {
  beginRigTest,
  createRigTestState,
  endRigTest,
  evaluateRigTest,
  resetRigTest,
  setRigTestControl,
  type RigTestState,
} from '../../evaluation/test-state.js';
import type { RigEvaluator } from '../../evaluation/types.js';
import type { RigDocument } from '../../kernel/types.js';

export type RigWorkspaceContext = 'inspect' | 'author' | 'represent' | 'test';

export interface RigWorkspaceState {
  context: RigWorkspaceContext;
  test: RigTestState;
}

export function createRigWorkspaceState(context: RigWorkspaceContext = 'inspect'): RigWorkspaceState {
  return {
    context,
    test: context === 'test' ? beginRigTest(createRigTestState()) : createRigTestState(),
  };
}

export function switchRigWorkspaceContext(
  state: RigWorkspaceState,
  next: RigWorkspaceContext,
  authoring: RigAuthoringState,
): RigWorkspaceState {
  if (state.context === next) return state;
  if (authoring.session.preview) throw new Error('Commit or cancel the active authored preview before switching Rig Workspace context.');
  if (next === 'test') return { context: 'test', test: beginRigTest(createRigTestState()) };
  return { context: next, test: endRigTest() };
}

function requireTestContext(state: RigWorkspaceState): void {
  if (state.context !== 'test' || !state.test.active) throw new Error('Rig Workspace TEST context must be active.');
}

export function setRigWorkspaceTestControl(state: RigWorkspaceState, controlId: string, value: number): RigWorkspaceState {
  requireTestContext(state);
  return { ...state, test: setRigTestControl(state.test, controlId, value) };
}

export function evaluateRigWorkspaceTest(state: RigWorkspaceState, document: RigDocument, evaluator: RigEvaluator): RigWorkspaceState {
  requireTestContext(state);
  return { ...state, test: evaluateRigTest(document, state.test, evaluator) };
}

export function resetRigWorkspaceTest(state: RigWorkspaceState): RigWorkspaceState {
  requireTestContext(state);
  return { ...state, test: resetRigTest(state.test) };
}
