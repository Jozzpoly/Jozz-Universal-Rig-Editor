import assert from 'node:assert/strict';
import test from 'node:test';

import { effectiveMapTransformSpace } from '../../.core-dist/features/map-transform/space.js';

test('Map Move and Rotate honor the preferred transform space', () => {
  assert.equal(effectiveMapTransformSpace('translate', 'world'), 'world');
  assert.equal(effectiveMapTransformSpace('translate', 'local'), 'local');
  assert.equal(effectiveMapTransformSpace('rotate', 'world'), 'world');
  assert.equal(effectiveMapTransformSpace('rotate', 'local'), 'local');
});

test('Map Resize remains explicitly local without destroying the stored preference', () => {
  const preferredSpace = 'world';

  assert.equal(effectiveMapTransformSpace('translate', preferredSpace), 'world');
  assert.equal(effectiveMapTransformSpace('resize', preferredSpace), 'local');
  assert.equal(effectiveMapTransformSpace('rotate', preferredSpace), 'world');
});
