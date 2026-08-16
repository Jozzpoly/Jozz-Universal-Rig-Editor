import test from 'node:test';
import assert from 'node:assert/strict';

const authoring = await import('../../.core-dist/app/state/project-authoring.js');
const workflow = await import('../../.core-dist/app/state/rig-element-workflow.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = {
  id: 'source.real-jv',
  label: 'Real JV suspension',
  uri: 'OneSided_Steering_Suspension_Rig.gltf',
  sha256: 'a'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.real-jv',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [source],
    sourceInstances: [{ id: 'source-instance.real-jv', name: 'Real JV suspension', sourceRevisionId: source.id, pose: pose(10, 0, 0) }],
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

const exactDatum = (overrides = {}) => ({
  sourceInstanceId: 'source-instance.real-jv',
  sourceRevisionId: source.id,
  locator: 'gltf2.node:5',
  sourceRevisionWorldPose: pose(1.5, -1.3125, 0.0625),
  ...overrides,
});

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

test('Owner can create an element directly at exact SOURCE datum pose with provenance and one chronological history action', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.real-jv');
  state = workflow.createProjectRigElementFromSource(state, 'Lower Arm', exactDatum());

  const project = authoring.visibleProjectAuthoringProject(state);
  const document = authoring.visibleProjectAuthoringRig(state);
  const created = document.elements.find((element) => element.id === 'element.lower-arm.2');
  assert.ok(created);
  assert.equal(created.name, 'Lower Arm');
  assert.deepEqual(created.pose.position, { x: 11.5, y: -1.3125, z: 0.0625 });
  assert.deepEqual(created.source, { sourceRevisionId: source.id, locator: 'gltf2.node:5' });
  assert.deepEqual(state.selectedRigTarget, { kind: 'element', id: 'element.lower-arm.2' });
  assert.deepEqual(project.sourceAdoptions[0].target, { documentId: 'rig.real-jv', kind: 'element', id: 'element.lower-arm.2' });
  assert.deepEqual(state.session.past.map((entry) => entry.label), ['Adopt SOURCE datum as element: element.lower-arm.2']);

  state = authoring.undoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.lower-arm.2'), false);
  assert.equal(authoring.visibleProjectAuthoringProject(state).sourceAdoptions.length, 0);

  state = authoring.redoProjectAuthoring(state);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.lower-arm.2'), true);
  assert.equal(authoring.visibleProjectAuthoringProject(state).sourceAdoptions.length, 1);
});

test('SOURCE-derived element adoption allocates adoption identity independently of an existing project ID collision', () => {
  const project = projectFixture();
  project.consumerReferences.push({
    id: 'adoption.element.knuckle',
    label: 'occupied',
    consumer: { id: 'consumer', revision: '1' },
    payloadLocator: 'payload.json',
    payloadSha256: 'b'.repeat(64),
  });
  let state = authoring.createProjectAuthoringState(project, 'rig.real-jv');
  state = workflow.createProjectRigElementFromSource(state, 'Knuckle', exactDatum());
  assert.equal(authoring.visibleProjectAuthoringProject(state).sourceAdoptions[0].id, 'adoption.element.knuckle.2');
});

test('element creation cannot bypass an active ProjectSession preview', () => {
  let state = authoring.createProjectAuthoringState(projectFixture(), 'rig.real-jv');
  state = authoring.beginProjectRigTransform(state, { kind: 'element', id: 'element.upper-arm' });
  assert.throws(() => workflow.createProjectRigElement(state, 'Knuckle'), /another project authoring operation is active/);
  assert.throws(() => workflow.createProjectRigElementFromSource(state, 'Knuckle', exactDatum()), /another project authoring operation is active/);
  assert.equal(authoring.visibleProjectAuthoringRig(state).elements.some((element) => element.id === 'element.knuckle'), false);
});
