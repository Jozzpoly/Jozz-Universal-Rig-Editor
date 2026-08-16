import test from 'node:test';
import assert from 'node:assert/strict';

const authoring = await import('../../.core-dist/app/state/project-authoring.js');
const workflow = await import('../../.core-dist/app/state/rig-element-workflow.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.real-jv',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [],
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.real-jv',
      revision: 4,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [{ id: 'element.upper-arm', name: 'Existing upper arm', pose: pose(2, 0, 0) }],
      frames: [{ id: 'element.lower-arm', name: 'Collision frame', ownerElementId: null, pose: pose(), provenance: { kind: 'synthetic' } }],
      relations: [],
    } }],
  };
}

test('allocateRigElementId is deterministic and respects document-wide identity collisions', () => {
  const document = projectFixture().authoredDocuments[0].document;
  assert.equal(workflow.allocateRigElementId(document, 'Upper Arm'), 'element.upper-arm.2');
  assert.equal(workflow.allocateRigElementId(document, 'Lower Arm'), 'element.lower-arm.2');
  assert.throws(() => workflow.allocateRigElementId(document, '   '), /name must be non-empty/);
});

test('Owner element creation is one durable project action and selects the newly authored element', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.real-jv');
  state = workflow.createProjectRigElement(state, 'Knuckle');

  const document = authoring.visibleProjectAuthoringRig(state);
  const created = document.elements.find((element) => element.id === 'element.knuckle');
  assert.ok(created);
  assert.equal(created.name, 'Knuckle');
  assert.deepEqual(created.pose, pose());
  assert.equal(document.revision, 5);
  assert.deepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.knuckle' });
  assert.deepEqual(state.session.past.map((entry) => entry.label), ['Create element element.knuckle']);

  state = authoring.undoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.knuckle'), false);
  assert.notDeepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.knuckle' });

  state = authoring.redoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.knuckle'), true);
});

test('element creation cannot bypass an active ProjectSession preview', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.real-jv');
  state = authoring.beginProjectRigTransform(state, { kind: 'element', id: 'element.upper-arm' });
  assert.throws(() => workflow.createProjectRigElement(state, 'Knuckle'), /another project authoring operation is active/);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.knuckle'), false);
});
