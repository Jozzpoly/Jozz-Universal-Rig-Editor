import test from 'node:test';
import assert from 'node:assert/strict';

const authoring = await import('../../.core-dist/app/state/project-authoring.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = { id: 'source.rev-a', label: 'A', uri: 'a.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };
function projectFixture() {
  return {
    schemaVersion: 1, projectId: 'project.authoring', units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [source],
    sourceInstances: [{ id: 'source-instance.fl', name: 'FL', sourceRevisionId: source.id, pose: pose() }],
    consumerReferences: [], sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1, documentId: 'rig.vehicle', revision: 2, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [{ id: 'element.arm', name: 'Arm', pose: pose(10, 0, 0) }],
      frames: [{ id: 'frame.mount', name: 'Mount', ownerElementId: 'element.arm', pose: pose(1, 0, 0), provenance: { kind: 'owner-authored' } }],
      relations: [],
    } }],
  };
}

const sourcePoseX = (state) => authoring.visibleProjectAuthoringProject(state).sourceInstances[0].pose.position.x;
const rig = (state) => authoring.visibleProjectAuthoringRig(state);

test('SOURCE placement and authored rig transform share one chronological ProjectSession history', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle');

  state = authoring.previewProjectSourceInstanceTransform(state, 'source-instance.fl', pose(5, 0, 0));
  assert.equal(sourcePoseX(state), 5);
  assert.equal(state.session.committed.sourceInstances[0].pose.position.x, 0);
  state = authoring.commitProjectAuthoringOperation(state);

  state = authoring.previewProjectRigTransform(state, { kind: 'frame', id: 'frame.mount' }, pose(15, 0, 0));
  assert.equal(rig(state).frames[0].pose.position.x, 5);
  state = authoring.commitProjectAuthoringOperation(state);

  assert.equal(state.session.past.length, 2);
  state = authoring.undoProjectAuthoring(state);
  assert.equal(rig(state).frames[0].pose.position.x, 1);
  assert.equal(sourcePoseX(state), 5);
  state = authoring.undoProjectAuthoring(state);
  assert.equal(sourcePoseX(state), 0);
  state = authoring.redoProjectAuthoring(state);
  assert.equal(sourcePoseX(state), 5);
  state = authoring.redoProjectAuthoring(state);
  assert.equal(rig(state).frames[0].pose.position.x, 5);
});

test('authored selection is disposable state and does not create durable project history', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle');
  const before = state.session.committed;
  state = authoring.selectProjectRigTarget(state, { kind: 'element', id: 'element.arm' });
  assert.equal(state.session.committed, before);
  assert.equal(state.session.past.length, 0);
  assert.deepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.arm' });
});

test('cancelled SOURCE transform restores committed placement and creates no history', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle');
  state = authoring.previewProjectSourceInstanceTransform(state, 'source-instance.fl', pose(7, 0, 0));
  assert.equal(sourcePoseX(state), 7);
  state = authoring.cancelProjectAuthoringOperation(state);
  assert.equal(sourcePoseX(state), 0);
  assert.equal(state.session.past.length, 0);
  assert.equal(state.activeOperation, null);
});

test('a second operation kind cannot hijack an active project preview', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle');
  state = authoring.beginProjectSourceInstanceTransform(state, 'source-instance.fl');
  assert.throws(
    () => authoring.previewProjectRigTransform(state, { kind: 'frame', id: 'frame.mount' }, pose(15, 0, 0)),
    /already active/,
  );
  assert.equal(state.activeOperation.kind, 'source-instance-transform');
});

test('numeric rig edit also enters the same project history without a rig-specific undo stack', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle');
  state = authoring.commitProjectRigPose(state, { kind: 'frame', id: 'frame.mount' }, pose(3, 0, 0));
  assert.equal(state.session.past.length, 1);
  assert.equal(state.session.committed.authoredDocuments.find((entry) => entry.kind === 'rig').document.revision, 3);
  assert.equal(rig(state).frames[0].pose.position.x, 3);
});

test('SOURCE datum adoption is a previewable atomic project operation with Commit/Cancel', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle', { kind: 'element', id: 'element.arm' });
  const input = {
    rigDocumentId: 'rig.vehicle',
    frameId: 'frame.adopted',
    frameName: 'Adopted datum',
    ownerElementId: 'element.arm',
    adoptionId: 'adopt.frame.adopted',
    sourceDatum: {
      sourceInstanceId: 'source-instance.fl',
      sourceRevisionId: source.id,
      locator: 'gltf2.node:datum',
      sourceRevisionWorldPose: pose(12, 0, 0),
    },
  };

  state = authoring.beginProjectSourceFrameAdoption(state, input);
  assert.equal(state.session.committed.sourceAdoptions.length, 0);
  assert.equal(rig(state).frames.some((frame) => frame.id === 'frame.adopted'), true);
  assert.equal(rig(state).frames.find((frame) => frame.id === 'frame.adopted').pose.position.x, 2);
  assert.equal(authoring.canUndoProjectAuthoring(state), false);

  state = authoring.cancelProjectAuthoringOperation(state);
  assert.equal(rig(state).frames.some((frame) => frame.id === 'frame.adopted'), false);
  assert.equal(state.session.past.length, 0);

  state = authoring.beginProjectSourceFrameAdoption(state, input);
  state = authoring.commitProjectAuthoringOperation(state);
  assert.equal(state.session.committed.sourceAdoptions.length, 1);
  assert.equal(rig(state).frames.some((frame) => frame.id === 'frame.adopted'), true);
  assert.equal(state.session.past.length, 1);
});

test('a freshly adopted frame can be transformed, undone and redone without breaking adoption evidence', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.vehicle', { kind: 'element', id: 'element.arm' });
  const input = {
    rigDocumentId: 'rig.vehicle',
    frameId: 'frame.adopted',
    frameName: 'Adopted datum',
    ownerElementId: 'element.arm',
    adoptionId: 'adopt.frame.adopted',
    sourceDatum: {
      sourceInstanceId: 'source-instance.fl',
      sourceRevisionId: source.id,
      locator: 'gltf2.node:datum',
      sourceRevisionWorldPose: pose(12, 0, 0),
    },
  };

  state = authoring.beginProjectSourceFrameAdoption(state, input);
  state = authoring.commitProjectAuthoringOperation(state);
  state = authoring.selectProjectRigTarget(state, { kind: 'frame', id: 'frame.adopted' });

  state = authoring.previewProjectRigTransform(state, { kind: 'frame', id: 'frame.adopted' }, pose(14, 0, 0));
  const previewFrame = rig(state).frames.find((frame) => frame.id === 'frame.adopted');
  assert.equal(previewFrame.pose.position.x, 4);
  assert.deepEqual(previewFrame.source, { sourceRevisionId: source.id, locator: 'gltf2.node:datum' });
  assert.equal(state.session.committed.sourceAdoptions[0].source.sourceInstancePose.position.x, 0);

  state = authoring.commitProjectAuthoringOperation(state);
  assert.equal(rig(state).frames.find((frame) => frame.id === 'frame.adopted').pose.position.x, 4);
  assert.equal(state.session.past.length, 2);

  state = authoring.undoProjectAuthoring(state);
  assert.equal(rig(state).frames.find((frame) => frame.id === 'frame.adopted').pose.position.x, 2);
  assert.equal(state.session.committed.sourceAdoptions.length, 1);

  state = authoring.undoProjectAuthoring(state);
  assert.equal(rig(state).frames.some((frame) => frame.id === 'frame.adopted'), false);
  assert.equal(state.session.committed.sourceAdoptions.length, 0);

  state = authoring.redoProjectAuthoring(state);
  assert.equal(rig(state).frames.find((frame) => frame.id === 'frame.adopted').pose.position.x, 2);
  state = authoring.redoProjectAuthoring(state);
  assert.equal(rig(state).frames.find((frame) => frame.id === 'frame.adopted').pose.position.x, 4);
});
