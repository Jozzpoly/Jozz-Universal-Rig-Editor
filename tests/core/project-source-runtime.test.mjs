import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');
const sessionApi = await import('../../.core-dist/project/session.js');
const projectCommands = await import('../../.core-dist/project/commands.js');

const pose = (x = 0, y = 0, z = 0) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
});

const sourceRevision = {
  id: 'source.suspension.rev-a',
  label: 'Suspension A',
  uri: 'sources/suspension.gltf',
  sha256: 'a'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};

const inspection = (adapter = sourceRevision.adapter) => ({
  adapter,
  nodeCount: 2,
  meshCount: 0,
  skinCount: 0,
  jointCount: 0,
  nodes: [
    { locator: 'gltf2.node:lower-ball', index: 0, name: 'LowerBall', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(), worldRigidPose: pose(), rigidCompatibility: 'rigid' },
    { locator: 'gltf2.node:wheel-center', index: 1, name: 'WheelCenter', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(), worldRigidPose: pose(), rigidCompatibility: 'rigid' },
  ],
});

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.runtime',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceRevision],
    sourceInstances: [
      { id: 'source-instance.fl', name: 'FL', sourceRevisionId: sourceRevision.id, pose: pose(0, 0, -1) },
      { id: 'source-instance.fr', name: 'FR', sourceRevisionId: sourceRevision.id, pose: pose(0, 0, 1) },
    ],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [],
  };
}

const asset = (overrides = {}) => ({
  name: 'suspension.gltf',
  sha256: sourceRevision.sha256,
  objectUrl: 'blob:suspension',
  inspection: inspection(),
  ...overrides,
});

test('one exact linked runtime asset serves several placed SourceInstances while selection preserves instance identity', () => {
  const project = projectFixture();
  let state = runtime.createProjectSourceRuntimeState();
  state = runtime.linkExactSourceRuntimeAsset(state, project, sourceRevision.id, asset());

  assert.equal(state.linkedAssets.length, 1);
  assert.equal(runtime.linkedSourceRuntimeForInstance(state, project, 'source-instance.fl'), state.linkedAssets[0]);
  assert.equal(runtime.linkedSourceRuntimeForInstance(state, project, 'source-instance.fr'), state.linkedAssets[0]);

  state = runtime.selectProjectSourceDatum(state, project, 'source-instance.fl', 'gltf2.node:wheel-center');
  assert.deepEqual(state.selection, { sourceInstanceId: 'source-instance.fl', locator: 'gltf2.node:wheel-center' });
  state = runtime.selectProjectSourceDatum(state, project, 'source-instance.fr', 'gltf2.node:wheel-center');
  assert.deepEqual(state.selection, { sourceInstanceId: 'source-instance.fr', locator: 'gltf2.node:wheel-center' });
});

test('runtime relink fails closed on exact hash or adapter mismatch', () => {
  const project = projectFixture();
  const state = runtime.createProjectSourceRuntimeState();

  assert.throws(
    () => runtime.linkExactSourceRuntimeAsset(state, project, sourceRevision.id, asset({ sha256: 'b'.repeat(64) })),
    /hash mismatch/,
  );
  assert.throws(
    () => runtime.linkExactSourceRuntimeAsset(state, project, sourceRevision.id, asset({ inspection: inspection({ id: 'other-adapter', version: 1 }) })),
    /adapter mismatch/,
  );
});

test('runtime relink is workspace recovery only and does not create project history', () => {
  const project = projectFixture();
  const projectSession = sessionApi.createProjectSession(project);
  let runtimeState = runtime.createProjectSourceRuntimeState();
  runtimeState = runtime.linkExactSourceRuntimeAsset(runtimeState, projectSession.committed, sourceRevision.id, asset());

  assert.equal(runtimeState.linkedAssets.length, 1);
  assert.equal(projectSession.committed, project);
  assert.equal(projectSession.past.length, 0);
  assert.equal(projectSession.future.length, 0);
});

test('unlinking runtime bytes clears selection that depends on that revision but leaves project truth untouched', () => {
  const project = projectFixture();
  const projectBefore = structuredClone(project);
  let state = runtime.linkExactSourceRuntimeAsset(runtime.createProjectSourceRuntimeState(), project, sourceRevision.id, asset());
  state = runtime.selectProjectSourceDatum(state, project, 'source-instance.fl', 'gltf2.node:lower-ball');
  state = runtime.unlinkSourceRuntimeAsset(state, project, sourceRevision.id);

  assert.equal(state.linkedAssets.length, 0);
  assert.equal(state.selection, null);
  assert.deepEqual(project, projectBefore);
});

test('selection requires linked exact bytes and a locator present in that revision inspection', () => {
  const project = projectFixture();
  let state = runtime.createProjectSourceRuntimeState();
  assert.throws(
    () => runtime.selectProjectSourceDatum(state, project, 'source-instance.fl', 'gltf2.node:lower-ball'),
    /not linked to runtime bytes/,
  );

  state = runtime.linkExactSourceRuntimeAsset(state, project, sourceRevision.id, asset());
  assert.throws(
    () => runtime.selectProjectSourceDatum(state, project, 'source-instance.fl', 'gltf2.node:missing'),
    /not present/,
  );
});

test('runtime selection reconciles after durable SourceInstance removal without discarding reusable revision bytes', () => {
  let projectSession = sessionApi.createProjectSession(projectFixture());
  let state = runtime.linkExactSourceRuntimeAsset(runtime.createProjectSourceRuntimeState(), projectSession.committed, sourceRevision.id, asset());
  state = runtime.selectProjectSourceDatum(state, projectSession.committed, 'source-instance.fl', 'gltf2.node:lower-ball');

  projectSession = sessionApi.applyProjectCommand(projectSession, projectCommands.removeSourceInstance('source-instance.fl'));
  state = runtime.reconcileProjectSourceRuntimeState(state, projectSession.committed);

  assert.equal(state.selection, null);
  assert.equal(state.linkedAssets.length, 1);
  assert.equal(projectSession.past.length, 1);
});
