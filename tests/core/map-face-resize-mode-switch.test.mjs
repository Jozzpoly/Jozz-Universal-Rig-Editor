import assert from 'node:assert/strict';
import test from 'node:test';

const {
  mapBoxFaceFrame,
  planMapBoxFaceResize,
  setMapBoxFaceResizeResult,
} = await import('../../.core-dist/features/map-resize/box-face-resize.js');
const { SYNTHETIC_MAP } = await import('../../.core-dist/fixtures/synthetic-map.js');
const sessionApi = await import('../../.core-dist/editor/session.js');

function entity(document, entityId) {
  const found = document.entities.find((entry) => entry.id === entityId);
  assert.ok(found, `Expected map entity ${entityId}`);
  return found;
}

function approx(actual, expected, epsilon = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} ≈ ${expected}`);
}

function approxVec3(actual, expected, epsilon = 1e-10) {
  approx(actual.x, expected.x, epsilon);
  approx(actual.y, expected.y, epsilon);
  approx(actual.z, expected.z, epsilon);
}

test('Alt toggles anchored -> center -> anchored from one frozen preview baseline without compounding', () => {
  const baselineEntity = entity(SYNTHETIC_MAP, 'entity.ground');
  assert.equal(baselineEntity.collision.kind, 'box');

  const delta = 2.4;
  const anchored = planMapBoxFaceResize(
    baselineEntity.pose,
    baselineEntity.collision.halfExtents,
    'x',
    1,
    delta,
    'opposite-face',
  );
  const centered = planMapBoxFaceResize(
    baselineEntity.pose,
    baselineEntity.collision.halfExtents,
    'x',
    1,
    delta,
    'center',
  );

  let session = sessionApi.createEditorSession(SYNTHETIC_MAP);
  session = sessionApi.beginPreview(session, 'Resize +X face');

  session = sessionApi.updatePreview(session, setMapBoxFaceResizeResult('entity.ground', anchored));
  let visible = entity(sessionApi.visibleDocument(session), 'entity.ground');
  assert.deepEqual(visible.pose, anchored.pose);
  assert.deepEqual(visible.collision.halfExtents, anchored.halfExtents);

  session = sessionApi.updatePreview(session, setMapBoxFaceResizeResult('entity.ground', centered));
  visible = entity(sessionApi.visibleDocument(session), 'entity.ground');
  assert.deepEqual(visible.pose, baselineEntity.pose);
  assert.deepEqual(visible.collision.halfExtents, centered.halfExtents);

  session = sessionApi.updatePreview(session, setMapBoxFaceResizeResult('entity.ground', anchored));
  visible = entity(sessionApi.visibleDocument(session), 'entity.ground');
  assert.deepEqual(visible.pose, anchored.pose);
  assert.deepEqual(visible.collision.halfExtents, anchored.halfExtents);

  const fixedBefore = mapBoxFaceFrame(
    baselineEntity.pose,
    baselineEntity.collision.halfExtents,
    'x',
    -1,
  );
  const fixedAfter = mapBoxFaceFrame(visible.pose, visible.collision.halfExtents, 'x', -1);
  approxVec3(fixedAfter.center, fixedBefore.center);

  // The committed authored truth is untouched until the pointer interaction commits.
  assert.deepEqual(entity(session.committed, 'entity.ground'), baselineEntity);
});
