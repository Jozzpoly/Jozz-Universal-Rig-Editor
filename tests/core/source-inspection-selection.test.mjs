import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');

const pose = () => ({ position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = { id: 'source.rev-a', label: 'A', uri: 'a.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };
const project = {
  schemaVersion: 1, projectId: 'project.inspect', units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sourceRevisions: [source], sourceInstances: [{ id: 'source-instance.a', name: 'A', sourceRevisionId: source.id, pose: pose() }],
  consumerReferences: [], sourceAdoptions: [], authoredDocuments: [],
};
const inspection = {
  adapter: source.adapter, nodeCount: 2, meshCount: 0, skinCount: 0, jointCount: 0,
  nodes: [
    { locator: 'gltf2.node:rigid', index: 0, name: 'Rigid', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(), worldRigidPose: pose(), rigidCompatibility: 'rigid' },
    { locator: 'gltf2.node:inspect-only', index: 1, name: 'Inspect only', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: { x: 2, y: 1, z: 1 }, localRigidPose: null, worldRigidPose: null, rigidCompatibility: 'non-rigid-ancestor' },
  ],
};

test('SOURCE inspection selection may point at a non-rigid node while authored datum resolution still fails closed', () => {
  let state = runtime.createProjectSourceRuntimeState();
  state = runtime.linkExactSourceRuntimeAsset(state, project, source.id, { name: 'a.gltf', sha256: source.sha256, objectUrl: 'blob:a', inspection });
  state = runtime.selectProjectSourceDatum(state, project, 'source-instance.a', 'gltf2.node:inspect-only');
  assert.deepEqual(state.selection, { sourceInstanceId: 'source-instance.a', locator: 'gltf2.node:inspect-only' });
  assert.throws(
    () => runtime.resolveExactPlacedSourceDatum(state, project, 'source-instance.a', 'gltf2.node:inspect-only'),
    /not rigid-compatible/,
  );
});
