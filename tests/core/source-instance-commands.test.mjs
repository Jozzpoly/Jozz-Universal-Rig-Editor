import test from 'node:test';
import assert from 'node:assert/strict';

const sessionApi = await import('../../.core-dist/project/session.js');
const commands = await import('../../.core-dist/project/commands.js');
const { createSourceAdoptionRecord } = await import('../../.core-dist/project/source-adoption.js');
const { validateJureProjectModel } = await import('../../.core-dist/project/validate.js');

const pose = (x = 0, y = 0, z = 0) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
});

const sourceA = {
  id: 'source.suspension.rev-a',
  label: 'Suspension A',
  uri: 'sources/suspension-a.gltf',
  sha256: 'a'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};
const sourceB = {
  id: 'source.suspension.rev-b',
  label: 'Suspension B',
  uri: 'sources/suspension-b.gltf',
  sha256: 'b'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};

function projectFixture({ withRepresentation = false } = {}) {
  const sourceInstance = {
    id: 'source-instance.fl',
    name: 'FL suspension',
    sourceRevisionId: sourceA.id,
    pose: pose(),
  };
  const rig = {
    schemaVersion: 1,
    documentId: 'rig.vehicle',
    revision: 0,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [sourceA],
    elements: [{ id: 'element.knuckle', name: 'Knuckle', pose: pose() }],
    frames: [{
      id: 'frame.lower-ball',
      name: 'FL lower-ball',
      ownerElementId: 'element.knuckle',
      pose: pose(),
      source: { sourceRevisionId: sourceA.id, locator: 'gltf2.node:lower-ball' },
      provenance: { kind: 'source-proposal' },
    }],
    relations: [],
  };
  const representation = {
    schemaVersion: 1,
    documentId: 'representation.vehicle',
    revision: 0,
    rigDocumentId: rig.documentId,
    bindings: [{
      id: 'rep.knuckle',
      type: 'rigid',
      target: { sourceInstanceId: sourceInstance.id, sourceRevisionId: sourceA.id, targetLocator: 'gltf2.node:knuckle' },
      sourceDatumLocator: 'gltf2.node:knuckle',
      rigDatum: { kind: 'element', id: 'element.knuckle' },
    }],
  };
  return {
    schemaVersion: 1,
    projectId: 'project.jv-m6',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceA, sourceB],
    sourceInstances: [sourceInstance],
    consumerReferences: [],
    sourceAdoptions: [createSourceAdoptionRecord({
      id: 'adopt.lower-ball',
      sourceInstance,
      locator: 'gltf2.node:lower-ball',
      target: { documentId: rig.documentId, kind: 'frame', id: 'frame.lower-ball' },
    })],
    authoredDocuments: withRepresentation
      ? [{ kind: 'rig', document: rig }, { kind: 'rig-representation', document: representation }]
      : [{ kind: 'rig', document: rig }],
  };
}

const errors = (project) => validateJureProjectModel(project).filter((diagnostic) => diagnostic.severity === 'error');

test('one exact source revision can back another independent SourceInstance through project history', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(session, commands.addSourceInstance({
    id: 'source-instance.fr',
    name: 'FR suspension',
    sourceRevisionId: sourceA.id,
    pose: pose(0, 0, 2),
  }));

  assert.equal(session.committed.sourceInstances.length, 2);
  assert.equal(session.committed.sourceInstances[0].sourceRevisionId, session.committed.sourceInstances[1].sourceRevisionId);
  assert.deepEqual(errors(session.committed), []);

  session = sessionApi.undoProject(session);
  assert.equal(session.committed.sourceInstances.length, 1);
  session = sessionApi.redoProject(session);
  assert.equal(session.committed.sourceInstances.length, 2);
});

test('adding SourceInstance snapshots command input instead of retaining mutable pose references', () => {
  const input = {
    id: 'source-instance.fr',
    name: 'FR suspension',
    sourceRevisionId: sourceA.id,
    pose: pose(0, 0, 2),
  };
  const command = commands.addSourceInstance(input);
  input.pose.position.z = 99;

  const project = command.apply(projectFixture());
  assert.equal(project.sourceInstances.find((instance) => instance.id === 'source-instance.fr').pose.position.z, 2);
});

test('removing a live SourceInstance is allowed when only historical adoption evidence remembers it', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  const adoptionBefore = structuredClone(session.committed.sourceAdoptions[0]);
  session = sessionApi.applyProjectCommand(session, commands.removeSourceInstance('source-instance.fl'));

  assert.equal(session.committed.sourceInstances.length, 0);
  assert.deepEqual(session.committed.sourceAdoptions[0], adoptionBefore);
  assert.deepEqual(errors(session.committed), []);
});

test('removing a SourceInstance fails closed while authored representation bindings use it', () => {
  const project = projectFixture({ withRepresentation: true });
  assert.throws(
    () => commands.removeSourceInstance('source-instance.fl').apply(project),
    /representation bindings reference it/,
  );
  assert.deepEqual(errors(project), []);
});

test('re-registering SourceInstance to another exact revision does not rewrite historical adoption provenance', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  const adoptionBefore = structuredClone(session.committed.sourceAdoptions[0]);
  session = sessionApi.applyProjectCommand(
    session,
    commands.setSourceInstanceRevision('source-instance.fl', sourceB.id),
  );

  assert.equal(session.committed.sourceInstances[0].sourceRevisionId, sourceB.id);
  assert.deepEqual(session.committed.sourceAdoptions[0], adoptionBefore);
  assert.deepEqual(errors(session.committed), []);
});

test('re-registering SourceInstance fails closed while representation claims its previous exact revision', () => {
  const project = projectFixture({ withRepresentation: true });
  assert.throws(
    () => commands.setSourceInstanceRevision('source-instance.fl', sourceB.id).apply(project),
    /Rebind explicitly first/,
  );
  assert.deepEqual(errors(project), []);
});

test('adding SourceInstance rejects project-wide identity collisions', () => {
  const project = projectFixture();
  assert.throws(
    () => commands.addSourceInstance({ id: 'rig.vehicle', name: 'Collision', sourceRevisionId: sourceA.id, pose: pose() }).apply(project),
    /already in use/,
  );
});
