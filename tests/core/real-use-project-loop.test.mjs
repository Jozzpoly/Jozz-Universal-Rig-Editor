import test from 'node:test';
import assert from 'node:assert/strict';

const { createJureRigProject } = await import('../../.core-dist/project/create.js');
const sessionApi = await import('../../.core-dist/project/session.js');
const projectCommands = await import('../../.core-dist/project/commands.js');
const { registerSourceRevision, findExactSourceRevision } = await import('../../.core-dist/project/source-revision.js');
const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');
const { adoptSourceDatumAsFrame } = await import('../../.core-dist/project/source-frame-adoption.js');
const { serializeJureProjectModel, parseJureProjectModel } = await import('../../.core-dist/project/serialize.js');
const { validateJureProjectModel } = await import('../../.core-dist/project/validate.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = {
  id: 'source.one-sided.rev-a', label: 'One-sided suspension', uri: 'OneSided_Steering_Suspension_Rig.gltf',
  sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 },
};
const rig = {
  schemaVersion: 1, documentId: 'rig.vehicle', revision: 0, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [], elements: [{ id: 'element.lower-arm', name: 'Lower arm', pose: pose(5, 0, 0) }], frames: [], relations: [],
};
const inspection = {
  adapter: source.adapter, nodeCount: 1, meshCount: 0, skinCount: 0, jointCount: 0,
  nodes: [{
    locator: 'gltf2.node:lower-ball', index: 0, name: 'LowerBall', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false,
    localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(2, 0, 0), worldRigidPose: pose(2, 0, 0), rigidCompatibility: 'rigid',
  }],
};

test('real-use logical loop survives project save/reopen while runtime SOURCE bytes remain disposable', () => {
  let session = sessionApi.createProjectSession(createJureRigProject('project.real-use', rig));
  let runtimeState = runtime.createProjectSourceRuntimeState();

  session = sessionApi.applyProjectCommand(session, registerSourceRevision(source));
  assert.equal(findExactSourceRevision(session.committed, source.sha256, source.adapter).id, source.id);

  session = sessionApi.applyProjectCommand(session, projectCommands.addSourceInstance({
    id: 'source-instance.fl', name: 'FL suspension', sourceRevisionId: source.id, pose: pose(),
  }));

  runtimeState = runtime.linkExactSourceRuntimeAsset(runtimeState, session.committed, source.id, {
    name: 'OneSided_Steering_Suspension_Rig.gltf', sha256: source.sha256, objectUrl: 'blob:exact-source', inspection,
  });
  assert.equal(session.past.length, 2);

  session = sessionApi.applyProjectCommand(session, projectCommands.setSourceInstancePose('source-instance.fl', pose(10, 0, 0)));
  const datum = runtime.resolveExactPlacedSourceDatum(runtimeState, session.committed, 'source-instance.fl', 'gltf2.node:lower-ball');
  session = sessionApi.applyProjectCommand(session, adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle', frameId: 'frame.lower-ball', frameName: 'FL lower-ball', ownerElementId: 'element.lower-arm',
    adoptionId: 'adopt.lower-ball', sourceDatum: datum,
  }));

  assert.equal(session.past.length, 4);
  const savedText = serializeJureProjectModel(session.committed);
  assert.equal(savedText.includes('blob:exact-source'), false);
  const reopened = parseJureProjectModel(savedText);
  const reopenedRig = reopened.authoredDocuments.find((entry) => entry.kind === 'rig').document;

  assert.equal(reopened.sourceInstances[0].pose.position.x, 10);
  assert.equal(reopenedRig.frames[0].pose.position.x, 7);
  assert.equal(reopened.sourceAdoptions[0].source.sourceInstancePose.position.x, 10);
  assert.deepEqual(validateJureProjectModel(reopened).filter((diagnostic) => diagnostic.severity === 'error'), []);
  assert.equal(serializeJureProjectModel(reopened), savedText);
});
