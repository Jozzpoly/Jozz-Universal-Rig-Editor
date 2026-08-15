import test from 'node:test';
import assert from 'node:assert/strict';

const workflow = await import('../../.core-dist/app/state/source-workflow.js');
const sessionApi = await import('../../.core-dist/project/session.js');

const pose = () => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
});

const adapter = { id: 'gltf-2.0', version: 1 };
const fileName = 'OneSided_Steering_Suspension_Rig.gltf';
const historicalBindHash = 'fc1e8bd0e298a66fa79c43324708e281073ea8fb7a7aad2728702653705c0ee1';
const canonicalJvHash = '57cda983f8f728bc819460540d2ee39b1b17288ecdac1f0dc8bb1a3e6f9ab750';

function projectWithHistoricalRevision() {
  const revisionId = `source.gltf-2-0.v1.sha256.${historicalBindHash}`;
  return {
    schemaVersion: 1,
    projectId: 'project.source-identity',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [{
      id: revisionId,
      label: fileName,
      uri: fileName,
      sha256: historicalBindHash,
      adapter,
    }],
    sourceInstances: [{
      id: 'source-instance.historical',
      name: fileName,
      sourceRevisionId: revisionId,
      pose: pose(),
    }],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [],
  };
}

test('same filename with different exact bytes is a different SourceRevision, not a relink', () => {
  const project = projectWithHistoricalRevision();
  const plan = workflow.planSourceOpen(project, 'source-instance.historical', {
    name: fileName,
    sha256: canonicalJvHash,
    adapter,
  });

  assert.equal(plan.kind, 'add-revision-and-instance');
  assert.notEqual(plan.revision.id, project.sourceRevisions[0].id);
  assert.equal(plan.revision.label, fileName);
  assert.equal(plan.revision.sha256, canonicalJvHash);
  assert.ok(plan.command);

  const session = sessionApi.applyProjectCommand(sessionApi.createProjectSession(project), plan.command);
  assert.equal(session.committed.sourceRevisions.length, 2);
  assert.equal(session.committed.sourceInstances.length, 2);
  assert.deepEqual(
    session.committed.sourceRevisions.map((revision) => revision.sha256).sort(),
    [historicalBindHash, canonicalJvHash].sort(),
  );
});

test('same exact bytes and adapter relink without creating durable project truth', () => {
  const project = projectWithHistoricalRevision();
  const plan = workflow.planSourceOpen(project, 'source-instance.historical', {
    name: 'renamed-copy.gltf',
    sha256: historicalBindHash.toUpperCase(),
    adapter,
  });

  assert.equal(plan.kind, 'relink');
  assert.equal(plan.command, null);
  assert.equal(plan.revision.id, project.sourceRevisions[0].id);
  assert.equal(plan.sourceInstance.id, 'source-instance.historical');
});

test('same bytes with a different adapter version is not the same SourceRevision', () => {
  const project = projectWithHistoricalRevision();
  const plan = workflow.planSourceOpen(project, 'source-instance.historical', {
    name: fileName,
    sha256: historicalBindHash,
    adapter: { id: adapter.id, version: 2 },
  });

  assert.equal(plan.kind, 'add-revision-and-instance');
  assert.ok(plan.command);
  assert.equal(plan.revision.adapter.version, 2);
});
