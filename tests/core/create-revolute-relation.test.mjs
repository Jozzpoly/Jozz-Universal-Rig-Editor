import test from 'node:test';
import assert from 'node:assert/strict';

const { createRevoluteRelation } = await import('../../.core-dist/features/rig-relations/create-revolute.js');
const { applyRigCommandToProject } = await import('../../.core-dist/project/commands.js');
const { createProjectSession, applyProjectCommand, undoProject, redoProject } = await import('../../.core-dist/project/session.js');

const identityPose = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.revolute',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [],
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.revolute',
      revision: 7,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [
        { id: 'element.arm', name: 'Arm', pose: identityPose },
        { id: 'element.chassis', name: 'Chassis', pose: identityPose },
      ],
      frames: [
        { id: 'frame.arm.hinge', name: 'Arm hinge', ownerElementId: 'element.arm', pose: identityPose, provenance: { kind: 'owner-authored' } },
        { id: 'frame.chassis.hinge', name: 'Chassis hinge', ownerElementId: 'element.chassis', pose: identityPose, provenance: { kind: 'owner-authored' } },
      ],
      relations: [],
    } }],
  };
}

function rig(project) {
  return project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
}

test('neutral revolute creation is one chronological project action with no consumer dynamics', () => {
  const project = projectFixture();
  const command = applyRigCommandToProject('rig.revolute', createRevoluteRelation({
    id: 'relation.lower-hinge',
    frameA: 'frame.arm.hinge',
    frameB: 'frame.chassis.hinge',
  }));

  let session = createProjectSession(project);
  session = applyProjectCommand(session, command);
  const created = rig(session.committed);
  assert.equal(created.revision, 8);
  assert.deepEqual(created.relations, [{
    id: 'relation.lower-hinge',
    type: 'revolute',
    frameA: 'frame.arm.hinge',
    frameB: 'frame.chassis.hinge',
  }]);

  const serializedRelation = JSON.stringify(created.relations[0]);
  for (const forbidden of ['mass', 'inertia', 'friction', 'damping', 'hertz', 'motor', 'servo', 'solver', 'box3d']) {
    assert.equal(serializedRelation.toLowerCase().includes(forbidden), false, `revolute must not contain ${forbidden}`);
  }

  session = undoProject(session);
  assert.equal(rig(session.committed).relations.length, 0);
  assert.equal(rig(session.committed).revision, 7);
  session = redoProject(session);
  assert.equal(rig(session.committed).relations[0].id, 'relation.lower-hinge');
  assert.equal(rig(session.committed).revision, 8);
});

test('revolute creation snapshots limits and fails closed on invalid identity, frames and ranges', () => {
  const project = projectFixture();
  const input = {
    id: 'relation.limited',
    frameA: 'frame.arm.hinge',
    frameB: 'frame.chassis.hinge',
    limits: { lowerRad: -0.5, upperRad: 0.75 },
  };
  const command = createRevoluteRelation(input);
  input.limits.lowerRad = -99;
  const created = command.apply(rig(project));
  assert.deepEqual(created.relations[0].limits, { lowerRad: -0.5, upperRad: 0.75 });

  assert.throws(() => createRevoluteRelation({ id: '', frameA: 'a', frameB: 'b' }), /ID must be non-empty/i);
  assert.throws(() => createRevoluteRelation({ id: 'r', frameA: 'same', frameB: 'same' }), /two distinct frames/i);
  assert.throws(() => createRevoluteRelation({ id: 'r', frameA: 'a', frameB: 'b', limits: { lowerRad: 1, upperRad: -1 } }), /lower limit.*<=.*upper/i);
  assert.throws(() => createRevoluteRelation({ id: 'r', frameA: 'a', frameB: 'b', limits: { lowerRad: Number.NaN, upperRad: 1 } }), /must be finite/i);
  assert.throws(() => createRevoluteRelation({ id: 'r', frameA: 'a', frameB: 'b' }).apply(rig(project)), /frameA a not found/i);
  assert.throws(() => createRevoluteRelation({ id: 'element.arm', frameA: 'frame.arm.hinge', frameB: 'frame.chassis.hinge' }).apply(rig(project)), /already in use/i);
});
