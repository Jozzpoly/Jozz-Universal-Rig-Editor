import test from 'node:test';
import assert from 'node:assert/strict';

const runtime = await import('../../.core-dist/app/state/source-runtime.js');

const asset = (name, objectUrl, locators = ['node/0']) => ({
  name,
  sha256: 'a'.repeat(64),
  objectUrl,
  inspection: {
    adapter: { id: 'gltf-2.0', version: 1 },
    nodeCount: locators.length,
    meshCount: 0,
    skinCount: 0,
    jointCount: 0,
    nodes: locators.map((locator, index) => ({
      locator,
      index,
      name: null,
      parentLocator: null,
      childCount: 0,
      hasMesh: false,
      isSkinJoint: false,
      localScale: { x: 1, y: 1, z: 1 },
      localRigidPose: null,
      worldRigidPose: null,
      rigidCompatibility: 'rigid',
    })),
  },
});

test('replacing SOURCE runtime asset resets source selection', () => {
  let state = runtime.createSourceRuntimeState();
  state = runtime.replaceSourceRuntimeAsset(state, asset('A', 'blob:a', ['node/a']));
  state = runtime.selectSourceRuntimeLocator(state, 'node/a');
  state = runtime.replaceSourceRuntimeAsset(state, asset('B', 'blob:b', ['node/b']));
  assert.equal(state.asset.name, 'B');
  assert.equal(state.selectedLocator, null);
});

test('SOURCE selection is constrained to the currently loaded inspection', () => {
  let state = runtime.replaceSourceRuntimeAsset(runtime.createSourceRuntimeState(), asset('A', 'blob:a', ['node/a']));
  assert.throws(() => runtime.selectSourceRuntimeLocator(state, 'node/missing'), /not present/);
  state = runtime.selectSourceRuntimeLocator(state, 'node/a');
  assert.equal(state.selectedLocator, 'node/a');
});

test('SOURCE selection cannot exist without a loaded asset', () => {
  const state = runtime.createSourceRuntimeState();
  assert.throws(() => runtime.selectSourceRuntimeLocator(state, 'node/a'), /without a loaded source asset/);
});

test('clearing SOURCE runtime drops asset and selection together', () => {
  let state = runtime.replaceSourceRuntimeAsset(runtime.createSourceRuntimeState(), asset('A', 'blob:a', ['node/a']));
  state = runtime.selectSourceRuntimeLocator(state, 'node/a');
  assert.deepEqual(runtime.clearSourceRuntimeAsset(), { asset: null, selectedLocator: null });
});
