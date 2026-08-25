import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  createProjectSourceRuntimeState,
  linkExactSourceRuntimeAsset,
  resolveExactPlacedSourceDatum,
} from '../.core-dist/app/state/project-source-runtime.js';
import { resolveRigDocument } from '../.core-dist/kernel/resolve.js';
import { parseJureProjectModel, serializeJureProjectModel } from '../.core-dist/project/serialize.js';
import { inspectGltfSource } from '../.core-dist/source/gltf-source-index.js';

const candidatePath = process.env.JURE_CANDIDATE_PROJECT_PATH;
if (!candidatePath) throw new Error('JURE_CANDIDATE_PROJECT_PATH is required.');
const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');

const EXPECTED_SOURCE_SHA256 = '57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750';
const EXPECTED_SOURCE_SIZE = 64264;
const EXPECTED_SOURCE_REVISION_ID = 'source.real-jv.one-sided';
const EXPECTED_SOURCE_INSTANCE_ID = 'source-instance.real-jv.fl';
const EXPECTED_PROJECT_ID = 'project.real-jv-coherent-wishbone';
const EXPECTED_DOCUMENT_ID = 'rig.real-jv-coherent-wishbone';

const EXPECTED_ELEMENTS = new Map([
  ['element.chassis-reference', null],
  ['element.upper-arm', 'gltf2.node:3'],
  ['element.lower-arm', 'gltf2.node:5'],
  ['element.suspension-carrier-reference', 'gltf2.node:6'],
]);

const EXPECTED_FRAME_OWNERS = new Map([
  ['frame.upper-arm.inboard', 'element.upper-arm'],
  ['frame.chassis.upper-inboard', 'element.chassis-reference'],
  ['frame.lower-arm.inboard', 'element.lower-arm'],
  ['frame.chassis.lower-inboard', 'element.chassis-reference'],
  ['frame.upper-arm.outboard', 'element.upper-arm'],
  ['frame.carrier.upper-outboard', 'element.suspension-carrier-reference'],
  ['frame.lower-arm.outboard', 'element.lower-arm'],
  ['frame.carrier.lower-outboard', 'element.suspension-carrier-reference'],
]);

const EXPECTED_RELATIONS = new Map([
  ['relation.upper-inboard-revolute', ['revolute', 'frame.upper-arm.inboard', 'frame.chassis.upper-inboard']],
  ['relation.lower-inboard-revolute', ['revolute', 'frame.lower-arm.inboard', 'frame.chassis.lower-inboard']],
  ['relation.upper-outboard-spherical', ['spherical', 'frame.upper-arm.outboard', 'frame.carrier.upper-outboard']],
  ['relation.lower-outboard-spherical', ['spherical', 'frame.lower-arm.outboard', 'frame.carrier.lower-outboard']],
]);

function rig(project) {
  const documents = project.authoredDocuments.filter((entry) => entry.kind === 'rig');
  if (documents.length !== 1) throw new Error(`Expected exactly one RigDocument; received ${documents.length}.`);
  return documents[0].document;
}

function close(actual, expected, label, tolerance = 1e-10) {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: ${actual} != ${expected}`);
  }
}

function closePose(actual, expected, label) {
  for (const axis of ['x', 'y', 'z']) close(actual.position[axis], expected.position[axis], `${label}.position.${axis}`);
  for (const axis of ['x', 'y', 'z', 'w']) close(actual.rotation[axis], expected.rotation[axis], `${label}.rotation.${axis}`);
}

const candidateText = readFileSync(candidatePath, 'utf8');
const project = parseJureProjectModel(candidateText);
const canonical = serializeJureProjectModel(project);
if (canonical !== candidateText) throw new Error('Candidate project file is not canonical byte-for-byte JURE serialization.');
if (project.projectId !== EXPECTED_PROJECT_ID) throw new Error(`Unexpected candidate projectId: ${project.projectId}.`);
if (project.sourceRevisions.length !== 1) throw new Error(`Expected one SourceRevision; received ${project.sourceRevisions.length}.`);
if (project.sourceInstances.length !== 1) throw new Error(`Expected one SourceInstance; received ${project.sourceInstances.length}.`);
if (project.sourceAdoptions.length !== 11) throw new Error(`Expected 11 exact SOURCE adoption receipts; received ${project.sourceAdoptions.length}.`);

const sourceRevision = project.sourceRevisions[0];
if (sourceRevision.id !== EXPECTED_SOURCE_REVISION_ID) throw new Error(`Unexpected SourceRevision id: ${sourceRevision.id}.`);
if (sourceRevision.sha256 !== EXPECTED_SOURCE_SHA256) throw new Error(`Unexpected candidate SourceRevision SHA-256: ${sourceRevision.sha256}.`);
const sourceInstance = project.sourceInstances[0];
if (sourceInstance.id !== EXPECTED_SOURCE_INSTANCE_ID || sourceInstance.sourceRevisionId !== EXPECTED_SOURCE_REVISION_ID) {
  throw new Error('Candidate SourceInstance does not reference the pinned exact SourceRevision.');
}

const document = rig(project);
if (document.documentId !== EXPECTED_DOCUMENT_ID) throw new Error(`Unexpected RigDocument id: ${document.documentId}.`);
if (document.elements.length !== 4) throw new Error(`Expected 4 elements; received ${document.elements.length}.`);
if (document.frames.length !== 8) throw new Error(`Expected 8 frames; received ${document.frames.length}.`);
if (document.relations.length !== 4) throw new Error(`Expected 4 relations; received ${document.relations.length}.`);

for (const [elementId, expectedLocator] of EXPECTED_ELEMENTS) {
  const element = document.elements.find((candidate) => candidate.id === elementId);
  if (!element) throw new Error(`Missing expected element ${elementId}.`);
  if (expectedLocator === null) {
    if (element.source) throw new Error(`${elementId} must remain an explicit Owner reference rather than pretend to be SOURCE-derived.`);
  } else if (element.source?.locator !== expectedLocator || element.source.sourceRevisionId !== EXPECTED_SOURCE_REVISION_ID) {
    throw new Error(`${elementId} lost its expected exact SOURCE provenance.`);
  }
}

for (const [frameId, ownerElementId] of EXPECTED_FRAME_OWNERS) {
  const frame = document.frames.find((candidate) => candidate.id === frameId);
  if (!frame) throw new Error(`Missing expected frame ${frameId}.`);
  if (frame.ownerElementId !== ownerElementId) throw new Error(`${frameId} owner changed to ${frame.ownerElementId}.`);
  if (!frame.source?.locator || frame.source.sourceRevisionId !== EXPECTED_SOURCE_REVISION_ID) {
    throw new Error(`${frameId} lost exact SOURCE frame provenance.`);
  }
}

for (const [relationId, [type, frameAId, frameBId]] of EXPECTED_RELATIONS) {
  const relation = document.relations.find((candidate) => candidate.id === relationId);
  if (!relation || relation.type !== type || relation.frameA !== frameAId || relation.frameB !== frameBId) {
    throw new Error(`Relation ${relationId} changed identity, type or endpoints.`);
  }
  const frameA = document.frames.find((candidate) => candidate.id === frameAId);
  const frameB = document.frames.find((candidate) => candidate.id === frameBId);
  if (!frameA?.source?.locator || frameA.source.locator !== frameB?.source?.locator) {
    throw new Error(`${relationId} no longer pairs two independently authored sides of one exact SOURCE locator.`);
  }
  const receipts = project.sourceAdoptions.filter((entry) => entry.source.locator === frameA.source.locator);
  if (receipts.length !== 2) throw new Error(`${relationId} expected exactly two adoption receipts for its physical joint locator; received ${receipts.length}.`);
}

const resolved = resolveRigDocument(document);
if (resolved.diagnostics.length !== 4) throw new Error(`Expected four relation diagnostics; received ${resolved.diagnostics.length}.`);
for (const [relationId, [type]] of EXPECTED_RELATIONS) {
  const diagnostic = resolved.diagnostics.find((candidate) => candidate.references.includes(relationId));
  if (!diagnostic || diagnostic.severity !== 'info' || diagnostic.code !== `relation.${type}.ok`) {
    throw new Error(`${relationId} is not neutral-clean in the persisted candidate.`);
  }
}

const sourceBytes = readFileSync(sourcePath);
if (sourceBytes.byteLength !== EXPECTED_SOURCE_SIZE) throw new Error(`Unexpected exact SOURCE size: ${sourceBytes.byteLength}.`);
const sourceHash = createHash('sha256').update(sourceBytes).digest('hex');
if (sourceHash !== EXPECTED_SOURCE_SHA256) throw new Error(`Unexpected exact SOURCE bytes: ${sourceHash}.`);
const arrayBuffer = sourceBytes.buffer.slice(sourceBytes.byteOffset, sourceBytes.byteOffset + sourceBytes.byteLength);
const inspection = inspectGltfSource(arrayBuffer);
if (JSON.stringify(inspection.adapter) !== JSON.stringify(sourceRevision.adapter)) {
  throw new Error('Candidate SourceRevision adapter does not match exact runtime SOURCE inspection.');
}

const runtime = linkExactSourceRuntimeAsset(createProjectSourceRuntimeState(), project, sourceRevision.id, {
  name: sourceRevision.uri,
  sha256: sourceHash,
  objectUrl: 'probe:real-jv-coherent-wishbone-candidate-file',
  inspection,
});

for (const frame of document.frames) {
  const sourceDatum = resolveExactPlacedSourceDatum(runtime, project, sourceInstance.id, frame.source.locator);
  const worldPose = resolved.frameWorldPoses.get(frame.id);
  if (!worldPose) throw new Error(`Frame ${frame.id} did not resolve to world space.`);
  closePose(worldPose, sourceDatum.sourceRevisionWorldPose, `${frame.id} exact relink world pose`);
}

console.log('REAL_JV_COHERENT_WISHBONE_CANDIDATE_FILE_PASS', JSON.stringify({
  projectId: project.projectId,
  documentId: document.documentId,
  elements: document.elements.length,
  frames: document.frames.length,
  relations: document.relations.length,
  sourceAdoptions: project.sourceAdoptions.length,
  sourceSha256: sourceHash,
  semanticStatus: 'candidate-file-proven-not-owner-accepted-ball-joint-authority',
}));
