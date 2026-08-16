import test from 'node:test';
import assert from 'node:assert/strict';

const sessionApi = await import('../../.core-dist/project/session.js');
const { adoptSourceDatumAsElement } = await import('../../.core-dist/project/source-element-adoption.js');
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

const exactDatum = (overrides = {}) => ({
  sourceInstanceId: 'source-instance.fl',
  sourceRevisionId: sourceA.id,
  locator: 'gltf2.node:chassis-bottom',
  sourceRevisionWorldPose: pose(2, -1, 0.5),
  ...overrides,
});

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.jv-m6',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceA, sourceB],
    sourceInstances: [{ id: 'source-instance.fl', name: 'FL suspension', sourceRevisionId: sourceA.id, pose: pose(10, 3, 1) }],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{
      kind: 'rig',
      document: {
        schemaVersion: 1,
        documentId: 'rig.vehicle',
        revision: 3,
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

const rigDocument = (project) => project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
const errors = (project) => validateJureProjectModel(project).filter((diagnostic) => diagnostic.severity === 'error');

function adoptionCommand(overrides = {}) {
  return adoptSourceDatumAsElement({
    rigDocumentId: 'rig.vehicle',
    elementId: 'element.lower-arm',
    elementName: 'Lower arm',
    adoptionId: 'adoption.element.lower-arm',
    sourceDatum: exactDatum(),
    ...overrides,
  });
}

test('exact SOURCE datum adoption atomically creates an authored element origin plus immutable adoption evidence', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(session, adoptionCommand());

  const rig = rigDocument(session.committed);
  const element = rig.elements[0];
  assert.deepEqual(element.pose.position, { x: 12, y: 2, z: 1.5 });
  assert.deepEqual(element.source, { sourceRevisionId: sourceA.id, locator: 'gltf2.node:chassis-bottom' });
  assert.equal(element.name, 'Lower arm');
  assert.equal(rig.revision, 4);
  assert.equal(rig.sources.length, 1);

  const adoption = session.committed.sourceAdoptions[0];
  assert.equal(adoption.source.sourceInstanceId, 'source-instance.fl');
  assert.equal(adoption.source.sourceRevisionId, sourceA.id);
  assert.deepEqual(adoption.source.sourceInstancePose.position, { x: 10, y: 3, z: 1 });
  assert.deepEqual(adoption.target, { documentId: 'rig.vehicle', kind: 'element', id: 'element.lower-arm' });
  assert.deepEqual(errors(session.committed), []);
});

test('element adoption snapshots datum input and trims authored identity/name', () => {
  const datum = exactDatum();
  const command = adoptionCommand({ elementId: ' element.lower-arm ', elementName: ' Lower arm ', sourceDatum: datum });
  datum.locator = 'mutated-after-command';
  datum.sourceRevisionWorldPose.position.x = 100;

  const project = command.apply(projectFixture());
  const element = rigDocument(project).elements[0];
  assert.equal(element.id, 'element.lower-arm');
  assert.equal(element.name, 'Lower arm');
  assert.equal(element.source.locator, 'gltf2.node:chassis-bottom');
  assert.equal(element.pose.position.x, 12);
  assert.deepEqual(errors(project), []);
});

test('project Undo/Redo removes and restores element, rig SOURCE provenance and adoption as one transaction', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(session, adoptionCommand());
  session = sessionApi.undoProject(session);
  assert.equal(rigDocument(session.committed).elements.length, 0);
  assert.equal(rigDocument(session.committed).sources.length, 0);
  assert.equal(rigDocument(session.committed).revision, 3);
  assert.equal(session.committed.sourceAdoptions.length, 0);

  session = sessionApi.redoProject(session);
  assert.equal(rigDocument(session.committed).elements.length, 1);
  assert.equal(rigDocument(session.committed).sources.length, 1);
  assert.equal(rigDocument(session.committed).revision, 4);
  assert.equal(session.committed.sourceAdoptions.length, 1);
});

test('element adoption fails closed when exact SOURCE identity changed after datum resolution', () => {
  const project = projectFixture();
  const command = adoptionCommand();
  project.sourceInstances[0] = { ...project.sourceInstances[0], sourceRevisionId: sourceB.id };
  assert.throws(() => command.apply(project), /no longer uses exact revision/);
  assert.equal(rigDocument(project).elements.length, 0);
  assert.equal(project.sourceAdoptions.length, 0);
});

test('element adoption rejects rig and project identity collisions before committing partial truth', () => {
  for (const collision of ['source', 'element', 'frame', 'relation']) {
    const project = projectFixture();
    const rig = rigDocument(project);
    if (collision === 'source') rig.sources.push({ ...sourceB, id: 'element.lower-arm' });
    if (collision === 'element') rig.elements.push({ id: 'element.lower-arm', name: 'Existing', pose: pose() });
    if (collision === 'frame') rig.frames.push({ id: 'element.lower-arm', name: 'Existing', ownerElementId: null, pose: pose(), provenance: { kind: 'synthetic' } });
    if (collision === 'relation') rig.relations.push({ id: 'element.lower-arm', type: 'distance', frameA: 'missing-a', frameB: 'missing-b', lengthM: 1 });
    const before = structuredClone(project);
    assert.throws(() => adoptionCommand().apply(project), /already in use/);
    assert.deepEqual(project, before);
  }

  const project = projectFixture();
  project.consumerReferences.push({
    id: 'adoption.element.lower-arm',
    label: 'collision',
    consumer: { id: 'test', revision: '1' },
    payloadLocator: 'payload.json',
    payloadSha256: 'c'.repeat(64),
  });
  const before = structuredClone(project);
  assert.throws(() => adoptionCommand().apply(project), /Project ID adoption.element.lower-arm is already in use/);
  assert.deepEqual(project, before);
});
