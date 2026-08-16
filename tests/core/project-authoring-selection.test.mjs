import test from 'node:test';
import assert from 'node:assert/strict';

const authoring = await import('../../.core-dist/app/state/project-authoring.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = { id: 'source.rev-a', label: 'A', uri: 'a.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };
const project = () => ({
  schemaVersion: 1, projectId: 'project.selection', units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sourceRevisions: [source],
  sourceInstances: [{ id: 'source-instance.fl', name: 'FL', sourceRevisionId: source.id, pose: pose() }],
  consumerReferences: [], sourceAdoptions: [],
  authoredDocuments: [{ kind: 'rig', document: {
    schemaVersion: 1, documentId: 'rig.vehicle', revision: 0, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [], elements: [{ id: 'element.arm', name: 'Arm', pose: pose() }], frames: [], relations: [],
  } }],
});

test('Undo reconciles disposable selection when an adopted frame disappears from durable project truth', () => {
  let state = authoring.createProjectAuthoringState(project(), 'rig.vehicle', { kind: 'element', id: 'element.arm' });
  state = authoring.beginProjectSourceFrameAdoption(state, {
    rigDocumentId: 'rig.vehicle', frameId: 'frame.adopted', frameName: 'Adopted', ownerElementId: 'element.arm', adoptionId: 'adoption.frame.adopted',
    sourceDatum: { sourceInstanceId: 'source-instance.fl', sourceRevisionId: source.id, locator: 'gltf2.node:datum', sourceRevisionWorldPose: pose(1, 0, 0) },
  });
  state = authoring.commitProjectAuthoringOperation(state);
  state = authoring.selectProjectRigTarget(state, { kind: 'frame', id: 'frame.adopted' });
  assert.deepEqual(state.selectedRigTarget, { kind: 'frame', id: 'frame.adopted' });

  state = authoring.undoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).frames.some((frame) => frame.id === 'frame.adopted'), false);
  assert.deepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.arm' });

  state = authoring.redoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).frames.some((frame) => frame.id === 'frame.adopted'), true);
  assert.deepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.arm' });
});
