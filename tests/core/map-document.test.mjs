import assert from 'node:assert/strict';
import test from 'node:test';

const { SYNTHETIC_MAP } = await import('../../.core-dist/fixtures/synthetic-map.js');
const { parseMapDocument, serializeMapDocument } = await import('../../.core-dist/map/serialize.js');
const { validateMapDocument } = await import('../../.core-dist/map/validate.js');

function errorCodes(value) {
  return validateMapDocument(value)
    .filter((diagnostic) => diagnostic.severity === 'error')
    .map((diagnostic) => diagnostic.code);
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
