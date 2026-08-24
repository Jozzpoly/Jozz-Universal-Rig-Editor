import test from 'node:test';
import assert from 'node:assert/strict';

const { createSphericalRelation, inspectSphericalCandidate } = await import('../../.core-dist/features/rig-relations/create-spherical.js');
const { applyRigCommandToProject } = await import('../../.core-dist/project/commands.js');
const { createProjectSession, applyProjectCommand, undoProject, redoProject } = await import('../../.core-dist/project/session.js');

const identityPose = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.spherical',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [],
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.spherical',
      revision: 2,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [
        { id: 'element.arm', name: 'Arm', pose: identityPose },
        { id: 'element.carrier', name: 'Carrier', pose: identityPose },
      ],
      frames: [
        { id: 'frame.arm.outboard', name: 'Upper Outboard', ownerElementId: 'element.arm', pose: identityPose, provenance: { kind: 'owner-authored' } },
        { id: 'frame.carrier.outboard', name: 'Upper Outboard', ownerElementId: 'element.carrier', pose: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: Math.sin(Math.PI / 4), y: 0, z: 0, w: Math.cos(Math.PI / 4) },
        }, provenance: { kind: 'owner-authored' } },
      ],
      relations: [],
    } }],
  };
}

function rig(project) {
  return project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
}

test('spherical candidate inspection measures only neutral origin coincidence and preserves frame owners', () => {
  const document = rig(projectFixture());
  const inspection = inspectSphericalCandidate(document, 'frame.arm.outboard', 'frame.carrier.outboard');
  assert.equal(inspection.originResidualM, 0);
  assert.equal(inspection.ownerA, 'element.arm');
  assert.equal(inspection.ownerB, 'element.carrier');
  assert.equal(inspection.existingRelationId, null);
});

test('neutral spherical creation is one chronological project action with no axis, limit or consumer dynamics', () => {
  const project = projectFixture();
  const command = applyRigCommandToProject('rig.spherical', createSphericalRelation({
    id: 'relation.upper-outboard',
    frameA: 'frame.arm.outboard',
    frameB: 'frame.carrier.outboard',
  }));

  let session = createProjectSession(project);
  session = applyProjectCommand(session, command);
  const created = rig(session.committed);
  assert.equal(created.revision, 3);
  assert.deepEqual(created.relations, [{
    id: 'relation.upper-outboard',
    type: 'spherical',
    frameA: 'frame.arm.outboard',
    frameB: 'frame.carrier.outboard',
  }]);

  const serialized = JSON.stringify(created.relations[0]).toLowerCase();
  for (const forbidden of ['axis', 'limit', 'mass', 'inertia', 'friction', 'damping', 'motor', 'servo', 'solver', 'box3d']) {
    assert.equal(serialized.includes(forbidden), false, `spherical must not contain ${forbidden}`);
  }

  const inspection = inspectSphericalCandidate(created, 'frame.carrier.outboard', 'frame.arm.outboard');
  assert.equal(inspection.existingRelationId, 'relation.upper-outboard');

  session = undoProject(session);
  assert.equal(rig(session.committed).revision, 2);
  assert.equal(rig(session.committed).relations.length, 0);
  session = redoProject(session);
  assert.equal(rig(session.committed).revision, 3);
  assert.equal(rig(session.committed).relations[0].id, 'relation.upper-outboard');
});

test('spherical creation fails closed on invalid identity and frame references', () => {
  const document = rig(projectFixture());
  assert.throws(() => inspectSphericalCandidate(document, 'missing', 'frame.carrier.outboard'), /frameA missing not found/i);
  assert.throws(() => inspectSphericalCandidate(document, 'frame.arm.outboard', 'frame.arm.outboard'), /two distinct frames/i);
  assert.throws(() => createSphericalRelation({ id: '', frameA: 'a', frameB: 'b' }), /ID must be non-empty/i);
  assert.throws(() => createSphericalRelation({ id: 'r', frameA: 'same', frameB: 'same' }), /two distinct frames/i);
  assert.throws(() => createSphericalRelation({ id: 'r', frameA: 'a', frameB: 'b' }).apply(document), /frameA a not found/i);
  assert.throws(() => createSphericalRelation({ id: 'element.arm', frameA: 'frame.arm.outboard', frameB: 'frame.carrier.outboard' }).apply(document), /already in use/i);
});
