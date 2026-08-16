import test from 'node:test';
import assert from 'node:assert/strict';

const workspace = await import('../../.core-dist/app/state/rig-workspace.js');

const pose = (x = 0) => ({ position: { x, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const rig = {
  schemaVersion: 1,
  documentId: 'rig.workspace',
  revision: 2,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [],
  elements: [{ id: 'element.body', name: 'Body', pose: pose() }],
  frames: [],
  relations: [],
};
const evaluator = {
  id: 'fixture.evaluator',
  evaluate({ document, controls }) {
    return {
      evaluatorId: this.id,
      documentId: document.documentId,
      authoredRevision: document.revision,
      elementWorldPoseOverrides: new Map([['element.body', pose(controls.drive ?? 0)]]),
      diagnostics: [],
    };
  },
};
const clearGuard = { authoredPreviewActive: false };

test('workspace context switching does not require or mutate authored rig state', () => {
  const before = structuredClone(rig);
  let state = workspace.createRigWorkspaceState('inspect');
  state = workspace.switchRigWorkspaceContext(state, 'author', clearGuard);
  state = workspace.switchRigWorkspaceContext(state, 'represent', clearGuard);
  assert.deepEqual(rig, before);
  assert.equal(state.context, 'represent');
});

test('an active authored preview blocks every context switch until commit or cancel', () => {
  const state = workspace.createRigWorkspaceState('author');
  const blocked = { authoredPreviewActive: true };
  assert.throws(() => workspace.switchRigWorkspaceContext(state, 'inspect', blocked), /Commit or cancel/);
  assert.throws(() => workspace.switchRigWorkspaceContext(state, 'test', blocked), /Commit or cancel/);
});

test('entering TEST creates a fresh transient test session', () => {
  let state = workspace.createRigWorkspaceState('author');
  state = workspace.switchRigWorkspaceContext(state, 'test', clearGuard);
  assert.equal(state.context, 'test');
  assert.equal(state.test.active, true);
  assert.deepEqual(state.test.controls, {});
  assert.equal(state.test.result, null);
});

test('TEST controls and evaluation are unavailable outside TEST context', () => {
  const state = workspace.createRigWorkspaceState('author');
  assert.throws(() => workspace.setRigWorkspaceTestControl(state, 'drive', 1), /TEST context must be active/);
  assert.throws(() => workspace.evaluateRigWorkspaceTest(state, rig, evaluator), /TEST context must be active/);
});

test('leaving TEST discards controls and result rather than carrying evaluated state forward', () => {
  const authoredBefore = structuredClone(rig);
  let state = workspace.createRigWorkspaceState('test');
  state = workspace.setRigWorkspaceTestControl(state, 'drive', 7);
  state = workspace.evaluateRigWorkspaceTest(state, rig, evaluator);
  assert.equal(state.test.result.elementWorldPoseOverrides.get('element.body').position.x, 7);
  state = workspace.switchRigWorkspaceContext(state, 'author', clearGuard);
  assert.equal(state.context, 'author');
  assert.equal(state.test.active, false);
  assert.deepEqual(state.test.controls, {});
  assert.equal(state.test.result, null);
  assert.deepEqual(rig, authoredBefore);
});

test('Reset clears TEST influence while remaining in TEST', () => {
  let state = workspace.createRigWorkspaceState('test');
  state = workspace.setRigWorkspaceTestControl(state, 'drive', 3);
  state = workspace.evaluateRigWorkspaceTest(state, rig, evaluator);
  state = workspace.resetRigWorkspaceTest(state);
  assert.equal(state.context, 'test');
  assert.equal(state.test.active, true);
  assert.deepEqual(state.test.controls, {});
  assert.equal(state.test.result, null);
});
