import test from 'node:test';
import assert from 'node:assert/strict';

const { inspectRevoluteCandidate } = await import('../../.core-dist/features/rig-relations/create-revolute.js');
const { createProjectRevoluteRelation, allocateRevoluteRelationId } = await import('../../.core-dist/app/state/rig-relation-workflow.js');
const {
  createProjectAuthoringState,
  undoProjectAuthoring,
  redoProjectAuthoring,
  visibleProjectAuthoringRig,
} = await import('../../.core-dist/app/state/project-authoring.js');

const identityPose = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };

function projectFixture() {
  return {
    schemaVersion: 1,
    projectId: 'project.owner-revolute',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [],
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.owner-revolute',
      revision: 4,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [
        { id: 'element.lower-arm', name: 'Lower Arm', pose: identityPose },
        { id: 'element.chassis', name: 'Chassis', pose: identityPose },
      ],
      frames: [
        { id: 'frame.lower-arm.hinge', name: 'Lower Wishbone Hinge', ownerElementId: 'element.lower-arm', pose: identityPose, provenance: { kind: 'owner-authored' } },
        { id: 'frame.chassis.hinge', name: 'Lower Wishbone Hinge', ownerElementId: 'element.chassis', pose: identityPose, provenance: { kind: 'owner-authored' } },
      ],
      relations: [],
    } }],
  };
}

test('Owner revolute candidate exposes neutral residual before durable authoring', () => {
  const project = projectFixture();
  const document = project.authoredDocuments[0].document;
  const inspection = inspectRevoluteCandidate(document, 'frame.lower-arm.hinge', 'frame.chassis.hinge');
  assert.equal(inspection.originResidualM, 0);
  assert.equal(inspection.axisAngleRad, 0);
  assert.equal(inspection.axisDot, 1);
  assert.equal(inspection.ownerA, 'element.lower-arm');
  assert.equal(inspection.ownerB, 'element.chassis');
  assert.equal(inspection.existingRelationId, null);
});

test('Owner revolute workflow allocates deterministic ID and remains one ProjectSession Undo/Redo action', () => {
  const project = projectFixture();
  const document = project.authoredDocuments[0].document;
  assert.equal(
    allocateRevoluteRelationId(document, 'frame.lower-arm.hinge', 'frame.chassis.hinge'),
    'relation.revolute.lower-wishbone-hinge-lower-wishbone-hinge',
  );

  let state = createProjectAuthoringState(project, 'rig.owner-revolute');
  state = createProjectRevoluteRelation(state, 'frame.lower-arm.hinge', 'frame.chassis.hinge');
  let rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 5);
  assert.deepEqual(rig.relations, [{
    id: 'relation.revolute.lower-wishbone-hinge-lower-wishbone-hinge',
    type: 'revolute',
    frameA: 'frame.lower-arm.hinge',
    frameB: 'frame.chassis.hinge',
  }]);

  const inspection = inspectRevoluteCandidate(rig, 'frame.lower-arm.hinge', 'frame.chassis.hinge');
  assert.equal(inspection.existingRelationId, rig.relations[0].id);
  assert.throws(
    () => createProjectRevoluteRelation(state, 'frame.chassis.hinge', 'frame.lower-arm.hinge'),
    /already have revolute/i,
  );

  state = undoProjectAuthoring(state);
  rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 4);
  assert.equal(rig.relations.length, 0);

  state = redoProjectAuthoring(state);
  rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 5);
  assert.equal(rig.relations.length, 1);
});
