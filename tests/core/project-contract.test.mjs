import test from 'node:test';
import assert from 'node:assert/strict';
import { validateJureProjectModel } from '../../.core-dist/project/validate.js';

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const wheelSource = {
  id: 'source.wheel.rev-a',
  label: 'Wheel A',
  uri: 'sources/wheel.glb',
  sha256: 'a'.repeat(64),
  adapter: { id: 'gltf', version: 1 },
};
const rig = {
  schemaVersion: 1,
  documentId: 'rig.vehicle',
  revision: 0,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [wheelSource],
  elements: [],
  frames: [],
  relations: [],
};
const project = () => ({
  schemaVersion: 1,
  projectId: 'project.jv-roundtrip',
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sourceRevisions: [wheelSource],
  sourceInstances: [
    { id: 'wheel.fl', name: 'FL wheel', sourceRevisionId: wheelSource.id, pose: pose(1, 0, -1) },
    { id: 'wheel.fr', name: 'FR wheel', sourceRevisionId: wheelSource.id, pose: pose(1, 0, 1) },
    { id: 'wheel.rl', name: 'RL wheel', sourceRevisionId: wheelSource.id, pose: pose(-1, 0, -1) },
    { id: 'wheel.rr', name: 'RR wheel', sourceRevisionId: wheelSource.id, pose: pose(-1, 0, 1) },
  ],
  consumerReferences: [{
    id: 'reference.jv.m6',
    label: 'JV M6 current reference',
    consumer: { id: 'jv-web', revision: 'f8eb0908f5934aed2d504f34ce483a02754039ec' },
    payloadLocator: 'reference/jv-m6.json',
    payloadSha256: 'b'.repeat(64),
  }],
  authoredDocuments: [{ kind: 'rig', document: rig }],
});

test('one exact source revision can back four independent placed instances', () => {
  assert.deepEqual(validateJureProjectModel(project()).filter((diagnostic) => diagnostic.severity === 'error'), []);
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
  candidate.consumerReferences.push({
    id: 'reference.alt',
    label: 'Alternative proposal',
    consumer: { id: 'experiment', revision: 'candidate-2' },
    payloadLocator: 'reference/alt.json',
    payloadSha256: 'e'.repeat(64),
  });
  assert.deepEqual(validateJureProjectModel(candidate).filter((diagnostic) => diagnostic.severity === 'error'), []);
  assert.equal(candidate.authoredDocuments[0].document.relations.length, 0);
});
