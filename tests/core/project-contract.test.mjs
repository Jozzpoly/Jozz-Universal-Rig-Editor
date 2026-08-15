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
    { id: 'adopt.fl.wheel', sourceInstanceId: 'wheel.fl', locator: sourceDatum.locator, target: { documentId: rig.documentId, kind: 'frame', id: 'frame.fl.wheel' } },
    { id: 'adopt.fr.wheel', sourceInstanceId: 'wheel.fr', locator: sourceDatum.locator, target: { documentId: rig.documentId, kind: 'frame', id: 'frame.fr.wheel' } },
  ],
  authoredDocuments: [{ kind: 'rig', document: rig }],
});

test('one exact source revision can back four independent placed instances', () => {
  assert.deepEqual(validateJureProjectModel(project()).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('project adoption context distinguishes two placed instances using the same exact datum locator', () => {
  const candidate = project();
  assert.equal(candidate.sourceAdoptions[0].locator, candidate.sourceAdoptions[1].locator);
  assert.notEqual(candidate.sourceAdoptions[0].sourceInstanceId, candidate.sourceAdoptions[1].sourceInstanceId);
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('moving a source instance does not mutate authored frame truth', () => {
  const candidate = project();
  const authoredBefore = structuredClone(candidate.authoredDocuments[0].document.frames[0].pose);
  candidate.sourceInstances[0].pose = pose(20, 30, 40);
  assert.deepEqual(candidate.authoredDocuments[0].document.frames[0].pose, authoredBefore);
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('re-registering an adopted instance to another source revision fails closed against kernel provenance', () => {
  const candidate = project();
  candidate.sourceRevisions.push({ ...wheelSource, id: 'source.wheel.rev-b', sha256: 'c'.repeat(64) });
  candidate.sourceInstances[0] = { ...candidate.sourceInstances[0], sourceRevisionId: 'source.wheel.rev-b' };
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.adoption.provenance.mismatch'));
});

test('replacing a source revision does not silently retarget existing instances', () => {
  const candidate = project();
  candidate.sourceRevisions = [{ ...wheelSource, id: 'source.wheel.rev-b', sha256: 'c'.repeat(64) }];
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.source-instance.revision.missing'));
  assert.ok(codes.includes('project.authored.source.missing'));
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
