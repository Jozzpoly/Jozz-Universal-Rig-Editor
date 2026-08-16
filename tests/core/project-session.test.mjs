import test from 'node:test';
import assert from 'node:assert/strict';

const sessionApi = await import('../../.core-dist/project/session.js');
const projectCommands = await import('../../.core-dist/project/commands.js');
const { createSourceAdoptionRecord } = await import('../../.core-dist/project/source-adoption.js');
const { setFramePose } = await import('../../.core-dist/features/rig-transform/command.js');

const pose = (x = 0, y = 0, z = 0) => ({
  position: { x, y, z },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
});

const sourceRevision = {
  id: 'source.suspension.rev-a',
  label: 'Suspension A',
  uri: 'sources/suspension.gltf',
  sha256: 'a'.repeat(64),
  adapter: { id: 'gltf-2.0', version: 1 },
};

function projectFixture() {
  const sourceInstance = {
    id: 'source-instance.fl',
    name: 'FL suspension',
    sourceRevisionId: sourceRevision.id,
    pose: pose(),
  };
  const rig = {
    schemaVersion: 1,
    documentId: 'rig.vehicle',
    revision: 4,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [sourceRevision],
    elements: [],
    frames: [{
      id: 'frame.lower-ball',
      name: 'FL lower-ball',
      ownerElementId: null,
      pose: pose(),
      source: { sourceRevisionId: sourceRevision.id, locator: 'gltf2.node:lower-ball' },
      provenance: { kind: 'source-proposal' },
    }],
    relations: [],
  };
  return {
    schemaVersion: 1,
    projectId: 'project.jv-m6',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceRevision],
    sourceInstances: [sourceInstance],
    consumerReferences: [],
    sourceAdoptions: [createSourceAdoptionRecord({
      id: 'adopt.lower-ball',
      sourceInstance,
      locator: 'gltf2.node:lower-ball',
      target: { documentId: rig.documentId, kind: 'frame', id: 'frame.lower-ball' },
    })],
    authoredDocuments: [{ kind: 'rig', document: rig }],
  };
}

const rigDocument = (project) => project.authoredDocuments.find((entry) => entry.kind === 'rig').document;

test('one project history preserves chronological undo across SOURCE placement and authored rig edits', () => {
  let session = sessionApi.createProjectSession(projectFixture());

  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(5, 0, 0)),
  );
  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.applyRigCommandToProject('rig.vehicle', setFramePose('frame.lower-ball', pose(2, 0, 0))),
  );

  assert.equal(session.committed.sourceInstances[0].pose.position.x, 5);
  assert.equal(rigDocument(session.committed).frames[0].pose.position.x, 2);
  assert.equal(rigDocument(session.committed).revision, 5);
  assert.equal(session.past.length, 2);

  session = sessionApi.undoProject(session);
  assert.equal(session.committed.sourceInstances[0].pose.position.x, 5);
  assert.equal(rigDocument(session.committed).frames[0].pose.position.x, 0);
  assert.equal(rigDocument(session.committed).revision, 4);

  session = sessionApi.undoProject(session);
  assert.equal(session.committed.sourceInstances[0].pose.position.x, 0);
  assert.equal(rigDocument(session.committed).frames[0].pose.position.x, 0);

  session = sessionApi.redoProject(session);
  assert.equal(session.committed.sourceInstances[0].pose.position.x, 5);
  assert.equal(rigDocument(session.committed).frames[0].pose.position.x, 0);

  session = sessionApi.redoProject(session);
  assert.equal(session.committed.sourceInstances[0].pose.position.x, 5);
  assert.equal(rigDocument(session.committed).frames[0].pose.position.x, 2);
  assert.equal(rigDocument(session.committed).revision, 5);
});

test('SOURCE transform preview is transient until commit and cancel creates no durable history', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.beginProjectPreview(session, 'Move SOURCE source-instance.fl');
  session = sessionApi.updateProjectPreview(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(8, 0, 0)),
  );

  assert.equal(session.committed.sourceInstances[0].pose.position.x, 0);
  assert.equal(sessionApi.visibleProject(session).sourceInstances[0].pose.position.x, 8);

  session = sessionApi.cancelProjectPreview(session);
  assert.equal(session.committed.sourceInstances[0].pose.position.x, 0);
  assert.equal(session.past.length, 0);

  session = sessionApi.beginProjectPreview(session, 'Move SOURCE source-instance.fl');
  session = sessionApi.updateProjectPreview(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(8, 0, 0)),
  );
  session = sessionApi.commitProjectPreview(session);

  assert.equal(session.committed.sourceInstances[0].pose.position.x, 8);
  assert.equal(session.past.length, 1);
  assert.equal(session.past[0].label, 'Move SOURCE source-instance.fl');
});

test('moving live SOURCE placement does not rewrite historical adoption evidence', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  const adoptionBefore = structuredClone(session.committed.sourceAdoptions[0]);

  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(12, 3, -4)),
  );

  assert.deepEqual(session.committed.sourceAdoptions[0], adoptionBefore);
});

test('new durable edit after undo clears redo branch', () => {
  let session = sessionApi.createProjectSession(projectFixture());
  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(1, 0, 0)),
  );
  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(2, 0, 0)),
  );
  session = sessionApi.undoProject(session);
  assert.equal(sessionApi.canRedoProject(session), true);

  session = sessionApi.applyProjectCommand(
    session,
    projectCommands.setSourceInstancePose('source-instance.fl', pose(3, 0, 0)),
  );

  assert.equal(session.committed.sourceInstances[0].pose.position.x, 3);
  assert.equal(sessionApi.canRedoProject(session), false);
});
