import test from 'node:test';
import assert from 'node:assert/strict';

const {
  beginRevoluteTestSession,
  createRevoluteTestSession,
  endRevoluteTestSession,
  resetRevoluteTestSession,
  revoluteTestAngleRad,
  revoluteTestMovingElementIds,
  setRevoluteTestAngle,
} = await import('../../.core-dist/app/state/revolute-test-workflow.js');
const { resolveRigPoseView } = await import('../../.core-dist/evaluation/view.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });

function fixture() {
  return {
    schemaVersion: 1,
    documentId: 'rig.revolute-test-workflow',
    revision: 8,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [
      { id: 'element.arm', name: 'Arm', pose: pose(2, 0, 0) },
      { id: 'element.chassis', name: 'Chassis', pose: pose() },
    ],
    frames: [
      { id: 'frame.arm.hinge', name: 'Arm hinge', ownerElementId: 'element.arm', pose: pose(-1, 0, 0), provenance: { kind: 'owner-authored' } },
      { id: 'frame.chassis.hinge', name: 'Chassis hinge', ownerElementId: 'element.chassis', pose: pose(1, 0, 0), provenance: { kind: 'owner-authored' } },
    ],
    relations: [{ id: 'relation.hinge', type: 'revolute', frameA: 'frame.arm.hinge', frameB: 'frame.chassis.hinge' }],
  };
}

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('revolute TEST session derives legal moving element choices from authored frame ownership', () => {
  const document = fixture();
  assert.deepEqual(revoluteTestMovingElementIds(document, 'relation.hinge'), ['element.arm', 'element.chassis']);
  assert.throws(() => beginRevoluteTestSession(document, 'relation.hinge', 'element.missing'), /does not own a frame side/i);
});

test('Owner TEST workflow starts at exact authored zero, applies +30 degrees and Reset removes evaluator influence', () => {
  const document = fixture();
  const authoredBefore = JSON.stringify(document);
  let session = beginRevoluteTestSession(document, 'relation.hinge', 'element.arm');
  assert.equal(session.state.active, true);
  assert.equal(revoluteTestAngleRad(session), 0);
  let view = resolveRigPoseView(document, session.state.result);
  assert.equal(view.mode, 'evaluated');
  assert.deepEqual(view.elementWorldPoses.get('element.arm'), document.elements[0].pose);

  session = setRevoluteTestAngle(document, session, Math.PI / 6);
  close(revoluteTestAngleRad(session), Math.PI / 6);
  view = resolveRigPoseView(document, session.state.result);
  assert.equal(view.mode, 'evaluated');
  const moved = view.elementWorldPoses.get('element.arm');
  close(moved.position.x, 1 + Math.cos(Math.PI / 6));
  close(moved.position.y, Math.sin(Math.PI / 6));
  assert.equal(session.state.result.diagnostics[0].code, 'evaluation.single-revolute.applied');

  session = resetRevoluteTestSession(session);
  assert.equal(session.state.active, true);
  assert.equal(session.state.result, null);
  assert.equal(revoluteTestAngleRad(session), 0);
  view = resolveRigPoseView(document, session.state.result);
  assert.equal(view.mode, 'authored');
  assert.deepEqual(view.elementWorldPoses.get('element.arm'), document.elements[0].pose);
  assert.equal(JSON.stringify(document), authoredBefore, 'TEST workflow must never mutate authored neutral');

  session = endRevoluteTestSession();
  assert.deepEqual(session, createRevoluteTestSession());
});
