import test from 'node:test';
import assert from 'node:assert/strict';

const { createSingleRevoluteEvaluator } = await import('../../.core-dist/evaluation/single-revolute-evaluator.js');
const { beginRigTest, createRigTestState, endRigTest, evaluateRigTest, resetRigTest, setRigTestControl } = await import('../../.core-dist/evaluation/test-state.js');
const { resolveRigPoseView } = await import('../../.core-dist/evaluation/view.js');
const { relationPrimaryAxisWorld } = await import('../../.core-dist/kernel/relation-frame.js');

const pose = (x = 0, y = 0, z = 0, rotation = { x: 0, y: 0, z: 0, w: 1 }) => ({ position: { x, y, z }, rotation });
const qz = (angle) => ({ x: 0, y: 0, z: Math.sin(angle / 2), w: Math.cos(angle / 2) });

function documentFixture({ limits, movingFramePose = pose(-1, 0, 0), fixedFramePose = pose(1, 0, 0) } = {}) {
  return {
    schemaVersion: 1,
    documentId: 'rig.single-revolute',
    revision: 4,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [
      { id: 'element.arm', name: 'Arm', pose: pose(2, 0, 0) },
      { id: 'element.chassis', name: 'Chassis', pose: pose() },
    ],
    frames: [
      { id: 'frame.arm.hinge', name: 'Arm hinge', ownerElementId: 'element.arm', pose: movingFramePose, provenance: { kind: 'owner-authored' } },
      { id: 'frame.chassis.hinge', name: 'Chassis hinge', ownerElementId: 'element.chassis', pose: fixedFramePose, provenance: { kind: 'owner-authored' } },
    ],
    relations: [{
      id: 'relation.hinge',
      type: 'revolute',
      frameA: 'frame.arm.hinge',
      frameB: 'frame.chassis.hinge',
      ...(limits ? { limits } : {}),
    }],
  };
}

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

function closePose(actual, expected, tolerance = 1e-10) {
  close(actual.position.x, expected.position.x, tolerance);
  close(actual.position.y, expected.position.y, tolerance);
  close(actual.position.z, expected.position.z, tolerance);
  close(actual.rotation.x, expected.rotation.x, tolerance);
  close(actual.rotation.y, expected.rotation.y, tolerance);
  close(actual.rotation.z, expected.rotation.z, tolerance);
  close(actual.rotation.w, expected.rotation.w, tolerance);
}

test('single-revolute evaluator applies one transient DOF around fixed hinge +Z and leaves AUTHORED untouched', () => {
  const document = documentFixture();
  const authoredBefore = JSON.stringify(document);
  const evaluator = createSingleRevoluteEvaluator({ relationId: 'relation.hinge', movingElementId: 'element.arm' });
  let state = beginRigTest(createRigTestState());
  state = setRigTestControl(state, 'relation.hinge.angle-rad', Math.PI / 2);
  state = evaluateRigTest(document, state, evaluator);
  const view = resolveRigPoseView(document, state.result);

  assert.equal(view.mode, 'evaluated');
  closePose(view.elementWorldPoses.get('element.arm'), pose(1, 1, 0, qz(Math.PI / 2)));
  closePose(view.elementWorldPoses.get('element.chassis'), pose());
  const movingHinge = view.frameWorldPoses.get('frame.arm.hinge');
  const fixedHinge = view.frameWorldPoses.get('frame.chassis.hinge');
  closePose(movingHinge, pose(1, 0, 0, qz(Math.PI / 2)));
  close(fixedHinge.position.x, movingHinge.position.x);
  close(fixedHinge.position.y, movingHinge.position.y);
  close(fixedHinge.position.z, movingHinge.position.z);
  assert.deepEqual(relationPrimaryAxisWorld(movingHinge), { x: 0, y: 0, z: 1 });
  assert.deepEqual(relationPrimaryAxisWorld(fixedHinge), { x: 0, y: 0, z: 1 });
  assert.equal(state.result.diagnostics[0].code, 'evaluation.single-revolute.applied');
  assert.equal(JSON.stringify(document), authoredBefore, 'TEST evaluation must not mutate AUTHORED document');
});

test('zero-angle evaluation reproduces authored pose and Reset removes all evaluator influence', () => {
  const document = documentFixture();
  const evaluator = createSingleRevoluteEvaluator({ relationId: 'relation.hinge', movingElementId: 'element.arm', controlId: 'hinge-angle' });
  let state = beginRigTest(createRigTestState());
  state = setRigTestControl(state, 'hinge-angle', 0);
  state = evaluateRigTest(document, state, evaluator);
  closePose(resolveRigPoseView(document, state.result).elementWorldPoses.get('element.arm'), document.elements[0].pose);

  state = setRigTestControl(state, 'hinge-angle', -Math.PI / 3);
  state = evaluateRigTest(document, state, evaluator);
  assert.equal(resolveRigPoseView(document, state.result).mode, 'evaluated');
  state = resetRigTest(state);
  assert.equal(state.result, null);
  assert.deepEqual(state.controls, {});
  const resetView = resolveRigPoseView(document, state.result);
  assert.equal(resetView.mode, 'authored');
  closePose(resetView.elementWorldPoses.get('element.arm'), document.elements[0].pose);
  assert.deepEqual(endRigTest(), createRigTestState());
});

test('single-revolute evaluator fails closed on ambiguous ownership, bad neutral geometry, limits and unsupported controls', () => {
  const evaluator = createSingleRevoluteEvaluator({ relationId: 'relation.hinge', movingElementId: 'element.arm' });
  const evaluate = (document, controls = {}) => evaluator.evaluate({ document, controls });

  const ambiguous = documentFixture();
  ambiguous.frames[1].ownerElementId = 'element.arm';
  assert.throws(() => evaluate(ambiguous), /own exactly one side/i);

  const missingMoving = createSingleRevoluteEvaluator({ relationId: 'relation.hinge', movingElementId: 'element.missing' });
  assert.throws(() => missingMoving.evaluate({ document: documentFixture(), controls: {} }), /moving element.*not found/i);

  const badNeutral = documentFixture({ fixedFramePose: pose(1.002, 0, 0) });
  assert.throws(() => evaluate(badNeutral), /neutral geometry is not satisfied/i);

  const limited = documentFixture({ limits: { lowerRad: -0.25, upperRad: 0.5 } });
  assert.throws(() => evaluate(limited, { 'relation.hinge.angle-rad': 0.75 }), /outside revolute limits/i);
  assert.throws(() => evaluate(documentFixture(), { 'relation.hinge.angle-rad': Number.NaN }), /must be finite/i);
  assert.throws(() => evaluate(documentFixture(), { other: 1 }), /unsupported control/i);
});
