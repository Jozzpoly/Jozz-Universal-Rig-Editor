import assert from 'node:assert/strict';
import test from 'node:test';

const { SYNTHETIC_MAP } = await import('../../.core-dist/fixtures/synthetic-map.js');
const { parseMapDocument, serializeMapDocument } = await import('../../.core-dist/map/serialize.js');
const { validateMapDocument } = await import('../../.core-dist/map/validate.js');
const { setMapEntityPose } = await import('../../.core-dist/features/map-transform/command.js');
const {
  MAP_BOX_MIN_HALF_EXTENT,
  boxHalfExtentsFromScale,
  setMapBoxHalfExtents,
} = await import('../../.core-dist/features/map-resize/box-resize.js');
const sessionApi = await import('../../.core-dist/editor/session.js');

function errorCodes(value) {
  return validateMapDocument(value)
    .filter((diagnostic) => diagnostic.severity === 'error')
    .map((diagnostic) => diagnostic.code);
}

function mapEntity(document, entityId) {
  const entity = document.entities.find((entry) => entry.id === entityId);
  assert.ok(entity, `Expected map entity ${entityId}`);
  return entity;
}

test('MapDocument deterministic round trip is independent of authored array order', () => {
  const canonical = serializeMapDocument(SYNTHETIC_MAP);
  assert.equal(serializeMapDocument(parseMapDocument(canonical)), canonical);

  const reordered = structuredClone(SYNTHETIC_MAP);
  reordered.spawnPoints.reverse();
  reordered.entities.reverse();
  assert.equal(serializeMapDocument(reordered), canonical);
});

test('MapDocument identity is global across spawn points and entities', () => {
  const invalid = structuredClone(SYNTHETIC_MAP);
  invalid.entities[0].id = invalid.spawnPoints[0].id;
  assert.ok(errorCodes(invalid).includes('identity.duplicate'));
});

test('MapDocument v1 fails closed on unsupported basis and non-rigid pose', () => {
  const invalid = structuredClone(SYNTHETIC_MAP);
  invalid.coordinateSystem.forwardAxis = '-Z';
  invalid.entities[0].pose.rotation.w = 2;
  const codes = errorCodes(invalid);
  assert.ok(codes.includes('coordinates.unsupported'));
  assert.ok(codes.includes('entity.pose.invalid'));
});

test('MapDocument v1 rejects invalid primitive geometry, surface and visual data', () => {
  const invalid = structuredClone(SYNTHETIC_MAP);
  const ground = invalid.entities.find((entity) => entity.id === 'entity.ground');
  const bumper = invalid.entities.find((entity) => entity.id === 'entity.bumper');
  assert.ok(ground && ground.collision.kind === 'box');
  assert.ok(bumper && bumper.collision.kind === 'capsule');

  ground.collision.halfExtents.x = 0;
  ground.surface.friction = -0.1;
  ground.visual.color[0] = 2;
  bumper.collision.pointB = { ...bumper.collision.pointA };

  const codes = errorCodes(invalid);
  assert.ok(codes.includes('collision.box.halfExtents.invalid'));
  assert.ok(codes.includes('collision.capsule.degenerate'));
  assert.ok(codes.includes('surface.friction.invalid'));
  assert.ok(codes.includes('visual.color.invalid'));
});

test('MapDocument parser reports malformed structure instead of accepting partial JSON', () => {
  assert.throws(
    () => parseMapDocument('{"schemaVersion":1,"documentId":"partial"}'),
    /Invalid MapDocument:/,
  );
});

test('shared editor session previews, commits, undoes and redoes MapDocument authored truth', () => {
  let session = sessionApi.createEditorSession(SYNTHETIC_MAP);
  session = sessionApi.beginPreview(session, 'Move ground');
  session = sessionApi.updatePreview(session, setMapEntityPose('entity.ground', {
    position: { x: 1.5, y: -0.25, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 2 },
  }));

  const previewGround = mapEntity(sessionApi.visibleDocument(session), 'entity.ground');
  const committedGround = mapEntity(session.committed, 'entity.ground');
  assert.equal(previewGround.pose.position.x, 1.5);
  assert.equal(previewGround.pose.rotation.w, 1);
  assert.equal(committedGround.pose.position.x, 0);
  assert.equal(session.committed.revision, 0);

  session = sessionApi.commitPreview(session);
  assert.equal(session.committed.revision, 1);
  const committedText = serializeMapDocument(session.committed);

  session = sessionApi.undo(session);
  assert.equal(session.committed.revision, 0);
  session = sessionApi.redo(session);
  assert.equal(session.committed.revision, 1);
  assert.equal(serializeMapDocument(session.committed), committedText);
});

test('map transform command fails closed for missing entities and zero-length rotations', () => {
  const pose = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  assert.throws(() => setMapEntityPose('entity.missing', pose).apply(SYNTHETIC_MAP), /not found/);
  assert.throws(() => setMapEntityPose('entity.ground', {
    ...pose,
    rotation: { x: 0, y: 0, z: 0, w: 0 },
  }).apply(SYNTHETIC_MAP), /finite non-zero length/);
});

test('box resize authors halfExtents from a frozen source without mutating rigid pose or source document', () => {
  const sourceText = serializeMapDocument(SYNTHETIC_MAP);
  const sourceGround = mapEntity(SYNTHETIC_MAP, 'entity.ground');
  assert.equal(sourceGround.collision.kind, 'box');
  const sourcePose = structuredClone(sourceGround.pose);

  const resizedHalfExtents = boxHalfExtentsFromScale(sourceGround.collision.halfExtents, {
    x: 2,
    y: 0.5,
    z: 1.25,
  });
  assert.deepEqual(resizedHalfExtents, { x: 10, y: 0.125, z: 6.25 });

  const resized = setMapBoxHalfExtents('entity.ground', resizedHalfExtents).apply(SYNTHETIC_MAP);
  const resizedGround = mapEntity(resized, 'entity.ground');
  assert.equal(resizedGround.collision.kind, 'box');
  assert.deepEqual(resizedGround.collision.halfExtents, resizedHalfExtents);
  assert.deepEqual(resizedGround.pose, sourcePose);
  assert.equal(serializeMapDocument(SYNTHETIC_MAP), sourceText);
});

test('box resize scale conversion stays baseline-relative and handles proxy sign/degeneracy without compounding', () => {
  const source = { x: 5, y: 0.25, z: 5 };
  const firstPreview = boxHalfExtentsFromScale(source, { x: 1.1, y: 1, z: 1 });
  const laterPreview = boxHalfExtentsFromScale(source, { x: 1.2, y: 1, z: 1 });
  assert.equal(firstPreview.x, 5.5);
  assert.equal(laterPreview.x, 6);
  assert.notEqual(laterPreview.x, firstPreview.x * 1.2);

  const crossedCenter = boxHalfExtentsFromScale(source, { x: -0.5, y: 0, z: 1 });
  assert.equal(crossedCenter.x, 2.5);
  assert.equal(crossedCenter.y, MAP_BOX_MIN_HALF_EXTENT);
  assert.equal(crossedCenter.z, 5);
});

test('box resize command fails closed for invalid dimensions, missing entities and non-box targets', () => {
  assert.throws(
    () => setMapBoxHalfExtents('entity.ground', { x: 0, y: 1, z: 1 }),
    /finite positive components/,
  );
  assert.throws(
    () => setMapBoxHalfExtents('entity.ground', { x: Number.NaN, y: 1, z: 1 }),
    /finite positive components/,
  );
  assert.throws(
    () => boxHalfExtentsFromScale({ x: 1, y: 1, z: 1 }, { x: Number.POSITIVE_INFINITY, y: 1, z: 1 }),
    /finite components/,
  );
  assert.throws(
    () => setMapBoxHalfExtents('entity.missing', { x: 1, y: 1, z: 1 }).apply(SYNTHETIC_MAP),
    /not found/,
  );
  assert.throws(
    () => setMapBoxHalfExtents('entity.bumper', { x: 1, y: 1, z: 1 }).apply(SYNTHETIC_MAP),
    /not box geometry/,
  );
});

test('box geometry resize uses normal editor preview cancel commit undo redo semantics', () => {
  const originalGround = mapEntity(SYNTHETIC_MAP, 'entity.ground');
  assert.equal(originalGround.collision.kind, 'box');
  const resizedHalfExtents = boxHalfExtentsFromScale(originalGround.collision.halfExtents, { x: 1.5, y: 2, z: 0.5 });

  let session = sessionApi.createEditorSession(SYNTHETIC_MAP);
  session = sessionApi.beginPreview(session, 'Resize ground');
  session = sessionApi.updatePreview(session, setMapBoxHalfExtents('entity.ground', resizedHalfExtents));

  let previewGround = mapEntity(sessionApi.visibleDocument(session), 'entity.ground');
  let committedGround = mapEntity(session.committed, 'entity.ground');
  assert.equal(previewGround.collision.kind, 'box');
  assert.equal(committedGround.collision.kind, 'box');
  assert.deepEqual(previewGround.collision.halfExtents, resizedHalfExtents);
  assert.deepEqual(committedGround.collision.halfExtents, originalGround.collision.halfExtents);
  assert.deepEqual(previewGround.pose, originalGround.pose);

  session = sessionApi.cancelPreview(session);
  assert.deepEqual(
    mapEntity(sessionApi.visibleDocument(session), 'entity.ground').collision,
    originalGround.collision,
  );

  session = sessionApi.beginPreview(session, 'Resize ground');
  session = sessionApi.updatePreview(session, setMapBoxHalfExtents('entity.ground', resizedHalfExtents));
  session = sessionApi.commitPreview(session);
  assert.equal(session.committed.revision, 1);
  committedGround = mapEntity(session.committed, 'entity.ground');
  assert.equal(committedGround.collision.kind, 'box');
  assert.deepEqual(committedGround.collision.halfExtents, resizedHalfExtents);
  assert.deepEqual(committedGround.pose, originalGround.pose);

  session = sessionApi.undo(session);
  assert.deepEqual(mapEntity(session.committed, 'entity.ground').collision, originalGround.collision);
  session = sessionApi.redo(session);
  previewGround = mapEntity(session.committed, 'entity.ground');
  assert.equal(previewGround.collision.kind, 'box');
  assert.deepEqual(previewGround.collision.halfExtents, resizedHalfExtents);
});
