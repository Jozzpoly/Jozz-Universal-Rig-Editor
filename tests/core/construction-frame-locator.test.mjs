import test from 'node:test';
import assert from 'node:assert/strict';

const {
  createOrthogonalCrossAxisFrameLocator,
  parseOrthogonalCrossAxisFrameLocator,
  resolveOrthogonalCrossAxisFrameLocator,
} = await import('../../.core-dist/source/construction-frame-locator.js');

const v = (x, y, z) => ({ x, y, z });
const identity = { x: 0, y: 0, z: 0, w: 1 };

function inspectionFixture() {
  return {
    adapter: { id: 'gltf-2.0', version: 1 },
    nodeCount: 2,
    meshCount: 0,
    skinCount: 0,
    jointCount: 0,
    nodes: [
      { locator: 'gltf2.node:11', index: 11, name: 'TravelTop', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: v(1, 1, 1), localRigidPose: { position: v(0, 2, 0), rotation: identity }, worldRigidPose: { position: v(0, 2, 0), rotation: identity }, rigidCompatibility: 'rigid' },
      { locator: 'gltf2.node:12', index: 12, name: 'TravelBottom', parentLocator: null, childCount: 0, hasMesh: false, isSkinJoint: false, localScale: v(1, 1, 1), localRigidPose: { position: v(0, -1, 0), rotation: identity }, worldRigidPose: { position: v(0, -1, 0), rotation: identity }, rigidCompatibility: 'rigid' },
    ],
    derivedPointDatums: [
      { locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max', name: 'inboard', sourceNodeLocator: 'gltf2.node:5', sourceNodeName: 'Chassis_Bottom', sourceRevisionWorldPosition: v(0.5, 0.03125, 0), derivation: { algorithm: 'rigid-geometry-x-end-v1', side: 'max', boundsMin: v(-0.8125, 0, 0), boundsMax: v(0.5, 0.0625, 0), triangleCount: 12 } },
      { locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min', name: 'outboard', sourceNodeLocator: 'gltf2.node:5', sourceNodeName: 'Chassis_Bottom', sourceRevisionWorldPosition: v(-0.8125, 0.03125, 0), derivation: { algorithm: 'rigid-geometry-x-end-v1', side: 'min', boundsMin: v(-0.8125, 0, 0), boundsMax: v(0.5, 0.0625, 0), triangleCount: 12 } },
    ],
  };
}

const recipe = {
  originPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max',
  radialEndpointPointLocator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min',
  upStartNodeLocator: 'gltf2.node:12',
  upEndNodeLocator: 'gltf2.node:11',
};

test('versioned construction locator round-trips all exact component locators without a side database', () => {
  const locator = createOrthogonalCrossAxisFrameLocator(recipe);
  assert.match(locator, /^source\.derived-frame:orthogonal-cross-axis-v1:/);
  assert.deepEqual(parseOrthogonalCrossAxisFrameLocator(locator), {
    algorithm: 'orthogonal-cross-axis-frame-v1',
    ...recipe,
  });
  assert.equal(parseOrthogonalCrossAxisFrameLocator('gltf2.node:5'), null);
});

test('self-describing locator deterministically re-resolves a full rigid frame from exact inspection evidence', () => {
  const locator = createOrthogonalCrossAxisFrameLocator(recipe);
  const frame = resolveOrthogonalCrossAxisFrameLocator(inspectionFixture(), locator, 'Lower wishbone hinge');
  assert.equal(frame.locator, locator);
  assert.deepEqual(frame.sourceRevisionWorldPose.position, v(0.5, 0.03125, 0));
  assert.deepEqual(frame.basis, { x: v(1, 0, 0), y: v(0, 1, 0), z: v(0, 0, 1) });
  assert.deepEqual(frame.sourceRevisionWorldPose.rotation, identity);
  assert.deepEqual(frame.derivation, {
    algorithm: 'orthogonal-cross-axis-frame-v1',
    originLocator: recipe.originPointLocator,
    radialEndpointLocator: recipe.radialEndpointPointLocator,
    upStartLocator: recipe.upStartNodeLocator,
    upEndLocator: recipe.upEndNodeLocator,
    orthogonalityError: 0,
  });
});

test('re-resolution fails closed when any exact recipe component is unavailable or not rigid', () => {
  const locator = createOrthogonalCrossAxisFrameLocator(recipe);
  const missingPoint = inspectionFixture();
  missingPoint.derivedPointDatums = missingPoint.derivedPointDatums.slice(0, 1);
  assert.throws(() => resolveOrthogonalCrossAxisFrameLocator(missingPoint, locator), /radial endpoint.*not present/i);

  const nonRigidUp = inspectionFixture();
  nonRigidUp.nodes[1] = { ...nonRigidUp.nodes[1], worldRigidPose: null, localRigidPose: null, rigidCompatibility: 'local-scale' };
  assert.throws(() => resolveOrthogonalCrossAxisFrameLocator(nonRigidUp, locator), /up-start node.*not rigid-compatible/i);
});

test('malformed construction locators fail closed instead of being partially interpreted', () => {
  assert.throws(() => parseOrthogonalCrossAxisFrameLocator('source.derived-frame:orthogonal-cross-axis-v1:a:b:c'), /component count/);
  assert.throws(() => parseOrthogonalCrossAxisFrameLocator('source.derived-frame:orthogonal-cross-axis-v1:%E0%A4%A:b:c:d'), /percent-encoded/);
  assert.throws(() => createOrthogonalCrossAxisFrameLocator({ ...recipe, upEndNodeLocator: ' ' }), /upEndNodeLocator.*non-empty/);
});
