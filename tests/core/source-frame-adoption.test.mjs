import test from 'node:test';
import assert from 'node:assert/strict';

const sessionApi = await import('../../.core-dist/project/session.js');
const { adoptSourceDatumAsFrame } = await import('../../.core-dist/project/source-frame-adoption.js');
const { validateJureProjectModel } = await import('../../.core-dist/project/validate.js');
const { resolveRigDocument } = await import('../../.core-dist/kernel/resolve.js');

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

const sourceNode = ({
  locator = 'gltf2.node:lower-ball',
  worldRigidPose = pose(2, 0, 0),
  rigidCompatibility = 'rigid',
} = {}) => ({
  locator,
  index: 0,
  name: 'LowerBall',
  parentLocator: null,
  childCount: 0,
  hasMesh: false,
  isSkinJoint: false,
  localScale: { x: 1, y: 1, z: 1 },
  localRigidPose: worldRigidPose,
  worldRigidPose,
  rigidCompatibility,
});

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.jv-m6',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceA, sourceB],
    sourceInstances: [{ id: 'source-instance.fl', name: 'FL suspension', sourceRevisionId: sourceA.id, pose: pose(10, 0, 0) }],
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
        elements: [{ id: 'element.lower-arm', name: 'Lower arm', pose: pose(5, 0, 0) }],
        frames: [],
        relations: [],
      },
    }],
  };
}

const rigDocument = (project) => project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
const errors = (project) => validateJureProjectModel(project).filter((diagnostic) => diagnostic.severity === 'error');

function adoptionCommand(overrides = {}) {
  return adoptSourceDatumAsFrame({
    rigDocumentId: 'rig.vehicle',
    frameId: 'frame.lower-ball',
    frameName: 'FL lower-ball',
    ownerElementId: null,
    adoptionId: 'adopt.lower-ball',
    sourceInstanceId: 'source-instance.fl',
    sourceRevisionId: sourceA.id,
    sourceNode: sourceNode(),
    ...overrides,
  });
}

test('explicit SOURCE datum adoption atomically creates authored frame provenance and immutable adoption evidence', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(session, adoptionCommand());

  const rig = rigDocument(session.committed);
  const frame = rig.frames[0];
  assert.equal(frame.pose.position.x, 12);
  assert.equal(frame.provenance.kind, 'owner-authored');
  assert.deepEqual(frame.source, { sourceRevisionId: sourceA.id, locator: 'gltf2.node:lower-ball' });
  assert.equal(rig.revision, 4);
  assert.equal(rig.sources.length, 1);
  assert.equal(rig.sources[0].id, sourceA.id);

  const adoption = session.committed.sourceAdoptions[0];
  assert.equal(adoption.source.sourceInstanceId, 'source-instance.fl');
  assert.equal(adoption.source.sourceRevisionId, sourceA.id);
  assert.equal(adoption.source.sourceInstancePose.position.x, 10);
  assert.deepEqual(adoption.target, { documentId: 'rig.vehicle', kind: 'frame', id: 'frame.lower-ball' });
  assert.deepEqual(errors(session.committed), []);
});

test('adopting into an owner element converts SOURCE project-world pose to owner-local authored pose', () => {
  const project = adoptionCommand({ ownerElementId: 'element.lower-arm' }).apply(projectFixture());
  const rig = rigDocument(project);
  const frame = rig.frames[0];

  assert.equal(frame.pose.position.x, 7);
  assert.equal(resolveRigDocument(rig).frameWorldPoses.get('frame.lower-ball').position.x, 12);
  assert.deepEqual(errors(project), []);
});

test('project Undo/Redo removes and restores frame plus adoption as one transaction', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(session, adoptionCommand());
  assert.equal(rigDocument(session.committed).frames.length, 1);
  assert.equal(session.committed.sourceAdoptions.length, 1);

  session = sessionApi.undoProject(session);
  assert.equal(rigDocument(session.committed).frames.length, 0);
  assert.equal(rigDocument(session.committed).sources.length, 0);
  assert.equal(rigDocument(session.committed).revision, 3);
  assert.equal(session.committed.sourceAdoptions.length, 0);

  session = sessionApi.redoProject(session);
  assert.equal(rigDocument(session.committed).frames.length, 1);
  assert.equal(rigDocument(session.committed).sources.length, 1);
  assert.equal(rigDocument(session.committed).revision, 4);
  assert.equal(session.committed.sourceAdoptions.length, 1);
});

test('non-rigid SOURCE nodes cannot be adopted as rigid authored frames', () => {
  assert.throws(
    () => adoptionCommand({ sourceNode: sourceNode({ rigidCompatibility: 'non-rigid-ancestor', worldRigidPose: null }) }),
    /not rigid-compatible/,
  );
});

test('adoption fails closed if SourceInstance exact revision changed after the datum was selected', () => {
  const project = projectFixture();
  const command = adoptionCommand();
  project.sourceInstances[0] = { ...project.sourceInstances[0], sourceRevisionId: sourceB.id };
  assert.throws(() => command.apply(project), /no longer uses exact revision/);
  assert.equal(rigDocument(project).frames.length, 0);
  assert.equal(project.sourceAdoptions.length, 0);
});

test('duplicate rig IDs fail before any frame or adoption is committed', () => {
  const project = projectFixture();
  rigDocument(project).frames.push({
    id: 'frame.lower-ball',
    name: 'Existing',
    ownerElementId: null,
    pose: pose(),
    provenance: { kind: 'owner-authored' },
  });
  const before = structuredClone(project);

  assert.throws(() => adoptionCommand().apply(project), /already in use/);
  assert.deepEqual(project, before);
});
