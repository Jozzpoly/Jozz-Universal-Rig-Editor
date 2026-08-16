import test from 'node:test';
import assert from 'node:assert/strict';

const { inspectGltfSource } = await import('../../.core-dist/source/gltf-source-index.js');

function encodeRigidFixture({ mixedTriangle = false, softWeights = false, externalBuffer = false } = {}) {
  const positions = new Float32Array([
    -2, -1, -3,
     4, -1, -3,
     4,  3,  5,
    -2,  3,  5,
  ]);
  const joints = new Uint8Array([
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    ...(mixedTriangle ? [0, 0, 0, 0] : [0, 1, 0, 0]),
  ]);
  const weights = new Float32Array([
    ...(softWeights ? [0.2, 0.8, 0, 0] : [0, 1, 0, 0]),
    0, 1, 0, 0,
    0, 1, 0, 0,
    ...(mixedTriangle ? [1, 0, 0, 0] : [0, 1, 0, 0]),
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const total = 48 + 16 + 64 + 12;
  const binary = new Uint8Array(total);
  binary.set(new Uint8Array(positions.buffer), 0);
  binary.set(joints, 48);
  binary.set(new Uint8Array(weights.buffer), 64);
  binary.set(new Uint8Array(indices.buffer), 128);

  const document = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0, 1, 2] }],
    nodes: [
      { name: 'RootJoint' },
      { name: 'PieceJoint' },
      { name: 'MeshRoot', mesh: 0, skin: 0, translation: [10, 20, 30] },
    ],
    skins: [{ joints: [0, 1] }],
    meshes: [{ primitives: [{
      attributes: { POSITION: 0, JOINTS_0: 1, WEIGHTS_0: 2 },
      indices: 3,
    }] }],
    buffers: [{
      byteLength: total,
      uri: externalBuffer ? 'mesh.bin' : `data:application/octet-stream;base64,${Buffer.from(binary).toString('base64')}`,
    }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 48 },
      { buffer: 0, byteOffset: 48, byteLength: 16 },
      { buffer: 0, byteOffset: 64, byteLength: 64 },
      { buffer: 0, byteOffset: 128, byteLength: 12 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' },
      { bufferView: 1, componentType: 5121, count: 4, type: 'VEC4' },
      { bufferView: 2, componentType: 5126, count: 4, type: 'VEC4' },
      { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
    ],
  };
  return new TextEncoder().encode(JSON.stringify(document)).buffer;
}

test('glTF inspection recovers conservative rigid skin geometry and emits X-end point datums in SOURCE revision world space', () => {
  const inspection = inspectGltfSource(encodeRigidFixture());
  const datums = inspection.derivedPointDatums ?? [];
  assert.equal(datums.length, 2);
  assert.deepEqual(datums.map((datum) => ({
    locator: datum.locator,
    sourceNodeLocator: datum.sourceNodeLocator,
    position: datum.sourceRevisionWorldPosition,
    side: datum.derivation.side,
    triangleCount: datum.derivation.triangleCount,
  })), [
    {
      locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A1:min',
      sourceNodeLocator: 'gltf2.node:1',
      position: { x: 8, y: 21, z: 31 },
      side: 'min',
      triangleCount: 2,
    },
    {
      locator: 'gltf2.derived:rigid-x-end-v1:gltf2.node%3A1:max',
      sourceNodeLocator: 'gltf2.node:1',
      position: { x: 14, y: 21, z: 31 },
      side: 'max',
      triangleCount: 2,
    },
  ]);
});

test('mixed-joint or soft-weight skin primitives do not produce false construction datums', () => {
  assert.deepEqual(inspectGltfSource(encodeRigidFixture({ mixedTriangle: true })).derivedPointDatums, []);
  assert.deepEqual(inspectGltfSource(encodeRigidFixture({ softWeights: true })).derivedPointDatums, []);
});

test('an external-buffer glTF remains inspectable but does not pretend geometry-derived datums are available', () => {
  const inspection = inspectGltfSource(encodeRigidFixture({ externalBuffer: true }));
  assert.equal(inspection.nodeCount, 3);
  assert.equal(inspection.jointCount, 2);
  assert.deepEqual(inspection.derivedPointDatums, []);
});
