import assert from 'node:assert/strict';
import test from 'node:test';

const {
  MAP_BOX_MIN_HALF_EXTENT,
  boxDimensionsFromHalfExtents,
  boxHalfExtentsFromDimensions,
} = await import('../../.core-dist/features/map-resize/box-resize.js');

test('box full dimensions round-trip exactly through authored halfExtents', () => {
  const halfExtents = { x: 5, y: 0.25, z: 2.75 };
  const dimensions = boxDimensionsFromHalfExtents(halfExtents);
  assert.deepEqual(dimensions, { x: 10, y: 0.5, z: 5.5 });
  assert.deepEqual(boxHalfExtentsFromDimensions(dimensions), halfExtents);
});

test('box numeric dimensions fail closed before reaching authored state', () => {
  assert.throws(
    () => boxHalfExtentsFromDimensions({ x: 0, y: 1, z: 1 }),
    /finite positive components/,
  );
  assert.throws(
    () => boxHalfExtentsFromDimensions({ x: Number.NaN, y: 1, z: 1 }),
    /finite positive components/,
  );

  const minimumDimensions = boxDimensionsFromHalfExtents({
    x: MAP_BOX_MIN_HALF_EXTENT,
    y: MAP_BOX_MIN_HALF_EXTENT,
    z: MAP_BOX_MIN_HALF_EXTENT,
  });
  assert.deepEqual(minimumDimensions, {
    x: MAP_BOX_MIN_HALF_EXTENT * 2,
    y: MAP_BOX_MIN_HALF_EXTENT * 2,
    z: MAP_BOX_MIN_HALF_EXTENT * 2,
  });
});
