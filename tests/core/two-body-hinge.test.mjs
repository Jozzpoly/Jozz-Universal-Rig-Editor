import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/project-source-runtime.js');
const { adoptSourceDatumAsElement } = await import('../../.core-dist/project/source-element-adoption.js');
const { adoptSourceDatumAsFrame } = await import('../../.core-dist/project/source-frame-adoption.js');
const { applyRigCommandToProject } = await import('../../.core-dist/project/commands.js');
const { createRigElement } = await import('../../.core-dist/features/rig-elements/command.js');
const { createOrthogonalCrossAxisFrameLocator } = await import('../../.core-dist/source/construction-frame-locator.js');
const { resolveRigDocument } = await import('../../.core-dist/kernel/resolve.js');
const { relationPrimaryAxisWorld } = await import('../../.core-dist/kernel/relation-frame.js');
const { parseJureProjectModel, serializeJureProjectModel } = await import('../../.core-dist/project/serialize.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = {
  id: 'source.real-jv',
  label: 'Real JV one-sided fixture',
  uri: 'OneSided_Steering_Suspension_Rig.gltf',
  sha256: '5'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.two-body-hinge',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [source],
    sourceInstances: [{ id: 'source-instance.fl', name: 'Front left', sourceRevisionId: source.id, pose: pose(10, 2, -3) }],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.vehicle',
      revision: 0,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [],
      frames: [],
      relations: [],
    } }],
  };
}

function exactInspection() {
  return {
    adapter: source.adapter,
    nodeCount: 3,
    meshCount: 1,
    skinCount: 1,
    jointCount: 3,
    nodes: [
      {
        locator: 'gltf2.node:5', index: 5, name: 'Chassis_Bottom', parentLocator: 'gltf2.node:13', childCount: 1, hasMesh: false, isSkinJoint: true,
        localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(1.40625, -1.78125, 0.0625), worldRigidPose: pose(0.40625, 0.03125, 0), rigidCompatibility: 'rigid',
      },
      {
        locator: 'gltf2.node:11', index: 11, name: 'Axis_SuspensionTravel_Top', parentLocator: 'gltf2.node:13', childCount: 0, hasMesh: false, isSkinJoint: true,
        localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(-0.1875, -0.3125, 0.0625), worldRigidPose: pose(-1.1875, 1.5, 0), rigidCompatibility: 'rigid',
      },
      {
        locator: 'gltf2.node:12', index: 12, name: 'Axis_SuspensionTravel_Bottom', parentLocator: 'gltf2.node:13', childCount: 0, hasMesh: false, isSkinJoint: true,
        localScale: { x: 1, y: 1, z: 1 }, localRigidPose: pose(-0.1875, -2.3125, 0.0625), worldRigidPose: pose(-1.1875, -0.5, 0), rigidCompatibility: 'rigid',
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

function rig(project) {
  return project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
}

test('one physical SOURCE hinge can be authored independently on two bodies with coincident world frames and aligned +Z', () => {
  let project = projectFixture();
  const inspection = exactInspection();
  const runtimeState = runtime.linkExactSourceRuntimeAsset(runtime.createProjectSourceRuntimeState(), project, source.id, {
    name: source.uri,
    sha256: source.sha256,
    objectUrl: 'probe:two-body-hinge',
    inspection,
  });

  const lowerArmDatum = runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', 'gltf2.node:5');
  project = adoptSourceDatumAsElement({
    rigDocumentId: 'rig.vehicle',
    elementId: 'element.lower-arm',
    elementName: 'Lower arm',
    adoptionId: 'adopt.lower-arm',
    sourceDatum: lowerArmDatum,
  }).apply(project);

  project = applyRigCommandToProject('rig.vehicle', createRigElement({
    id: 'element.chassis',
    name: 'Owner chassis reference',
  })).apply(project);

  const hingeLocator = createOrthogonalCrossAxisFrameLocator({
    originPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max',
    radialEndpointPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min',
    upStartNodeLocator: 'gltf2.node:12',
    upEndNodeLocator: 'gltf2.node:11',
  });
  const hingeDatum = runtime.resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.fl', hingeLocator);

  project = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle',
    frameId: 'frame.lower-arm.hinge',
    frameName: 'Lower hinge · arm side',
    ownerElementId: 'element.lower-arm',
    adoptionId: 'adopt.lower-arm.hinge',
    sourceDatum: hingeDatum,
  }).apply(project);
  project = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle',
    frameId: 'frame.chassis.lower-hinge',
    frameName: 'Lower hinge · chassis side',
    ownerElementId: 'element.chassis',
    adoptionId: 'adopt.chassis.lower-hinge',
    sourceDatum: hingeDatum,
  }).apply(project);

  const document = rig(project);
  const lowerArm = document.elements.find((element) => element.id === 'element.lower-arm');
  const chassis = document.elements.find((element) => element.id === 'element.chassis');
  const armFrame = document.frames.find((frame) => frame.id === 'frame.lower-arm.hinge');
  const chassisFrame = document.frames.find((frame) => frame.id === 'frame.chassis.lower-hinge');
  assert.ok(lowerArm && chassis && armFrame && chassisFrame);

  assert.deepEqual(lowerArm.pose, pose(10.40625, 2.03125, -3));
  assert.deepEqual(chassis.pose, pose());
  assert.deepEqual(armFrame.pose, pose(0.09375, 0, 0));
  assert.deepEqual(chassisFrame.pose, pose(10.5, 2.03125, -3));
  assert.equal(armFrame.source.locator, hingeLocator);
  assert.equal(chassisFrame.source.locator, hingeLocator);

  const resolved = resolveRigDocument(document);
  const armWorld = resolved.frameWorldPoses.get(armFrame.id);
  const chassisWorld = resolved.frameWorldPoses.get(chassisFrame.id);
  assert.deepEqual(armWorld, hingeDatum.sourceRevisionWorldPose && pose(10.5, 2.03125, -3));
  assert.deepEqual(chassisWorld, armWorld);
  assert.deepEqual(relationPrimaryAxisWorld(armWorld), { x: 0, y: 0, z: 1 });
  assert.deepEqual(relationPrimaryAxisWorld(chassisWorld), { x: 0, y: 0, z: 1 });

  const reopened = parseJureProjectModel(serializeJureProjectModel(project));
  const reopenedRig = rig(reopened);
  const reopenedArmFrame = reopenedRig.frames.find((frame) => frame.id === armFrame.id);
  const reopenedChassisFrame = reopenedRig.frames.find((frame) => frame.id === chassisFrame.id);
  assert.equal(reopenedArmFrame.source.locator, hingeLocator);
  assert.equal(reopenedChassisFrame.source.locator, hingeLocator);
  assert.equal(reopened.sourceAdoptions.filter((adoption) => adoption.source.locator === hingeLocator).length, 2);
});
