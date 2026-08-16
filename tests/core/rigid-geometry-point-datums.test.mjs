import test from 'node:test';
import assert from 'node:assert/strict';

const { deriveRigidGeometryXEndpointDatums } = await import('../../.core-dist/source/rigid-geometry-point-datums.js');

const v = (x, y, z) => ({ x, y, z });

test('rigid geometry X-end construction datums use X extremes with Y/Z bounds centre and stable provenance', () => {
  const datums = deriveRigidGeometryXEndpointDatums([{
    sourceNodeLocator: 'gltf2.node:5',
    sourceNodeName: 'Chassis_Bottom',
    positions: [
      v(-3, -2, 4),
      v(5, 6, 10),
      v(1, 2, -2),
      v(-1, 4, 8),
    ],
    triangleCount: 2,
  }]);

  assert.deepEqual(datums.map((datum) => ({
    locator: datum.locator,
    name: datum.name,
    position: datum.sourceRevisionWorldPosition,
    side: datum.derivation.side,
    boundsMin: datum.derivation.boundsMin,
    boundsMax: datum.derivation.boundsMax,
    triangleCount: datum.derivation.triangleCount,
  })), [
    {
      locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:min',
      name: 'Chassis_Bottom · X min',
      position: v(-3, 2, 4),
      side: 'min',
      boundsMin: v(-3, -2, -2),
      boundsMax: v(5, 6, 10),
      triangleCount: 2,
    },
    {
      locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A5:max',
      name: 'Chassis_Bottom · X max',
      position: v(5, 2, 4),
      side: 'max',
      boundsMin: v(-3, -2, -2),
      boundsMax: v(5, 6, 10),
      triangleCount: 2,
    },
  ]);
  assert.ok(datums.every((datum) => datum.derivation.algorithm === 'rigid-geometry-x-end-v1'));
});

test('construction datum derivation does not invent an orientation and fails closed on invalid rigid geometry', () => {
  const [datum] = deriveRigidGeometryXEndpointDatums([{
    sourceNodeLocator: 'gltf2.node:3',
    sourceNodeName: 'Upper arm',
    positions: [v(0, 0, 0), v(1, 1, 1), v(2, -1, 0)],
    triangleCount: 1,
  }]);
  assert.equal('rotation' in datum, false);
  assert.equal('sourceRevisionWorldPose' in datum, false);

  assert.throws(() => deriveRigidGeometryXEndpointDatums([{
    sourceNodeLocator: 'gltf2.node:3', sourceNodeName: null, positions: [v(1, 0, 0), v(1, 1, 0), v(1, 0, 1)], triangleCount: 1,
  }]), /no non-zero X extent/);
  assert.throws(() => deriveRigidGeometryXEndpointDatums([{
    sourceNodeLocator: 'gltf2.node:3', sourceNodeName: null, positions: [v(0, 0, 0), v(Number.NaN, 1, 0), v(2, 0, 1)], triangleCount: 1,
  }]), /finite coordinates/);
});
