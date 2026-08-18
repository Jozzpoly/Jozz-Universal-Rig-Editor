import assert from 'node:assert/strict';
import test from 'node:test';

const {
  mapBoxFaceFrame,
  planMapBoxFaceResize,
  setMapBoxFaceResizeResult,
} = await import('../../.core-dist/features/map-resize/box-face-resize.js');
const { MAP_BOX_MIN_HALF_EXTENT } = await import('../../.core-dist/features/map-resize/box-resize.js');
const { SYNTHETIC_MAP } = await import('../../.core-dist/fixtures/synthetic-map.js');
const sessionApi = await import('../../.core-dist/editor/session.js');

const IDENTITY_POSE = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
};

function approx(actual, expected, epsilon = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} ≈ ${expected}`);
}

function approxVec3(actual, expected, epsilon = 1e-10) {
  approx(actual.x, expected.x, epsilon);
  approx(actual.y, expected.y, epsilon);
  approx(actual.z, expected.z, epsilon);
}

function entity(document, entityId) {
  const found = document.entities.find((entry) => entry.id === entityId);
  assert.ok(found, `Expected map entity ${entityId}`);
  return found;
}

test('signed face identity is explicit and opposite-face resize keeps the opposite face fixed', () => {
  const sourceHalfExtents = { x: 2, y: 1, z: 0.5 };
  const fixedBefore = mapBoxFaceFrame(IDENTITY_POSE, sourceHalfExtents, 'x', -1);

  const result = planMapBoxFaceResize(
    IDENTITY_POSE,
    sourceHalfExtents,
    'x',
    1,
    2,
    'opposite-face',
  );

  assert.deepEqual(result.halfExtents, { x: 3, y: 1, z: 0.5 });
  assert.deepEqual(result.pose.position, { x: 1, y: 0, z: 0 });
  assert.deepEqual(result.pose.rotation, IDENTITY_POSE.rotation);

  const fixedAfter = mapBoxFaceFrame(result.pose, result.halfExtents, 'x', -1);
  approxVec3(fixedAfter.center, fixedBefore.center);
});

test('contracting the negative face shifts center toward the fixed positive face', () => {
  const sourceHalfExtents = { x: 1, y: 2, z: 1 };
  const fixedBefore = mapBoxFaceFrame(IDENTITY_POSE, sourceHalfExtents, 'y', 1);

  const result = planMapBoxFaceResize(
    IDENTITY_POSE,
    sourceHalfExtents,
    'y',
    -1,
    -3,
  );

  assert.deepEqual(result.halfExtents, { x: 1, y: 0.5, z: 1 });
  assert.deepEqual(result.pose.position, { x: 0, y: 1.5, z: 0 });

  const fixedAfter = mapBoxFaceFrame(result.pose, result.halfExtents, 'y', 1);
  approxVec3(fixedAfter.center, fixedBefore.center);
});

test('Alt-style center resize preserves rigid pose and mirrors the opposite face', () => {
  const sourceHalfExtents = { x: 1, y: 1, z: 1 };
  const result = planMapBoxFaceResize(
    IDENTITY_POSE,
    sourceHalfExtents,
    'z',
    1,
    0.75,
    'center',
  );

  assert.deepEqual(result.pose, IDENTITY_POSE);
  assert.deepEqual(result.halfExtents, { x: 1, y: 1, z: 1.75 });
  assert.deepEqual(mapBoxFaceFrame(result.pose, result.halfExtents, 'z', 1).center, { x: 0, y: 0, z: 1.75 });
  assert.deepEqual(mapBoxFaceFrame(result.pose, result.halfExtents, 'z', -1).center, { x: 0, y: 0, z: -1.75 });
});

test('opposite-face invariant survives rotated authored boxes in world coordinates', () => {
  const sin45 = Math.SQRT1_2;
  const sourcePose = {
    position: { x: 1, y: 2, z: 3 },
    rotation: { x: 0, y: 0, z: sin45, w: sin45 },
  };
  const sourceHalfExtents = { x: 2, y: 1, z: 0.5 };
  const fixedBefore = mapBoxFaceFrame(sourcePose, sourceHalfExtents, 'x', -1);

  const result = planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'x', 1, 2);

  // +90° around Z rotates local +X into world +Y. Expanding +X by 2 m
  // therefore moves the authored center +1 m in world Y while -X stays fixed.
  approxVec3(result.pose.position, { x: 1, y: 3, z: 3 });
  assert.deepEqual(result.halfExtents, { x: 3, y: 1, z: 0.5 });
  assert.deepEqual(result.pose.rotation, sourcePose.rotation);

  const fixedAfter = mapBoxFaceFrame(result.pose, result.halfExtents, 'x', -1);
  approxVec3(fixedAfter.center, fixedBefore.center);
});

test('anchored resize clamps before inversion while still preserving the fixed face', () => {
  const sourceHalfExtents = { x: 1, y: 1, z: 1 };
  const fixedBefore = mapBoxFaceFrame(IDENTITY_POSE, sourceHalfExtents, 'x', -1);

  const result = planMapBoxFaceResize(IDENTITY_POSE, sourceHalfExtents, 'x', 1, -100);

  assert.equal(result.halfExtents.x, MAP_BOX_MIN_HALF_EXTENT);
  const fixedAfter = mapBoxFaceFrame(result.pose, result.halfExtents, 'x', -1);
  approxVec3(fixedAfter.center, fixedBefore.center, 1e-9);
});

test('face resize planner is baseline-pure and fails closed on invalid proposals', () => {
  const sourcePose = structuredClone(IDENTITY_POSE);
  const sourceHalfExtents = { x: 2, y: 3, z: 4 };
  const poseSnapshot = structuredClone(sourcePose);
  const halfSnapshot = structuredClone(sourceHalfExtents);

  planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'x', 1, 1.25);
  assert.deepEqual(sourcePose, poseSnapshot);
  assert.deepEqual(sourceHalfExtents, halfSnapshot);

  assert.throws(
    () => planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'x', 1, Number.NaN),
    /delta must be finite/,
  );
  assert.throws(
    () => planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'x', 0, 1),
    /side must be -1 or 1/,
  );
  assert.throws(
    () => planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'q', 1, 1),
    /Unsupported map box resize axis/,
  );
  assert.throws(
    () => planMapBoxFaceResize(sourcePose, sourceHalfExtents, 'x', 1, 1, 'mystery'),
    /Unsupported map box resize origin/,
  );
});

test('anchored pose and geometry commit atomically through one preview command', () => {
  const source = entity(SYNTHETIC_MAP, 'entity.ground');
  assert.equal(source.collision.kind, 'box');
  const fixedBefore = mapBoxFaceFrame(source.pose, source.collision.halfExtents, 'x', -1);
  const result = planMapBoxFaceResize(source.pose, source.collision.halfExtents, 'x', 1, 2.5);

  let session = sessionApi.createEditorSession(SYNTHETIC_MAP);
  session = sessionApi.beginPreview(session, 'Resize +X face');
  session = sessionApi.updatePreview(session, setMapBoxFaceResizeResult('entity.ground', result));

  const preview = entity(sessionApi.visibleDocument(session), 'entity.ground');
  const committedBefore = entity(session.committed, 'entity.ground');
  assert.equal(preview.collision.kind, 'box');
  assert.deepEqual(preview.pose, result.pose);
  assert.deepEqual(preview.collision.halfExtents, result.halfExtents);
  assert.deepEqual(committedBefore.pose, source.pose);
  assert.deepEqual(committedBefore.collision, source.collision);
  approxVec3(
    mapBoxFaceFrame(preview.pose, preview.collision.halfExtents, 'x', -1).center,
    fixedBefore.center,
  );

  session = sessionApi.commitPreview(session);
  assert.equal(session.committed.revision, SYNTHETIC_MAP.revision + 1);
  const committed = entity(session.committed, 'entity.ground');
  assert.deepEqual(committed.pose, result.pose);
  assert.equal(committed.collision.kind, 'box');
  assert.deepEqual(committed.collision.halfExtents, result.halfExtents);

  session = sessionApi.undo(session);
  assert.deepEqual(entity(session.committed, 'entity.ground'), source);
  session = sessionApi.redo(session);
  const redone = entity(session.committed, 'entity.ground');
  assert.deepEqual(redone.pose, result.pose);
  assert.equal(redone.collision.kind, 'box');
  assert.deepEqual(redone.collision.halfExtents, result.halfExtents);
});
