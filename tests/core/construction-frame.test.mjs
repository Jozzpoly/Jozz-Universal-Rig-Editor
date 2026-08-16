import test from 'node:test';
import assert from 'node:assert/strict';

const { deriveOrthogonalCrossAxisFrame } = await import('../../.core-dist/source/construction-frame.js');
const { rotateVec3 } = await import('../../.core-dist/kernel/math.js');

const v = (x, y, z) => ({ x, y, z });

function closeVec(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual.x - expected.x) <= tolerance, `x ${actual.x} != ${expected.x}`);
  assert.ok(Math.abs(actual.y - expected.y) <= tolerance, `y ${actual.y} != ${expected.y}`);
  assert.ok(Math.abs(actual.z - expected.z) <= tolerance, `z ${actual.z} != ${expected.z}`);
}

test('orthogonal cross-axis construction produces a deterministic right-handed frame with local +Z on the cross axis', () => {
  const frame = deriveOrthogonalCrossAxisFrame({
    locator: 'construction.upper-hinge',
    name: 'Upper wishbone hinge',
    origin: { locator: 'point.inboard', position: v(0.5, 0.96875, 0) },
    radialEndpoint: { locator: 'point.outboard', position: v(-0.8125, 0.96875, 0) },
    up: {
      startLocator: 'node.travel-bottom',
      start: v(1.21875, -1.84375, 0.0625),
      endLocator: 'node.travel-top',
      end: v(1.21875, -0.78125, 0.0625),
    },
  });

  closeVec(frame.sourceRevisionWorldPose.position, v(0.5, 0.96875, 0));
  closeVec(frame.basis.x, v(1, 0, 0));
  closeVec(frame.basis.y, v(0, 1, 0));
  closeVec(frame.basis.z, v(0, 0, 1));
  closeVec(rotateVec3(frame.sourceRevisionWorldPose.rotation, v(0, 0, 1)), v(0, 0, 1));
  assert.ok(Math.abs(frame.sourceRevisionWorldPose.rotation.x) < 1e-12);
  assert.ok(Math.abs(frame.sourceRevisionWorldPose.rotation.y) < 1e-12);
  assert.ok(Math.abs(frame.sourceRevisionWorldPose.rotation.z) < 1e-12);
  assert.ok(Math.abs(frame.sourceRevisionWorldPose.rotation.w - 1) < 1e-12);
  assert.equal(frame.derivation.algorithm, 'orthogonal-cross-axis-frame-v1');
  assert.equal(frame.derivation.orthogonalityError, 0);
});

test('construction frame quaternion reproduces a non-identity right-handed basis', () => {
  const frame = deriveOrthogonalCrossAxisFrame({
    locator: 'construction.rotated',
    name: 'Rotated frame',
    origin: { locator: 'origin', position: v(2, 3, 4) },
    radialEndpoint: { locator: 'radial', position: v(2, 3, 2) },
    up: { startLocator: 'up.a', start: v(0, 0, 0), endLocator: 'up.b', end: v(0, 1, 0) },
  });

  // radial = -Z, up = +Y, therefore primary/local +Z = Y×(-Z) = -X.
  closeVec(frame.basis.x, v(0, 0, 1));
  closeVec(frame.basis.y, v(0, 1, 0));
  closeVec(frame.basis.z, v(-1, 0, 0));
  closeVec(rotateVec3(frame.sourceRevisionWorldPose.rotation, v(1, 0, 0)), frame.basis.x);
  closeVec(rotateVec3(frame.sourceRevisionWorldPose.rotation, v(0, 1, 0)), frame.basis.y);
  closeVec(rotateVec3(frame.sourceRevisionWorldPose.rotation, v(0, 0, 1)), frame.basis.z);
});

test('construction frame fails closed on missing provenance, degenerate directions and non-orthogonal evidence', () => {
  const valid = {
    locator: 'construction.valid',
    name: 'Valid',
    origin: { locator: 'origin', position: v(0, 0, 0) },
    radialEndpoint: { locator: 'radial', position: v(1, 0, 0) },
    up: { startLocator: 'up.a', start: v(0, 0, 0), endLocator: 'up.b', end: v(0, 1, 0) },
  };

  assert.throws(() => deriveOrthogonalCrossAxisFrame({ ...valid, locator: ' ' }), /locator and name/);
  assert.throws(() => deriveOrthogonalCrossAxisFrame({ ...valid, radialEndpoint: { locator: 'radial', position: v(0, 0, 0) } }), /radial direction.*non-zero/);
  assert.throws(() => deriveOrthogonalCrossAxisFrame({ ...valid, up: { startLocator: 'up.a', start: v(0, 0, 0), endLocator: 'up.b', end: v(0, 0, 0) } }), /up direction.*non-zero/);
  assert.throws(() => deriveOrthogonalCrossAxisFrame({ ...valid, up: { startLocator: 'up.a', start: v(0, 0, 0), endLocator: 'up.b', end: v(1, 1, 0) } }), /not orthogonal/);
  assert.throws(() => deriveOrthogonalCrossAxisFrame({ ...valid, origin: { locator: '', position: v(0, 0, 0) } }), /provenance locators/);
});
