import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');
const { adoptSourceDatumAsFrame } = await import('../../.core-dist/project/source-frame-adoption.js');
const { createOrthogonalCrossAxisFrameLocator } = await import('../../.core-dist/source/construction-frame-locator.js');
const { parseJureProjectModel, serializeJureProjectModel } = await import('../../.core-dist/project/serialize.js');

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

function constructionInspection() {
  return {
    adapter: source.adapter, nodeCount: 2, meshCount: 1, skinCount: 1, jointCount: 2,
    nodes: [
      {
        locator: 'gltf2.node:11', index: 11, name: 'Axis_SuspensionTravel_Top', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: true,
        localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(0, 1, 0), worldRigidPose: pose(0, 1, 0), rigidCompatibility: 'rigid',
      },
      {
        locator: 'gltf2.node:12', index: 12, name: 'Axis_SuspensionTravel_Bottom', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: true,
        localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(0, 0, 0), worldRigidPose: pose(0, 0, 0), rigidCompatibility: 'rigid',
      },
    ],
    derivedPointDatums: [
      {
        locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max', name: 'Chassis_Bottom X max', sourceNodeLocator: 'gltf2.node:5', sourceNodeName: 'Chassis_Bottom',
        sourceRevisionWorldPosition: { x: 0.5, y: 0.03125, z: 0 },
        derivation: { algorithm: 'rigid-geometry-x-end-v1', side: 'max', boundsMin: { x: -0.8125, y: 0, z: 0 }, boundsMax: { x: 0.5, y: 0.0625, z: 0 }, triangleCount: 12 },
      },
      {
        locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min', name: 'Chassis_Bottom X min', sourceNodeLocator: 'gltf2.node:5', sourceNodeName: 'Chassis_Bottom',
        sourceRevisionWorldPosition: { x: -0.8125, y: 0.03125, z: 0 },
        derivation: { algorithm: 'rigid-geometry-x-end-v1', side: 'min', boundsMin: { x: -0.8125, y: 0, z: 0 }, boundsMax: { x: 0.5, y: 0.0625, z: 0 }, triangleCount: 12 },
      },
    ],
  };
}

function linkedRuntime(project, exactInspection) {
  return runtime.linkExactSourceRuntimeAsset(runtime.createProjectSourceRuntimeState(), project, source.id, {
    name: 'source.gltf', sha256: source.sha256, objectUrl: 'blob:source', inspection: exactInspection,
  });
}

test('only exact linked runtime bytes resolve a placed datum that can cross into authored truth', () => {
  const project = projectFixture();
  const runtimeState = linkedRuntime(project, inspection());

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

test('self-resolving construction frame locator crosses exact runtime, adoption and save/open/relink without a side recipe database', () => {
  const project = projectFixture();
  const exactInspection = constructionInspection();
  const locator = createOrthogonalCrossAxisFrameLocator({
    originPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max',
    radialEndpointPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min',
    upStartNodeLocator: 'gltf2.node:12',
    upEndNodeLocator: 'gltf2.node:11',
  });

  const runtimeState = linkedRuntime(project, exactInspection);
  const datum = runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', locator);
  assert.deepEqual(datum.sourceRevisionWorldPose, pose(0.5, 0.03125, 0));
  assert.equal(datum.locator, locator);

  const adopted = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle', frameId: 'frame.lower-hinge', frameName: 'Lower wishbone hinge', ownerElementId: null,
    adoptionId: 'adopt.lower-hinge', sourceDatum: datum,
  }).apply(project);
  const adoptedRig = adopted.authoredDocuments.find((entry) => entry.kind === 'rig').document;
  assert.deepEqual(adoptedRig.frames[0].pose, pose(10.5, 0.03125, 0));
  assert.equal(adoptedRig.frames[0].source.locator, locator);
  assert.equal(adopted.sourceAdoptions[0].source.locator, locator);

  const reopened = parseJureProjectModel(serializeJureProjectModel(adopted));
  const reopenedRig = reopened.authoredDocuments.find((entry) => entry.kind === 'rig').document;
  assert.equal(reopenedRig.frames[0].source.locator, locator);
  assert.equal(reopened.sourceAdoptions[0].source.locator, locator);

  const relinkedRuntime = linkedRuntime(reopened, exactInspection);
  const reResolved = runtime.resolveExactPlacedSourceDatum(relinkedRuntime, reopened, 'source-instance.fl', locator);
  assert.deepEqual(reResolved, datum);
});

test('constructed exact datum resolution fails closed when a persisted recipe component is absent after relink', () => {
  const project = projectFixture();
  const exactInspection = constructionInspection();
  exactInspection.derivedPointDatums = exactInspection.derivedPointDatums.slice(0, 1);
  const locator = createOrthogonalCrossAxisFrameLocator({
    originPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max',
    radialEndpointPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min',
    upStartNodeLocator: 'gltf2.node:12',
    upEndNodeLocator: 'gltf2.node:11',
  });
  const runtimeState = linkedRuntime(project, exactInspection);
  assert.throws(
    () => runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', locator),
    /radial endpoint.*not present/i,
  );
});

test('non-rigid inspection cannot produce ExactPlacedSourceDatum', () => {
  const project = projectFixture();
  const runtimeState = linkedRuntime(project, inspection('non-rigid-ancestor'));
  assert.throws(
    () => runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', 'gltf2.node:hardpoint'),
    /not rigid-compatible/,
  );
});
