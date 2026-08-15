import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');
const { adoptSourceDatumAsFrame } = await import('../../.core-dist/project/source-frame-adoption.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = {
  id: 'source.rev-a', label: 'Source A', uri: 'source.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 },
};
function projectFixture() {
  return {
    schemaVersion: 1, projectId: 'project.datum', units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [source],
    sourceInstances: [{ id: 'source-instance.fl', name: 'FL', sourceRevisionId: source.id, pose: pose(10, 0, 0) }],
    consumerReferences: [], sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1, documentId: 'rig.vehicle', revision: 0, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [], elements: [], frames: [], relations: [],
    } }],
  };
}
const inspection = (rigidCompatibility = 'rigid') => ({
  adapter: source.adapter, nodeCount: 1, meshCount: 0, skinCount: 0, jointCount: 0,
  nodes: [{
    locator: 'gltf2.node:hardpoint', index: 0, name: 'Hardpoint', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false,
    localScale: { x: 1, y: 1, z: 1 }, localRigidPose: rigidCompatibility === 'rigid' ? pose(2, 0, 0) : null,
    worldRigidPose: rigidCompatibility === 'rigid' ? pose(2, 0, 0) : null, rigidCompatibility,
  }],
});

test('only exact linked runtime bytes resolve a placed datum that can cross into authored truth', () => {
  const project = projectFixture();
  let runtimeState = runtime.createProjectSourceRuntimeState();
  runtimeState = runtime.linkExactSourceRuntimeAsset(runtimeState, project, source.id, {
    name: 'source.gltf', sha256: source.sha256, objectUrl: 'blob:source', inspection: inspection(),
  });

  const datum = runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', 'gltf2.node:hardpoint');
  assert.deepEqual(datum, {
    sourceInstanceId: 'source-instance.fl', sourceRevisionId: source.id, locator: 'gltf2.node:hardpoint', sourceRevisionWorldPose: pose(2, 0, 0),
  });

  const adopted = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle', frameId: 'frame.hardpoint', frameName: 'Hardpoint', ownerElementId: null,
    adoptionId: 'adopt.hardpoint', sourceDatum: datum,
  }).apply(project);
  const rig = adopted.authoredDocuments.find((entry) => entry.kind === 'rig').document;
  assert.equal(rig.frames[0].pose.position.x, 12);
  assert.equal(adopted.sourceAdoptions[0].source.sourceRevisionId, source.id);
});

test('non-rigid inspection cannot produce ExactPlacedSourceDatum', () => {
  const project = projectFixture();
  let runtimeState = runtime.createProjectSourceRuntimeState();
  runtimeState = runtime.linkExactSourceRuntimeAsset(runtimeState, project, source.id, {
    name: 'source.gltf', sha256: source.sha256, objectUrl: 'blob:source', inspection: inspection('non-rigid-ancestor'),
  });
  assert.throws(
    () => runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', 'gltf2.node:hardpoint'),
    /not rigid-compatible/,
  );
});
