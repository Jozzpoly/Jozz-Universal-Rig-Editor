import test from 'node:test';
import assert from 'node:assert/strict';

const { createRigTestState, beginRigTest, setRigTestControl, evaluateRigTest, resetRigTest } = await import('../../.core-dist/evaluation/test-state.js');
const { resolveRigPoseView } = await import('../../.core-dist/evaluation/view.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const rig = {
  schemaVersion: 1,
  documentId: 'rig.test',
  revision: 4,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [],
  elements: [{ id: 'element.rotor', name: 'Rotor', pose: pose(1, 2, 3) }],
  frames: [{ id: 'frame.rotor.axis', name: 'Axis', ownerElementId: 'element.rotor', pose: pose(0, 1, 0), provenance: { kind: 'owner-authored' } }],
  relations: [],
};
const fakeEvaluator = {
  id: 'fake.kinematic',
  evaluate({ document, controls }) {
    const dx = controls.probe ?? 0;
    return {
      evaluatorId: this.id,
      documentId: document.documentId,
      authoredRevision: document.revision,
      elementWorldPoseOverrides: new Map([['element.rotor', pose(1 + dx, 2, 3)]]),
      diagnostics: [],
    };
  },
};

test('TEST evaluation overlays poses without mutating authored neutral', () => {
  const authoredBefore = JSON.stringify(rig);
  let state = beginRigTest(createRigTestState());
  state = setRigTestControl(state, 'probe', 5);
  state = evaluateRigTest(rig, state, fakeEvaluator);
  const view = resolveRigPoseView(rig, state.result);
  assert.equal(view.mode, 'evaluated');
  assert.equal(view.elementWorldPoses.get('element.rotor').position.x, 6);
  assert.equal(view.frameWorldPoses.get('frame.rotor.axis').position.x, 6);
  assert.equal(JSON.stringify(rig), authoredBefore);
});

test('Reset clears all evaluator influence and returns the exact authored pose view', () => {
  let state = beginRigTest(createRigTestState());
  state = setRigTestControl(state, 'probe', 2);
  state = evaluateRigTest(rig, state, fakeEvaluator);
  state = resetRigTest(state);
  const view = resolveRigPoseView(rig, state.result);
  assert.equal(state.active, true);
  assert.deepEqual(state.controls, {});
  assert.equal(state.result, null);
  assert.equal(view.mode, 'authored');
  assert.deepEqual(view.elementWorldPoses.get('element.rotor'), rig.elements[0].pose);
  assert.deepEqual(view.frameWorldPoses.get('frame.rotor.axis'), pose(1, 3, 3));
});

test('an evaluation result is fail-closed after authored revision changes', () => {
  let state = beginRigTest(createRigTestState());
  state = setRigTestControl(state, 'probe', 4);
  state = evaluateRigTest(rig, state, fakeEvaluator);
  const edited = { ...rig, revision: 5, elements: [{ ...rig.elements[0], pose: pose(9, 2, 3) }] };
  const view = resolveRigPoseView(edited, state.result);
  assert.equal(view.mode, 'authored');
  assert.equal(view.elementWorldPoses.get('element.rotor').position.x, 9);
  assert.ok(view.diagnostics.some((diagnostic) => diagnostic.code === 'evaluation.result.stale'));
});

test('invalid evaluator element/pose output cannot replace authored truth', () => {
  const bad = {
    evaluatorId: 'bad',
    documentId: rig.documentId,
    authoredRevision: rig.revision,
    elementWorldPoseOverrides: new Map([
      ['element.missing', pose(100, 0, 0)],
      ['element.rotor', { position: { x: 100, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 2 } }],
    ]),
    diagnostics: [],
  };
  const view = resolveRigPoseView(rig, bad);
  assert.deepEqual(view.elementWorldPoses.get('element.rotor'), rig.elements[0].pose);
  assert.ok(view.diagnostics.some((diagnostic) => diagnostic.code === 'evaluation.element.missing'));
  assert.ok(view.diagnostics.some((diagnostic) => diagnostic.code === 'evaluation.pose.invalid'));
});
