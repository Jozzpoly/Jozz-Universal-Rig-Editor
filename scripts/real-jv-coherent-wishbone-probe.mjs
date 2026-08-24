import { readFileSync } from 'node:fs';
import { inspectGltfSource } from '../.core-dist/source/gltf-source-index.js';
import {
  createOrthogonalCrossAxisFrameLocator,
  resolveOrthogonalCrossAxisFrameLocator,
} from '../.core-dist/source/construction-frame-locator.js';
import {
  createProjectSourceRuntimeState,
  linkExactSourceRuntimeAsset,
  resolveExactPlacedSourceDatum,
} from '../.core-dist/app/state/project-source-runtime.js';
import { adoptSourceDatumAsElement } from '../.core-dist/project/source-element-adoption.js';
import { adoptSourceDatumAsFrame } from '../.core-dist/project/source-frame-adoption.js';
import { applyRigCommandToProject } from '../.core-dist/project/commands.js';
import { createRigElement } from '../.core-dist/features/rig-elements/command.js';
import { createRevoluteRelation } from '../.core-dist/features/rig-relations/create-revolute.js';
import { createSphericalRelation } from '../.core-dist/features/rig-relations/create-spherical.js';
import { resolveRigDocument } from '../.core-dist/kernel/resolve.js';
import { parseJureProjectModel, serializeJureProjectModel } from '../.core-dist/project/serialize.js';

const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');
const bytes = readFileSync(sourcePath);
const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const inspection = inspectGltfSource(arrayBuffer);
const points = inspection.derivedPointDatums ?? [];

const sourceRevision = {
  id: 'source.real-jv.one-sided',
  label: 'Real JV one-sided steering/suspension',
  uri: 'OneSided_Steering_Suspension_Rig.gltf',
  sha256: '57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750',
  adapter: inspection.adapter,
};
const identityPose = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
};

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.real-jv-coherent-wishbone',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceRevision],
    sourceInstances: [{
      id: 'source-instance.real-jv.fl',
      name: 'Real JV front-left SOURCE',
      sourceRevisionId: sourceRevision.id,
      pose: identityPose,
    }],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{
      kind: 'rig',
      document: {
        schemaVersion: 1,
        documentId: 'rig.real-jv-coherent-wishbone',
        revision: 0,
        units: 'm-rad',
        coordinateSystem: { handedness: 'right', upAxis: 'Y' },
        sources: [],
        elements: [],
        frames: [],
        relations: [],
      },
    }],
  };
}

function rig(project) {
  const document = project.authoredDocuments.find((entry) => entry.kind === 'rig')?.document;
  if (!document) throw new Error('Coherent wishbone project lost its RigDocument.');
  return document;
}

function exactNode(name) {
  const node = inspection.nodes.find((candidate) => candidate.name === name);
  if (!node?.worldRigidPose || node.rigidCompatibility !== 'rigid') throw new Error(`Missing exact rigid SOURCE node ${name}.`);
  return node;
}

function pointLocator(sourceNodeLocator, side) {
  const datum = points.find((candidate) => candidate.sourceNodeLocator === sourceNodeLocator && candidate.derivation.side === side);
  if (!datum) throw new Error(`Missing derived ${side} X-end for ${sourceNodeLocator}.`);
  return datum.locator;
}

function constructedLocator(sourceNodeLocator, originSide, radialSide, upStartNodeLocator, upEndNodeLocator) {
  return createOrthogonalCrossAxisFrameLocator({
    originPointLocator: pointLocator(sourceNodeLocator, originSide),
    radialEndpointPointLocator: pointLocator(sourceNodeLocator, radialSide),
    upStartNodeLocator,
    upEndNodeLocator,
  });
}

function close(actual, expected, label, tolerance = 1e-10) {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${label}: ${actual} != ${expected}`);
}

function closeVec(actual, expected, label, tolerance = 1e-10) {
  close(actual.x, expected.x, `${label}.x`, tolerance);
  close(actual.y, expected.y, `${label}.y`, tolerance);
  close(actual.z, expected.z, `${label}.z`, tolerance);
}

function closePose(actual, expected, label, tolerance = 1e-10) {
  closeVec(actual.position, expected.position, `${label}.position`, tolerance);
  close(actual.rotation.x, expected.rotation.x, `${label}.rotation.x`, tolerance);
  close(actual.rotation.y, expected.rotation.y, `${label}.rotation.y`, tolerance);
  close(actual.rotation.z, expected.rotation.z, `${label}.rotation.z`, tolerance);
  close(actual.rotation.w, expected.rotation.w, `${label}.rotation.w`, tolerance);
}

const upperNode = exactNode('Chassis_Top');
const lowerNode = exactNode('Chassis_Bottom');
const carrierReferenceNode = exactNode('Socket_ChassisMount_b');
const steerableReferenceNode = exactNode('Socket_WheelCenter');
const upStartNode = exactNode('Axis_SuspensionTravel_Bottom');
const upEndNode = exactNode('Axis_SuspensionTravel_Top');
if (carrierReferenceNode.locator === steerableReferenceNode.locator) throw new Error('Suspension-side and steerable SOURCE roles collapsed to one locator.');

const upperInboardLocator = constructedLocator(upperNode.locator, 'max', 'min', upStartNode.locator, upEndNode.locator);
const lowerInboardLocator = constructedLocator(lowerNode.locator, 'max', 'min', upStartNode.locator, upEndNode.locator);
const upperOutboardLocator = constructedLocator(upperNode.locator, 'min', 'max', upStartNode.locator, upEndNode.locator);
const lowerOutboardLocator = constructedLocator(lowerNode.locator, 'min', 'max', upStartNode.locator, upEndNode.locator);

const exactFrames = new Map([
  [upperInboardLocator, resolveOrthogonalCrossAxisFrameLocator(inspection, upperInboardLocator, 'Upper inboard hinge')],
  [lowerInboardLocator, resolveOrthogonalCrossAxisFrameLocator(inspection, lowerInboardLocator, 'Lower inboard hinge')],
  [upperOutboardLocator, resolveOrthogonalCrossAxisFrameLocator(inspection, upperOutboardLocator, 'Upper outboard mating candidate')],
  [lowerOutboardLocator, resolveOrthogonalCrossAxisFrameLocator(inspection, lowerOutboardLocator, 'Lower outboard mating candidate')],
]);

closeVec(exactFrames.get(upperInboardLocator).sourceRevisionWorldPose.position, { x: 0.5, y: 0.96875, z: 0 }, 'upper inboard origin');
closeVec(exactFrames.get(lowerInboardLocator).sourceRevisionWorldPose.position, { x: 0.5, y: 0.03125, z: 0 }, 'lower inboard origin');
closeVec(exactFrames.get(upperOutboardLocator).sourceRevisionWorldPose.position, { x: -0.8125, y: 0.96875, z: 0 }, 'upper outboard candidate origin');
closeVec(exactFrames.get(lowerOutboardLocator).sourceRevisionWorldPose.position, { x: -0.8125, y: 0.03125, z: 0 }, 'lower outboard candidate origin');

let project = projectFixture();
let runtime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), project, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-coherent-wishbone-source',
  inspection,
});

for (const [elementId, elementName, adoptionId, node] of [
  ['element.upper-arm', 'Upper arm', 'adopt.upper-arm', upperNode],
  ['element.lower-arm', 'Lower arm', 'adopt.lower-arm', lowerNode],
  ['element.suspension-carrier-reference', 'Suspension-side carrier reference', 'adopt.suspension-carrier-reference', carrierReferenceNode],
]) {
  const sourceDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', node.locator);
  project = adoptSourceDatumAsElement({
    rigDocumentId: 'rig.real-jv-coherent-wishbone',
    elementId,
    elementName,
    adoptionId,
    sourceDatum,
  }).apply(project);
}
project = applyRigCommandToProject('rig.real-jv-coherent-wishbone', createRigElement({
  id: 'element.chassis-reference',
  name: 'Owner chassis reference',
})).apply(project);

runtime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), project, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-coherent-wishbone-source-authored',
  inspection,
});

const frameSpecs = [
  ['frame.upper-arm.inboard', 'Upper inboard · arm side', 'element.upper-arm', 'adopt.upper-arm.inboard', upperInboardLocator],
  ['frame.chassis.upper-inboard', 'Upper inboard · chassis side', 'element.chassis-reference', 'adopt.chassis.upper-inboard', upperInboardLocator],
  ['frame.lower-arm.inboard', 'Lower inboard · arm side', 'element.lower-arm', 'adopt.lower-arm.inboard', lowerInboardLocator],
  ['frame.chassis.lower-inboard', 'Lower inboard · chassis side', 'element.chassis-reference', 'adopt.chassis.lower-inboard', lowerInboardLocator],
  ['frame.upper-arm.outboard', 'Upper outboard · arm side', 'element.upper-arm', 'adopt.upper-arm.outboard', upperOutboardLocator],
  ['frame.carrier.upper-outboard', 'Upper outboard · carrier side', 'element.suspension-carrier-reference', 'adopt.carrier.upper-outboard', upperOutboardLocator],
  ['frame.lower-arm.outboard', 'Lower outboard · arm side', 'element.lower-arm', 'adopt.lower-arm.outboard', lowerOutboardLocator],
  ['frame.carrier.lower-outboard', 'Lower outboard · carrier side', 'element.suspension-carrier-reference', 'adopt.carrier.lower-outboard', lowerOutboardLocator],
];

for (const [frameId, frameName, ownerElementId, adoptionId, locator] of frameSpecs) {
  const sourceDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', locator);
  project = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.real-jv-coherent-wishbone',
    frameId,
    frameName,
    ownerElementId,
    adoptionId,
    sourceDatum,
  }).apply(project);
}

const relationSpecs = [
  ['relation.upper-inboard-revolute', 'revolute', 'frame.upper-arm.inboard', 'frame.chassis.upper-inboard'],
  ['relation.lower-inboard-revolute', 'revolute', 'frame.lower-arm.inboard', 'frame.chassis.lower-inboard'],
  ['relation.upper-outboard-spherical', 'spherical', 'frame.upper-arm.outboard', 'frame.carrier.upper-outboard'],
  ['relation.lower-outboard-spherical', 'spherical', 'frame.lower-arm.outboard', 'frame.carrier.lower-outboard'],
];

for (const [id, type, frameA, frameB] of relationSpecs) {
  const command = type === 'revolute'
    ? createRevoluteRelation({ id, frameA, frameB })
    : createSphericalRelation({ id, frameA, frameB });
  project = applyRigCommandToProject('rig.real-jv-coherent-wishbone', command).apply(project);
}

let document = rig(project);
if (document.elements.length !== 4) throw new Error(`Expected 4 authored mechanism elements; received ${document.elements.length}.`);
if (document.frames.length !== 8) throw new Error(`Expected 8 authored mechanism frames; received ${document.frames.length}.`);
if (document.relations.length !== 4) throw new Error(`Expected 4 neutral mechanism relations; received ${document.relations.length}.`);
if (project.sourceAdoptions.length !== 11) throw new Error(`Expected 11 exact SOURCE adoption records; received ${project.sourceAdoptions.length}.`);

const resolved = resolveRigDocument(document);
for (const [id, type, frameA, frameB] of relationSpecs) {
  const relation = document.relations.find((candidate) => candidate.id === id);
  if (!relation || relation.type !== type || relation.frameA !== frameA || relation.frameB !== frameB) {
    throw new Error(`Relation ${id} does not preserve the intended neutral topology.`);
  }
  const diagnostic = resolved.diagnostics.find((candidate) => candidate.references.includes(id));
  if (!diagnostic) throw new Error(`Relation ${id} produced no neutral diagnostic.`);
  if (diagnostic.severity !== 'info' || diagnostic.code !== `relation.${type}.ok`) {
    throw new Error(`Relation ${id} is not neutral-clean: ${diagnostic.code} ${diagnostic.message}`);
  }
  const residualM = Number(diagnostic.metrics.originResidualM ?? diagnostic.metrics.residualM);
  if (!Number.isFinite(residualM) || residualM > 1e-10) throw new Error(`${id} origin residual is not effectively zero: ${residualM}`);
  if (type === 'revolute') {
    const axisAngleRad = Number(diagnostic.metrics.axisAngleRad);
    if (!Number.isFinite(axisAngleRad) || axisAngleRad > 1e-10) throw new Error(`${id} axis residual is not effectively zero: ${axisAngleRad}`);
  }
}

for (const [label, frameAId, frameBId, locator] of [
  ['upper inboard', 'frame.upper-arm.inboard', 'frame.chassis.upper-inboard', upperInboardLocator],
  ['lower inboard', 'frame.lower-arm.inboard', 'frame.chassis.lower-inboard', lowerInboardLocator],
  ['upper outboard', 'frame.upper-arm.outboard', 'frame.carrier.upper-outboard', upperOutboardLocator],
  ['lower outboard', 'frame.lower-arm.outboard', 'frame.carrier.lower-outboard', lowerOutboardLocator],
]) {
  const frameA = document.frames.find((frame) => frame.id === frameAId);
  const frameB = document.frames.find((frame) => frame.id === frameBId);
  if (!frameA || !frameB) throw new Error(`${label} lost one authored side.`);
  if (frameA.source?.locator !== locator || frameB.source?.locator !== locator) throw new Error(`${label} lost its shared exact SOURCE locator.`);
  if (JSON.stringify(frameA.pose) === JSON.stringify(frameB.pose)) throw new Error(`${label} sides unexpectedly share identical owner-local poses.`);
  const worldA = resolved.frameWorldPoses.get(frameAId);
  const worldB = resolved.frameWorldPoses.get(frameBId);
  if (!worldA || !worldB) throw new Error(`${label} authored sides did not resolve.`);
  closePose(worldA, worldB, `${label} coincident world frames`);
  closePose(worldA, exactFrames.get(locator).sourceRevisionWorldPose, `${label} exact SOURCE world frame`);
}

const serialized = serializeJureProjectModel(project);
const reopened = parseJureProjectModel(serialized);
const serializedAgain = serializeJureProjectModel(reopened);
if (serializedAgain !== serialized) throw new Error('Coherent wishbone Save/Open roundtrip is not byte-deterministic.');
document = rig(reopened);
if (document.elements.length !== 4 || document.frames.length !== 8 || document.relations.length !== 4) {
  throw new Error('Coherent wishbone topology changed after Save/Open.');
}
if (reopened.sourceAdoptions.length !== 11) throw new Error('Coherent wishbone provenance changed after Save/Open.');

const relationIdentity = document.relations.map((relation) => `${relation.id}:${relation.type}:${relation.frameA}:${relation.frameB}`).sort();
const expectedRelationIdentity = relationSpecs.map(([id, type, frameA, frameB]) => `${id}:${type}:${frameA}:${frameB}`).sort();
if (JSON.stringify(relationIdentity) !== JSON.stringify(expectedRelationIdentity)) throw new Error('Coherent wishbone relation identity changed after Save/Open.');

const relinkedRuntime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), reopened, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-coherent-wishbone-source-relinked',
  inspection,
});
for (const locator of [upperInboardLocator, lowerInboardLocator, upperOutboardLocator, lowerOutboardLocator]) {
  const relinked = resolveExactPlacedSourceDatum(relinkedRuntime, reopened, 'source-instance.real-jv.fl', locator);
  closePose(relinked.sourceRevisionWorldPose, exactFrames.get(locator).sourceRevisionWorldPose, `relinked ${locator}`);
  const persistedFrames = document.frames.filter((frame) => frame.source?.locator === locator);
  if (persistedFrames.length !== 2) throw new Error(`Expected two persisted authored sides for ${locator}; received ${persistedFrames.length}.`);
  const adoptionReceipts = reopened.sourceAdoptions.filter((entry) => entry.source.locator === locator);
  if (adoptionReceipts.length !== 2) throw new Error(`Expected two persisted adoption receipts for ${locator}; received ${adoptionReceipts.length}.`);
}

const finalResolved = resolveRigDocument(document);
if (finalResolved.diagnostics.length !== 4 || finalResolved.diagnostics.some((diagnostic) => diagnostic.severity !== 'info')) {
  throw new Error('Coherent wishbone neutral diagnostics are not clean after Save/Open/relink.');
}

console.log('REAL_JV_COHERENT_WISHBONE_NEUTRAL_PASS', JSON.stringify({
  elements: document.elements.map((element) => element.id),
  frames: document.frames.map((frame) => ({ id: frame.id, ownerElementId: frame.ownerElementId, locator: frame.source?.locator ?? null })),
  relations: relationIdentity,
  diagnostics: finalResolved.diagnostics.map((diagnostic) => ({ code: diagnostic.code, metrics: diagnostic.metrics })),
  sourceAdoptions: reopened.sourceAdoptions.length,
  carrierReferenceLocator: carrierReferenceNode.locator,
  steerableReferenceLocator: steerableReferenceNode.locator,
  semanticStatus: 'neutral-mechanism-proven-with-outboard-mating-candidates-not-owner-accepted-ball-joint-truth',
}));
