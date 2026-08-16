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
import { adoptSourceDatumAsFrame } from '../.core-dist/project/source-frame-adoption.js';
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
    projectId: 'project.real-jv-wishbone-probe',
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
        documentId: 'rig.real-jv-probe',
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

function pointLocator(sourceNodeLocator, side) {
  const datum = points.find((candidate) => candidate.sourceNodeLocator === sourceNodeLocator && candidate.derivation.side === side);
  if (!datum) throw new Error(`Missing derived ${side} X-end for ${sourceNodeLocator}.`);
  return datum.locator;
}

function exactNodeLocator(name) {
  const node = inspection.nodes.find((candidate) => candidate.name === name);
  if (!node?.worldRigidPose || node.rigidCompatibility !== 'rigid') throw new Error(`Missing exact rigid SOURCE node ${name}.`);
  return node.locator;
}

function close(actual, expected, label, tolerance = 1e-10) {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${label}: ${actual} != ${expected}`);
}

function closeVec(actual, expected, label, tolerance = 1e-10) {
  close(actual.x, expected.x, `${label}.x`, tolerance);
  close(actual.y, expected.y, `${label}.y`, tolerance);
  close(actual.z, expected.z, `${label}.z`, tolerance);
}

const upStartNodeLocator = exactNodeLocator('Axis_SuspensionTravel_Bottom');
const upEndNodeLocator = exactNodeLocator('Axis_SuspensionTravel_Top');

function wishboneLocator(sourceNodeLocator) {
  // Current JV S2 independently establishes max-X as the inboard/chassis end
  // and min-X as the wheel/outboard end for this exact unmirrored left SOURCE.
  // The locator persists that evidenced ordering without baking vehicle-specific
  // semantics into the generic construction-frame resolver.
  return createOrthogonalCrossAxisFrameLocator({
    originPointLocator: pointLocator(sourceNodeLocator, 'max'),
    radialEndpointPointLocator: pointLocator(sourceNodeLocator, 'min'),
    upStartNodeLocator,
    upEndNodeLocator,
  });
}

const upperLocator = wishboneLocator('gltf2.node:3');
const lowerLocator = wishboneLocator('gltf2.node:5');
const upper = resolveOrthogonalCrossAxisFrameLocator(inspection, upperLocator, 'Upper wishbone hinge frame');
const lower = resolveOrthogonalCrossAxisFrameLocator(inspection, lowerLocator, 'Lower wishbone hinge frame');

closeVec(upper.sourceRevisionWorldPose.position, { x: 0.5, y: 0.96875, z: 0 }, 'upper.origin');
closeVec(lower.sourceRevisionWorldPose.position, { x: 0.5, y: 0.03125, z: 0 }, 'lower.origin');
for (const [label, frame] of [['upper', upper], ['lower', lower]]) {
  closeVec(frame.basis.x, { x: 1, y: 0, z: 0 }, `${label}.basis.x`);
  closeVec(frame.basis.y, { x: 0, y: 1, z: 0 }, `${label}.basis.y`);
  closeVec(frame.basis.z, { x: 0, y: 0, z: 1 }, `${label}.basis.z`);
  close(frame.derivation.orthogonalityError, 0, `${label}.orthogonalityError`);
  close(frame.sourceRevisionWorldPose.rotation.x, 0, `${label}.rotation.x`);
  close(frame.sourceRevisionWorldPose.rotation.y, 0, `${label}.rotation.y`);
  close(frame.sourceRevisionWorldPose.rotation.z, 0, `${label}.rotation.z`);
  close(frame.sourceRevisionWorldPose.rotation.w, 1, `${label}.rotation.w`);
}

const project = projectFixture();
const runtimeState = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), project, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-source',
  inspection,
});
const upperDatum = resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.real-jv.fl', upperLocator);
const lowerDatum = resolveExactPlacedSourceDatum(runtimeState, project, 'source-instance.real-jv.fl', lowerLocator);
closeVec(upperDatum.sourceRevisionWorldPose.position, upper.sourceRevisionWorldPose.position, 'upper.runtime-reresolve');
closeVec(lowerDatum.sourceRevisionWorldPose.position, lower.sourceRevisionWorldPose.position, 'lower.runtime-reresolve');
if (upperDatum.locator !== upperLocator || lowerDatum.locator !== lowerLocator) throw new Error('Runtime re-resolution did not preserve construction recipe locators.');

const adopted = adoptSourceDatumAsFrame({
  rigDocumentId: 'rig.real-jv-probe',
  frameId: 'frame.lower-wishbone-hinge',
  frameName: 'Lower wishbone hinge',
  ownerElementId: null,
  adoptionId: 'adopt.lower-wishbone-hinge',
  sourceDatum: lowerDatum,
}).apply(project);
const reopened = parseJureProjectModel(serializeJureProjectModel(adopted));
const reopenedRig = reopened.authoredDocuments.find((entry) => entry.kind === 'rig')?.document;
const reopenedFrame = reopenedRig?.frames.find((frame) => frame.id === 'frame.lower-wishbone-hinge');
if (!reopenedFrame) throw new Error('Reopened project lost the adopted lower wishbone hinge frame.');
if (reopenedFrame.source?.locator !== lowerLocator) throw new Error('Reopened project lost the self-resolving lower hinge locator.');
if (reopened.sourceAdoptions[0]?.source.locator !== lowerLocator) throw new Error('Reopened project lost lower hinge adoption provenance.');

const relinkedRuntime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), reopened, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceRevision.sha256,
  objectUrl: 'probe:real-jv-source-relinked',
  inspection,
});
const relinkedLowerDatum = resolveExactPlacedSourceDatum(relinkedRuntime, reopened, 'source-instance.real-jv.fl', lowerLocator);
closeVec(relinkedLowerDatum.sourceRevisionWorldPose.position, lowerDatum.sourceRevisionWorldPose.position, 'lower.save-open-relink-reresolve');
if (relinkedLowerDatum.locator !== lowerLocator) throw new Error('Save/open/relink changed the lower hinge construction locator.');

console.log('REAL_JV_WISHBONE_RECIPE_RERESOLVE_PASS', JSON.stringify({
  upper: {
    locator: upperLocator,
    pose: upper.sourceRevisionWorldPose,
    basis: upper.basis,
    derivation: upper.derivation,
  },
  lower: {
    locator: lowerLocator,
    pose: lower.sourceRevisionWorldPose,
    basis: lower.basis,
    derivation: lower.derivation,
    persistedLocator: reopenedFrame.source.locator,
  },
}));
