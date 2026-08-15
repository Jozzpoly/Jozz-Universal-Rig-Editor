import test from 'node:test';
import assert from 'node:assert/strict';

const authoring = await import('../../.core-dist/app/state/rig-authoring.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
function documentFixture(id = 'rig.a') {
  return {
    schemaVersion: 1,
    documentId: id,
    revision: 2,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [{ id: 'element.body', name: 'Body', pose: pose(10, 0, 0) }],
    frames: [{ id: 'frame.mount', name: 'Mount', ownerElementId: 'element.body', pose: pose(1, 0, 0), provenance: { kind: 'synthetic' } }],
    relations: [],
  };
}

test('document replacement resets history and selects the first frame', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  state = authoring.commitRigAuthoringPose(state, { kind: 'element', id: 'element.body' }, pose(20, 0, 0));
  assert.equal(authoring.canUndoRigAuthoring(state), true);
  state = authoring.replaceRigAuthoringDocument(documentFixture('rig.b'));
  assert.equal(state.session.past.length, 0);
  assert.equal(state.session.future.length, 0);
  assert.deepEqual(state.selectedTarget, { kind: 'frame', id: 'frame.mount' });
  assert.equal(authoring.visibleRigAuthoringDocument(state).documentId, 'rig.b');
});

test('preview is visible without mutating committed authored truth', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  const committedBefore = state.session.committed;
  state = authoring.beginRigAuthoringTransform(state, { kind: 'element', id: 'element.body' });
  state = authoring.previewRigAuthoringTransform(state, { kind: 'element', id: 'element.body' }, pose(30, 0, 0));
  assert.equal(state.session.committed, committedBefore);
  assert.equal(state.session.committed.elements[0].pose.position.x, 10);
  assert.equal(authoring.visibleRigAuthoringDocument(state).elements[0].pose.position.x, 30);
});

test('commit increments revision and undo/redo remain owned by authoring state', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  state = authoring.previewRigAuthoringTransform(state, { kind: 'element', id: 'element.body' }, pose(30, 0, 0));
  state = authoring.commitRigAuthoringTransform(state);
  assert.equal(state.session.committed.revision, 3);
  assert.equal(state.session.committed.elements[0].pose.position.x, 30);
  assert.equal(authoring.canUndoRigAuthoring(state), true);
  state = authoring.undoRigAuthoring(state);
  assert.equal(state.session.committed.elements[0].pose.position.x, 10);
  state = authoring.redoRigAuthoring(state);
  assert.equal(state.session.committed.elements[0].pose.position.x, 30);
});

test('cancel discards preview and leaves revision/history untouched', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  state = authoring.previewRigAuthoringTransform(state, { kind: 'element', id: 'element.body' }, pose(30, 0, 0));
  state = authoring.cancelRigAuthoringTransform(state);
  assert.equal(authoring.visibleRigAuthoringDocument(state).elements[0].pose.position.x, 10);
  assert.equal(state.session.committed.revision, 2);
  assert.equal(state.session.past.length, 0);
});

test('owned frame world preview is converted back to owner-local authored pose', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  state = authoring.previewRigAuthoringTransform(state, { kind: 'frame', id: 'frame.mount' }, pose(15, 0, 0));
  const frame = authoring.visibleRigAuthoringDocument(state).frames[0];
  assert.equal(frame.pose.position.x, 5);
  assert.equal(frame.provenance.kind, 'owner-authored');
  assert.equal(state.session.committed.frames[0].pose.position.x, 1);
});

test('selection changes do not alter authored document or revision', () => {
  let state = authoring.createRigAuthoringState(documentFixture());
  const before = state.session.committed;
  state = authoring.selectRigAuthoringTarget(state, { kind: 'element', id: 'element.body' });
  assert.equal(state.session.committed, before);
  assert.equal(state.session.committed.revision, 2);
  assert.deepEqual(state.selectedTarget, { kind: 'element', id: 'element.body' });
});

test('controller rejects a selection that is not present in the visible document', () => {
  const state = authoring.createRigAuthoringState(documentFixture());
  assert.throws(() => authoring.selectRigAuthoringTarget(state, { kind: 'frame', id: 'frame.missing' }), /not present/);
});
