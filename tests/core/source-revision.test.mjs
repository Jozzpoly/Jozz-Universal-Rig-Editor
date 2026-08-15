import test from 'node:test';
import assert from 'node:assert/strict';

const { createJureRigProject } = await import('../../.core-dist/project/create.js');
const { registerSourceRevision, findExactSourceRevision } = await import('../../.core-dist/project/source-revision.js');

const pose = () => ({ position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const rig = {
  schemaVersion: 1, documentId: 'rig.empty', revision: 0, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [], elements: [{ id: 'element.root', name: 'Root', pose: pose() }], frames: [], relations: [],
};
const sourceA = {
  id: 'source.rev-a', label: 'A', uri: 'a.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 },
};

test('registering the same exact source ID and identity is an idempotent no-op', () => {
  const project = createJureRigProject('project.source', rig);
  const once = registerSourceRevision(sourceA).apply(project);
  const twice = registerSourceRevision({ ...sourceA, label: 'Renamed label', uri: 'moved/a.gltf' }).apply(once);
  assert.equal(twice, once);
  assert.equal(twice.sourceRevisions.length, 1);
});

test('the same exact bytes and adapter cannot be registered again under a second revision ID', () => {
  const project = registerSourceRevision(sourceA).apply(createJureRigProject('project.source', rig));
  assert.throws(
    () => registerSourceRevision({ ...sourceA, id: 'source.rev-alias', label: 'Alias', uri: 'copy.gltf' }).apply(project),
    /already registered as source\.rev-a/,
  );
  assert.equal(project.sourceRevisions.length, 1);
  assert.equal(findExactSourceRevision(project, sourceA.sha256, sourceA.adapter).id, sourceA.id);
});

test('reusing a source ID for different exact bytes fails closed', () => {
  const project = registerSourceRevision(sourceA).apply(createJureRigProject('project.source', rig));
  assert.throws(
    () => registerSourceRevision({ ...sourceA, sha256: 'b'.repeat(64) }).apply(project),
    /different exact bytes or adapter identity/,
  );
});
