import test from 'node:test';
import assert from 'node:assert/strict';

const { inspectSphericalCandidate } = await import('../../.core-dist/features/rig-relations/create-spherical.js');
const { createProjectSphericalRelation, allocateSphericalRelationId } = await import('../../.core-dist/app/state/spherical-relation-workflow.js');
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
    projectId: 'project.owner-spherical',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [],
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: {
      schemaVersion: 1,
      documentId: 'rig.owner-spherical',
      revision: 6,
      units: 'm-rad',
      coordinateSystem: { handedness: 'right', upAxis: 'Y' },
      sources: [],
      elements: [
        { id: 'element.upper-arm', name: 'Upper Arm', pose: identityPose },
        { id: 'element.carrier', name: 'Carrier', pose: identityPose },
      ],
      frames: [
        { id: 'frame.upper-arm.outboard', name: 'Upper Outboard', ownerElementId: 'element.upper-arm', pose: identityPose, provenance: { kind: 'owner-authored' } },
        { id: 'frame.carrier.upper', name: 'Upper Outboard', ownerElementId: 'element.carrier', pose: identityPose, provenance: { kind: 'owner-authored' } },
      ],
      relations: [],
    } }],
  };
}

test('Owner spherical workflow allocates deterministic ID and remains one ProjectSession Undo/Redo action', () => {
  const project = projectFixture();
  const document = project.authoredDocuments[0].document;
  assert.equal(
    allocateSphericalRelationId(document, 'frame.upper-arm.outboard', 'frame.carrier.upper'),
    'relation.spherical.upper-outboard-upper-outboard',
  );

  let state = createProjectAuthoringState(project, 'rig.owner-spherical');
  state = createProjectSphericalRelation(state, 'frame.upper-arm.outboard', 'frame.carrier.upper');
  let rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 7);
  assert.deepEqual(rig.relations, [{
    id: 'relation.spherical.upper-outboard-upper-outboard',
    type: 'spherical',
    frameA: 'frame.upper-arm.outboard',
    frameB: 'frame.carrier.upper',
  }]);

  const inspection = inspectSphericalCandidate(rig, 'frame.carrier.upper', 'frame.upper-arm.outboard');
  assert.equal(inspection.originResidualM, 0);
  assert.equal(inspection.existingRelationId, rig.relations[0].id);
  assert.throws(
    () => createProjectSphericalRelation(state, 'frame.carrier.upper', 'frame.upper-arm.outboard'),
    /already have spherical/i,
  );

  state = undoProjectAuthoring(state);
  rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 6);
  assert.equal(rig.relations.length, 0);

  state = redoProjectAuthoring(state);
  rig = visibleProjectAuthoringRig(state);
  assert.equal(rig.revision, 7);
  assert.equal(rig.relations.length, 1);
});

test('Owner spherical ID allocation is document-wide and does not collide with another authored identity', () => {
  const project = projectFixture();
  const document = project.authoredDocuments[0].document;
  document.elements.push({
    id: 'relation.spherical.upper-outboard-upper-outboard',
    name: 'Collision sentinel',
    pose: identityPose,
  });
  assert.equal(
    allocateSphericalRelationId(document, 'frame.upper-arm.outboard', 'frame.carrier.upper'),
    'relation.spherical.upper-outboard-upper-outboard.2',
  );
});
