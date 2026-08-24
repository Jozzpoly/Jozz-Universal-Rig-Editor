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
    projectId: 'project.real-jv-outboard-grounding',
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
        documentId: 'rig.real-jv-outboard-grounding',
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
  if (!document) throw new Error('Outboard grounding project lost its RigDocument.');
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

function outboardCandidateLocator(sourceNodeLocator, upStartNodeLocator, upEndNodeLocator) {
  // Current exact-JV evidence establishes max-X as chassis/inboard and min-X as
  // wheel/outboard for this pinned unmirrored left SOURCE. This locator records
  // only the geometric candidate. It does NOT promote the point to ball-joint
  // semantics; that is a later Owner/mechanism decision.
  return createOrthogonalCrossAxisFrameLocator({
    originPointLocator: pointLocator(sourceNodeLocator, 'min'),
    radialEndpointPointLocator: pointLocator(sourceNodeLocator, 'max'),
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
const wheelCenterNode = exactNode('Socket_WheelCenter');
const upStartNode = exactNode('Axis_SuspensionTravel_Bottom');
const upEndNode = exactNode('Axis_SuspensionTravel_Top');

const upperLocator = outboardCandidateLocator(upperNode.locator, upStartNode.locator, upEndNode.locator);
const lowerLocator = outboardCandidateLocator(lowerNode.locator, upStartNode.locator, upEndNode.locator);
const upperCandidate = resolveOrthogonalCrossAxisFrameLocator(inspection, upperLocator, 'Upper outboard geometry candidate');
const lowerCandidate = resolveOrthogonalCrossAxisFrameLocator(inspection, lowerLocator, 'Lower outboard geometry candidate');

// Independent exact-SOURCE shape checks. These establish a coherent upright-like
// geometry around Socket_WheelCenter without claiming spherical/ball-joint truth.
close(upperCandidate.sourceRevisionWorldPose.position.x, lowerCandidate.sourceRevisionWorldPose.position.x, 'candidate shared X');
close(upperCandidate.sourceRevisionWorldPose.position.z, lowerCandidate.sourceRevisionWorldPose.position.z, 'candidate shared Z');
close(wheelCenterNode.worldRigidPose.position.y,
  0.5 * (upperCandidate.sourceRevisionWorldPose.position.y + lowerCandidate.sourceRevisionWorldPose.position.y),
  'wheel center vertical midpoint');
close(wheelCenterNode.worldRigidPose.position.z, upperCandidate.sourceRevisionWorldPose.position.z, 'wheel center shared Z');
if (!(upperCandidate.sourceRevisionWorldPose.position.y > wheelCenterNode.worldRigidPose.position.y
  && lowerCandidate.sourceRevisionWorldPose.position.y < wheelCenterNode.worldRigidPose.position.y)) {
  throw new Error('Outboard candidates do not bracket Socket_WheelCenter vertically.');
}
if (!(wheelCenterNode.worldRigidPose.position.x < upperCandidate.sourceRevisionWorldPose.position.x)) {
  throw new Error('Socket_WheelCenter is not farther outboard than the wishbone geometry candidates on pinned SOURCE X.');
}
if (upperCandidate.derivation.orthogonalityError > 1e-10 || lowerCandidate.derivation.orthogonalityError > 1e-10) {
  throw new Error('Outboard construction candidate is not orthogonal on exact SOURCE evidence.');
}

console.log('REAL_JV_OUTBOARD_CANDIDATE_GEOMETRY_PASS', JSON.stringify({
  upper: { locator: upperLocator, pose: upperCandidate.sourceRevisionWorldPose, basis: upperCandidate.basis },
  lower: { locator: lowerLocator, pose: lowerCandidate.sourceRevisionWorldPose, basis: lowerCandidate.basis },
  wheelCenter: { locator: wheelCenterNode.locator, pose: wheelCenterNode.worldRigidPose },
  semanticStatus: 'geometry-candidate-not-spherical-authority',
}));

let project = projectFixture();
const runtime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), project, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-outboard-source',
  inspection,
});

const upperElementDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', upperNode.locator);
project = adoptSourceDatumAsElement({
  rigDocumentId: 'rig.real-jv-outboard-grounding',
  elementId: 'element.upper-arm',
  elementName: 'Upper arm',
  adoptionId: 'adopt.upper-arm',
  sourceDatum: upperElementDatum,
}).apply(project);
const lowerElementDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', lowerNode.locator);
project = adoptSourceDatumAsElement({
  rigDocumentId: 'rig.real-jv-outboard-grounding',
  elementId: 'element.lower-arm',
  elementName: 'Lower arm',
  adoptionId: 'adopt.lower-arm',
  sourceDatum: lowerElementDatum,
}).apply(project);
const carrierElementDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', wheelCenterNode.locator);
project = adoptSourceDatumAsElement({
  rigDocumentId: 'rig.real-jv-outboard-grounding',
  elementId: 'element.carrier-reference',
  elementName: 'Carrier reference from Socket_WheelCenter',
  adoptionId: 'adopt.carrier-reference',
  sourceDatum: carrierElementDatum,
}).apply(project);

const upperDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', upperLocator);
const lowerDatum = resolveExactPlacedSourceDatum(runtime, project, 'source-instance.real-jv.fl', lowerLocator);
for (const input of [
  ['frame.upper-outboard.arm', 'Upper outboard · arm side', 'element.upper-arm', 'adopt.upper-outboard.arm', upperDatum],
  ['frame.upper-outboard.carrier', 'Upper outboard · carrier side', 'element.carrier-reference', 'adopt.upper-outboard.carrier', upperDatum],
  ['frame.lower-outboard.arm', 'Lower outboard · arm side', 'element.lower-arm', 'adopt.lower-outboard.arm', lowerDatum],
  ['frame.lower-outboard.carrier', 'Lower outboard · carrier side', 'element.carrier-reference', 'adopt.lower-outboard.carrier', lowerDatum],
]) {
  const [frameId, frameName, ownerElementId, adoptionId, sourceDatum] = input;
  project = adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.real-jv-outboard-grounding',
    frameId,
    frameName,
    ownerElementId,
    adoptionId,
    sourceDatum,
  }).apply(project);
}

let document = rig(project);
const resolved = resolveRigDocument(document);
for (const [label, armFrameId, carrierFrameId, sourcePose] of [
  ['upper', 'frame.upper-outboard.arm', 'frame.upper-outboard.carrier', upperCandidate.sourceRevisionWorldPose],
  ['lower', 'frame.lower-outboard.arm', 'frame.lower-outboard.carrier', lowerCandidate.sourceRevisionWorldPose],
]) {
  const armFrame = document.frames.find((frame) => frame.id === armFrameId);
  const carrierFrame = document.frames.find((frame) => frame.id === carrierFrameId);
  if (!armFrame || !carrierFrame) throw new Error(`${label} outboard ownership lost one authored side.`);
  if (armFrame.source?.locator !== carrierFrame.source?.locator) throw new Error(`${label} outboard sides do not preserve one physical SOURCE locator.`);
  const armWorld = resolved.frameWorldPoses.get(armFrameId);
  const carrierWorld = resolved.frameWorldPoses.get(carrierFrameId);
  if (!armWorld || !carrierWorld) throw new Error(`${label} outboard authored sides did not resolve.`);
  closePose(armWorld, carrierWorld, `${label} coincident authored world frame`);
  closePose(armWorld, sourcePose, `${label} exact SOURCE candidate world frame`);
  if (JSON.stringify(armFrame.pose) === JSON.stringify(carrierFrame.pose)) {
    throw new Error(`${label} outboard sides unexpectedly share identical owner-local poses.`);
  }
}

const serialized = serializeJureProjectModel(project);
const reopened = parseJureProjectModel(serialized);
document = rig(reopened);
if (document.elements.length !== 3) throw new Error(`Expected 3 authored outboard grounding elements after reopen; received ${document.elements.length}.`);
if (document.frames.length !== 4) throw new Error(`Expected 4 authored outboard grounding frames after reopen; received ${document.frames.length}.`);
if (document.relations.length !== 0) throw new Error('Outboard grounding probe must not create mechanical relations.');
if (reopened.sourceAdoptions.length !== 7) throw new Error(`Expected 7 exact SOURCE adoption records after reopen; received ${reopened.sourceAdoptions.length}.`);
for (const locator of [upperLocator, lowerLocator]) {
  const frames = document.frames.filter((frame) => frame.source?.locator === locator);
  if (frames.length !== 2) throw new Error(`Expected two persisted authored sides for ${locator}; received ${frames.length}.`);
  const adoptions = reopened.sourceAdoptions.filter((entry) => entry.source.locator === locator);
  if (adoptions.length !== 2) throw new Error(`Expected two persisted adoption receipts for ${locator}; received ${adoptions.length}.`);
}

const relinkedRuntime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), reopened, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-outboard-source-relinked',
  inspection,
});
const relinkedUpper = resolveExactPlacedSourceDatum(relinkedRuntime, reopened, 'source-instance.real-jv.fl', upperLocator);
const relinkedLower = resolveExactPlacedSourceDatum(relinkedRuntime, reopened, 'source-instance.real-jv.fl', lowerLocator);
closePose(relinkedUpper.sourceRevisionWorldPose, upperCandidate.sourceRevisionWorldPose, 'relinked upper candidate');
closePose(relinkedLower.sourceRevisionWorldPose, lowerCandidate.sourceRevisionWorldPose, 'relinked lower candidate');

console.log('REAL_JV_OUTBOARD_CANDIDATE_OWNERSHIP_PASS', JSON.stringify({
  upperLocator,
  lowerLocator,
  carrierLocator: wheelCenterNode.locator,
  authoredElements: document.elements.map((element) => element.id),
  authoredFrames: document.frames.map((frame) => frame.id),
  sourceAdoptions: reopened.sourceAdoptions.length,
  semanticStatus: 'ready-for-spherical-semantic-review-not-yet-a-relation',
}));
