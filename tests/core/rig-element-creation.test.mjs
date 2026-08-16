import test from 'node:test';
import assert from 'node:assert/strict';

const { createRigElement } = await import('../../.core-dist/features/rig-elements/command.js');
const { applyRigCommandToProject } = await import('../../.core-dist/project/commands.js');
const { createJureRigProject } = await import('../../.core-dist/project/create.js');
const { applyProjectCommand, createProjectSession, redoProject, undoProject } = await import('../../.core-dist/project/session.js');

const pose = (x = 0, y = 0, z = 0) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
});

function emptyRig() {
  return {
    schemaVersion: 1,
    documentId: 'rig.real-jv-corner',
    revision: 0,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [],
    frames: [],
    relations: [],
  };
}

test('createRigElement creates one independent authored rigid element without inventing SOURCE or consumer semantics', () => {
  const command = createRigElement({ id: 'element.upper-arm', name: 'Upper arm', pose: pose(1, 2, 3) });
  const next = command.apply(emptyRig());

  assert.deepEqual(next.elements, [{
    id: 'element.upper-arm',
    name: 'Upper arm',
    pose: pose(1, 2, 3),
  }]);
  assert.deepEqual(next.sources, []);
  assert.deepEqual(next.frames, []);
  assert.deepEqual(next.relations, []);
});

test('createRigElement defaults to authored identity pose and snapshots caller data', () => {
  const input = { id: 'element.knuckle', name: 'Knuckle' };
  const command = createRigElement(input);
  input.name = 'mutated outside command';

  const next = command.apply(emptyRig());
  assert.equal(next.elements[0].name, 'Knuckle');
  assert.deepEqual(next.elements[0].pose, pose());
});

test('createRigElement fails closed on empty identity/name and any document-wide ID collision', () => {
  assert.throws(() => createRigElement({ id: ' ', name: 'Upper arm' }), /ID must be non-empty/);
  assert.throws(() => createRigElement({ id: 'element.upper-arm', name: ' ' }), /name must be non-empty/);

  const collisionCases = [
    { ...emptyRig(), sources: [{ id: 'taken', label: 'source', uri: 'source.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf', version: 1 } }] },
    { ...emptyRig(), elements: [{ id: 'taken', name: 'existing', pose: pose() }] },
    { ...emptyRig(), frames: [{ id: 'taken', name: 'existing', ownerElementId: null, pose: pose(), provenance: { kind: 'synthetic' } }] },
    { ...emptyRig(), relations: [{ id: 'taken', type: 'distance', frameA: 'missing-a', frameB: 'missing-b', lengthM: 1 }] },
  ];

  for (const document of collisionCases) {
    assert.throws(() => createRigElement({ id: 'taken', name: 'New element' }).apply(document), /already in use/);
  }
});

test('project-level element creation increments rig revision and remains one chronological Undo/Redo action', () => {
  const project = createJureRigProject('project.real-jv-corner', emptyRig());
  const command = applyRigCommandToProject(
    'rig.real-jv-corner',
    createRigElement({ id: 'element.upper-arm', name: 'Upper arm' }),
  );

  const created = applyProjectCommand(createProjectSession(project), command);
  const createdRig = created.committed.authoredDocuments[0].document;
  assert.equal(createdRig.revision, 1);
  assert.equal(createdRig.elements.length, 1);
  assert.deepEqual(created.past.map((entry) => entry.label), ['Create element element.upper-arm']);

  const undone = undoProject(created);
  assert.equal(undone.committed.authoredDocuments[0].document.revision, 0);
  assert.equal(undone.committed.authoredDocuments[0].document.elements.length, 0);

  const redone = redoProject(undone);
  assert.equal(redone.committed.authoredDocuments[0].document.revision, 1);
  assert.equal(redone.committed.authoredDocuments[0].document.elements[0].id, 'element.upper-arm');
});
