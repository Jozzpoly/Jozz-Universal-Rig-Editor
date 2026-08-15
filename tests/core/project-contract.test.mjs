import test from 'node:test';
import assert from 'node:assert/strict';
import { validateJureProjectModel } from '../../.core-dist/project/validate.js';

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const wheelSource = {
  id: 'source.wheel.rev-a', label: 'Wheel A', uri: 'sources/wheel.glb',
  sha256: 'a'.repeat(64), adapter: { id: 'gltf', version: 1 },
};
const sourceDatum = { sourceRevisionId: wheelSource.id, locator: 'node/0:WheelCenter' };
const rig = {
  schemaVersion: 1, documentId: 'rig.vehicle', revision: 0, units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' }, sources: [wheelSource], elements: [],
  frames: [
    { id: 'frame.fl.wheel', name: 'FL Wheel', ownerElementId: null, pose: pose(1, 0, -1), source: sourceDatum, provenance: { kind: 'source-proposal' } },
    { id: 'frame.fr.wheel', name: 'FR Wheel', ownerElementId: null, pose: pose(1, 0, 1), source: sourceDatum, provenance: { kind: 'source-proposal' } },
  ], relations: [],
};
const adoptionSource = (sourceInstanceId, sourceInstancePose) => ({
  sourceInstanceId,
  sourceRevisionId: wheelSource.id,
  sourceInstancePose,
  locator: sourceDatum.locator,
});
const project = () => ({
  schemaVersion: 1, projectId: 'project.jv-roundtrip', units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' }, sourceRevisions: [wheelSource],
  sourceInstances: [
    { id: 'wheel.fl', name: 'FL wheel', sourceRevisionId: wheelSource.id, pose: pose(1, 0, -1) },
    { id: 'wheel.fr', name: 'FR wheel', sourceRevisionId: wheelSource.id, pose: pose(1, 0, 1) },
    { id: 'wheel.rl', name: 'RL wheel', sourceRevisionId: wheelSource.id, pose: pose(-1, 0, -1) },
    { id: 'wheel.rr', name: 'RR wheel', sourceRevisionId: wheelSource.id, pose: pose(-1, 0, 1) },
  ],
  consumerReferences: [{ id: 'reference.jv.m6', label: 'JV M6 current reference', consumer: { id: 'jv-web', revision: 'f8eb0908f5934aed2d504f34ce483a02754039ec' }, payloadLocator: 'reference/jv-m6.json', payloadSha256: 'b'.repeat(64) }],
  sourceAdoptions: [
    { id: 'adopt.fl.wheel', source: adoptionSource('wheel.fl', pose(1, 0, -1)), target: { documentId: rig.documentId, kind: 'frame', id: 'frame.fl.wheel' } },
    { id: 'adopt.fr.wheel', source: adoptionSource('wheel.fr', pose(1, 0, 1)), target: { documentId: rig.documentId, kind: 'frame', id: 'frame.fr.wheel' } },
  ],
  authoredDocuments: [{ kind: 'rig', document: rig }],
});

test('one exact source revision can back four independent placed instances', () => {
  assert.deepEqual(validateJureProjectModel(project()).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('adoption snapshots distinguish two placed instances using the same exact datum locator', () => {
  const candidate = project();
  assert.equal(candidate.sourceAdoptions[0].source.locator, candidate.sourceAdoptions[1].source.locator);
  assert.notEqual(candidate.sourceAdoptions[0].source.sourceInstanceId, candidate.sourceAdoptions[1].source.sourceInstanceId);
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('moving a live source instance does not mutate authored truth or historical adoption placement', () => {
  const candidate = project();
  const authoredBefore = structuredClone(candidate.authoredDocuments[0].document.frames[0].pose);
  const adoptionPoseBefore = structuredClone(candidate.sourceAdoptions[0].source.sourceInstancePose);
  candidate.sourceInstances[0].pose = pose(20, 30, 40);
  assert.deepEqual(candidate.authoredDocuments[0].document.frames[0].pose, authoredBefore);
  assert.deepEqual(candidate.sourceAdoptions[0].source.sourceInstancePose, adoptionPoseBefore);
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('re-registering the live source instance does not rewrite an earlier adoption snapshot', () => {
  const candidate = project();
  candidate.sourceRevisions.push({ ...wheelSource, id: 'source.wheel.rev-b', sha256: 'c'.repeat(64) });
  candidate.sourceInstances[0] = { ...candidate.sourceInstances[0], sourceRevisionId: 'source.wheel.rev-b', pose: pose(9, 8, 7) };
  assert.equal(candidate.sourceAdoptions[0].source.sourceRevisionId, wheelSource.id);
  assert.deepEqual(candidate.sourceAdoptions[0].source.sourceInstancePose, pose(1, 0, -1));
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('historical adoption evidence survives removal of the current live source instance', () => {
  const candidate = project();
  candidate.sourceInstances = candidate.sourceInstances.filter((instance) => instance.id !== 'wheel.fl');
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('adoption snapshot requires its exact source revision to remain in project identity history', () => {
  const candidate = project();
  candidate.sourceRevisions = [];
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.adoption.source-revision.missing'));
  assert.ok(codes.includes('project.authored.source.missing'));
});

test('adoption snapshot fails closed when its exact revision or locator disagrees with authored provenance', () => {
  const candidate = project();
  candidate.sourceAdoptions[0].source.locator = 'node/999:Wrong';
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.adoption.provenance.mismatch'));
});

test('adoption snapshot rejects invalid historical placement pose', () => {
  const candidate = project();
  candidate.sourceAdoptions[0].source.sourceInstancePose.rotation.w = 2;
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.adoption.source-instance-pose.invalid'));
});

test('replacing a source revision does not silently retarget existing instances', () => {
  const candidate = project();
  candidate.sourceRevisions = [{ ...wheelSource, id: 'source.wheel.rev-b', sha256: 'c'.repeat(64) }];
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.source-instance.revision.missing'));
  assert.ok(codes.includes('project.authored.source.missing'));
  assert.ok(codes.includes('project.adoption.source-revision.missing'));
});

test('same source ID with changed exact bytes is rejected against authored provenance', () => {
  const candidate = project();
  candidate.sourceRevisions = [{ ...wheelSource, sha256: 'd'.repeat(64) }];
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.authored.source.mismatch'));
});

test('consumer reference remains top-level evidence and is not required by RigDocument', () => {
  const candidate = project();
  candidate.consumerReferences.push({ id: 'reference.alt', label: 'Alternative proposal', consumer: { id: 'experiment', revision: 'candidate-2' }, payloadLocator: 'reference/alt.json', payloadSha256: 'e'.repeat(64) });
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
  assert.equal(candidate.authoredDocuments[0].document.relations.length, 0);
});
