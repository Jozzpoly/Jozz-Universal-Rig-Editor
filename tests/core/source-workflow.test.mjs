import test from 'node:test';
import assert from 'node:assert/strict';

const workflow = await import('../../.core-dist/app/state/source-workflow.js');

const pose = () => ({ position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const adapter = { id: 'gltf-2.0', version: 1 };
const source = { name: 'one-sided.gltf', sha256: 'a'.repeat(64), adapter };
const project = () => ({
  schemaVersion: 1, projectId: 'project.workflow', units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sourceRevisions: [], sourceInstances: [], consumerReferences: [], sourceAdoptions: [],
  authoredDocuments: [{ kind: 'rig', document: {
    schemaVersion: 1, documentId: 'rig.vehicle', revision: 0, units: 'm-rad', coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [], elements: [{ id: 'element.arm', name: 'Arm', pose: pose() }], frames: [], relations: [],
  } }],
});

test('first SOURCE open plans one composite durable revision+instance command', () => {
  const initial = project();
  const plan = workflow.planSourceOpen(initial, null, source);
  assert.equal(plan.kind, 'add-revision-and-instance');
  assert.ok(plan.command);
  const next = plan.command.apply(initial);
  assert.equal(next.sourceRevisions.length, 1);
  assert.equal(next.sourceInstances.length, 1);
  assert.equal(next.sourceInstances[0].sourceRevisionId, next.sourceRevisions[0].id);
});

test('opening already registered exact bytes with a placed instance is runtime relink only', () => {
  const initial = project();
  const first = workflow.planSourceOpen(initial, null, source);
  const withSource = first.command.apply(initial);
  const second = workflow.planSourceOpen(withSource, withSource.sourceInstances[0].id, source);
  assert.equal(second.kind, 'relink');
  assert.equal(second.command, null);
  assert.equal(second.sourceInstance.id, withSource.sourceInstances[0].id);
});

test('opening exact registered bytes without a placed instance plans one instance-only durable command', () => {
  const initial = project();
  const first = workflow.planSourceOpen(initial, null, source);
  const withSource = first.command.apply(initial);
  const withoutInstances = { ...withSource, sourceInstances: [] };
  const plan = workflow.planSourceOpen(withoutInstances, null, source);
  assert.equal(plan.kind, 'add-instance');
  assert.ok(plan.command);
  assert.equal(plan.command.apply(withoutInstances).sourceInstances.length, 1);
});

test('adoption ID allocation avoids existing rig and project identities deterministically', () => {
  const initial = project();
  initial.authoredDocuments[0].document.frames.push({ id: 'frame.lower-ball', name: 'Existing', ownerElementId: null, pose: pose(), provenance: { kind: 'owner-authored' } });
  initial.sourceAdoptions.push({
    id: 'adoption.frame.lower-ball.2',
    source: { sourceInstanceId: 'historical', sourceRevisionId: 'historical-source', sourceInstancePose: pose(), locator: 'node/0' },
    target: { documentId: 'rig.vehicle', kind: 'frame', id: 'frame.lower-ball' },
  });
  assert.deepEqual(workflow.allocateFrameAdoptionIds(initial, 'rig.vehicle', 'Lower Ball'), {
    frameId: 'frame.lower-ball.3', adoptionId: 'adoption.frame.lower-ball.3',
  });
});
