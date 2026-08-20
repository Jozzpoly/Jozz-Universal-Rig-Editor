import assert from 'node:assert/strict';
import test from 'node:test';

const { SYNTHETIC_MAP } = await import('../../.core-dist/fixtures/synthetic-map.js');
const {
  deleteMapEntity,
  duplicateMapEntity,
  planMapEntityDuplicate,
} = await import('../../.core-dist/features/map-entity/command.js');
const { setMapEntityPose } = await import('../../.core-dist/features/map-transform/command.js');
const { setMapBoxHalfExtents } = await import('../../.core-dist/features/map-resize/box-resize.js');
const { serializeMapDocument } = await import('../../.core-dist/map/serialize.js');
const { validateMapDocument } = await import('../../.core-dist/map/validate.js');
const sessionApi = await import('../../.core-dist/editor/session.js');

function mapEntity(document, entityId) {
  const entity = document.entities.find((entry) => entry.id === entityId);
  assert.ok(entity, `Expected map entity ${entityId}`);
  return entity;
}

test('map duplicate planning is deterministic and respects global authored identity', () => {
  const first = planMapEntityDuplicate(SYNTHETIC_MAP, 'entity.ground');
  assert.deepEqual(first, {
    sourceEntityId: 'entity.ground',
    targetEntityId: 'entity.ground.copy.1',
    targetName: 'Ground slab copy 1',
  });

  const occupiedBySpawn = structuredClone(SYNTHETIC_MAP);
  occupiedBySpawn.spawnPoints.push({
    id: 'entity.ground.copy.1',
    pose: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
    },
  });
  const second = planMapEntityDuplicate(occupiedBySpawn, 'entity.ground');
  assert.equal(second.targetEntityId, 'entity.ground.copy.2');
  assert.equal(second.targetName, 'Ground slab copy 2');

  assert.throws(
    () => planMapEntityDuplicate(SYNTHETIC_MAP, 'entity.missing'),
    /not found/,
  );
});

test('map duplicate creates an independent valid authored entity without mutating its source', () => {
  const sourceText = serializeMapDocument(SYNTHETIC_MAP);
  const plan = planMapEntityDuplicate(SYNTHETIC_MAP, 'entity.ground');
  const duplicatedDocument = duplicateMapEntity(plan).apply(SYNTHETIC_MAP);
  const source = mapEntity(duplicatedDocument, 'entity.ground');
  const duplicate = mapEntity(duplicatedDocument, plan.targetEntityId);

  assert.equal(duplicate.id, plan.targetEntityId);
  assert.equal(duplicate.name, plan.targetName);
  assert.deepEqual(duplicate.pose, source.pose);
  assert.deepEqual(duplicate.collision, source.collision);
  assert.deepEqual(duplicate.visual, source.visual);
  assert.deepEqual(duplicate.surface, source.surface);

  assert.notStrictEqual(duplicate.pose, source.pose);
  assert.notStrictEqual(duplicate.pose.position, source.pose.position);
  assert.notStrictEqual(duplicate.collision, source.collision);
  assert.notStrictEqual(duplicate.visual, source.visual);
  assert.notStrictEqual(duplicate.surface, source.surface);

  const errors = validateMapDocument(duplicatedDocument).filter((item) => item.severity === 'error');
  assert.deepEqual(errors, []);
  assert.equal(serializeMapDocument(SYNTHETIC_MAP), sourceText);
});

test('duplicate -> transform -> resize -> delete participates in normal history with stable identity', () => {
  let session = sessionApi.createEditorSession(SYNTHETIC_MAP);
  const plan = planMapEntityDuplicate(session.committed, 'entity.ground');

  session = sessionApi.applyCommand(session, duplicateMapEntity(plan));
  assert.equal(session.committed.revision, 1);
  assert.ok(mapEntity(session.committed, plan.targetEntityId));

  session = sessionApi.applyCommand(session, setMapEntityPose(plan.targetEntityId, {
    position: { x: 2.5, y: 0.75, z: -1.25 },
    rotation: { x: 0, y: Math.SQRT1_2, z: 0, w: Math.SQRT1_2 },
  }));
  session = sessionApi.applyCommand(session, setMapBoxHalfExtents(plan.targetEntityId, {
    x: 2.25,
    y: 0.5,
    z: 1.75,
  }));
  assert.equal(session.committed.revision, 3);

  const beforeDeleteText = serializeMapDocument(session.committed);
  const beforeDeleteEntity = structuredClone(mapEntity(session.committed, plan.targetEntityId));

  session = sessionApi.applyCommand(session, deleteMapEntity(plan.targetEntityId));
  assert.equal(session.committed.revision, 4);
  assert.equal(session.committed.entities.some((entity) => entity.id === plan.targetEntityId), false);

  session = sessionApi.undo(session);
  assert.equal(session.committed.revision, 3);
  assert.deepEqual(mapEntity(session.committed, plan.targetEntityId), beforeDeleteEntity);
  assert.equal(serializeMapDocument(session.committed), beforeDeleteText);

  session = sessionApi.redo(session);
  assert.equal(session.committed.revision, 4);
  assert.equal(session.committed.entities.some((entity) => entity.id === plan.targetEntityId), false);

  session = sessionApi.undo(session);
  session = sessionApi.undo(session);
  session = sessionApi.undo(session);
  session = sessionApi.undo(session);
  assert.equal(session.committed.revision, 0);
  assert.equal(session.committed.entities.some((entity) => entity.id === plan.targetEntityId), false);
  assert.equal(serializeMapDocument(session.committed), serializeMapDocument(SYNTHETIC_MAP));
});

test('duplicate and delete fail closed when their identity assumptions are stale', () => {
  const plan = planMapEntityDuplicate(SYNTHETIC_MAP, 'entity.ground');
  const stale = structuredClone(SYNTHETIC_MAP);
  stale.spawnPoints.push({
    id: plan.targetEntityId,
    pose: {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
    },
  });
  const staleText = serializeMapDocument(stale);

  assert.throws(() => duplicateMapEntity(plan).apply(stale), /already exists/);
  assert.equal(serializeMapDocument(stale), staleText);

  const sourceText = serializeMapDocument(SYNTHETIC_MAP);
  assert.throws(() => deleteMapEntity('entity.missing').apply(SYNTHETIC_MAP), /not found/);
  assert.equal(serializeMapDocument(SYNTHETIC_MAP), sourceText);
});
