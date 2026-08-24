import test from 'node:test';
import assert from 'node:assert/strict';

const { resolveRigDocument } = await import('../../.core-dist/kernel/resolve.js');

const identity = { x: 0, y: 0, z: 0, w: 1 };
const pose = (x = 0, y = 0, z = 0, rotation = identity) => ({
  position: { x, y, z },
  rotation,
});

function fixture(frameBLocalPosition = { x: 0, y: 0, z: 0 }) {
  return {
    schemaVersion: 1,
    documentId: 'rig.spherical-diagnostic',
    revision: 3,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [
      { id: 'element.arm', name: 'Arm', pose: pose(1, 2, 3) },
      { id: 'element.carrier', name: 'Carrier', pose: pose(1, 2, 3) },
    ],
    frames: [
      {
        id: 'frame.arm.outboard',
        name: 'Arm outboard',
        ownerElementId: 'element.arm',
        pose: pose(0.25, 0.5, -0.125, identity),
        provenance: { kind: 'owner-authored' },
      },
      {
        id: 'frame.carrier.outboard',
        name: 'Carrier outboard',
        ownerElementId: 'element.carrier',
        pose: pose(
          frameBLocalPosition.x + 0.25,
          frameBLocalPosition.y + 0.5,
          frameBLocalPosition.z - 0.125,
          { x: Math.sin(Math.PI / 4), y: 0, z: 0, w: Math.cos(Math.PI / 4) },
        ),
        provenance: { kind: 'owner-authored' },
      },
    ],
    relations: [{
      id: 'relation.outboard',
      type: 'spherical',
      frameA: 'frame.arm.outboard',
      frameB: 'frame.carrier.outboard',
    }],
  };
}

test('spherical diagnostic requires coincident origins but deliberately ignores frame orientation', () => {
  const document = fixture();
  const authoredBefore = JSON.stringify(document);
  const view = resolveRigDocument(document);
  const diagnostic = view.diagnostics.find((entry) => entry.code === 'relation.spherical.ok');

  assert.ok(diagnostic);
  assert.equal(diagnostic.severity, 'info');
  assert.equal(diagnostic.metrics.residualM, 0);
  assert.equal(diagnostic.metrics.originDiagnosticToleranceM, 1e-6);
  assert.deepEqual(diagnostic.references, [
    'relation.outboard',
    'frame.arm.outboard',
    'frame.carrier.outboard',
  ]);
  assert.equal(JSON.stringify(document), authoredBefore, 'diagnostic must not mutate authored truth');
});

test('spherical diagnostic warns on origin residual without projecting either authored frame', () => {
  const document = fixture({ x: 0.004, y: -0.003, z: 0 });
  const authoredBefore = JSON.stringify(document);
  const view = resolveRigDocument(document);
  const diagnostic = view.diagnostics.find((entry) => entry.code === 'relation.spherical.residual');

  assert.ok(diagnostic);
  assert.equal(diagnostic.severity, 'warning');
  assert.ok(Math.abs(diagnostic.metrics.residualM - 0.005) <= 1e-12);
  assert.equal(diagnostic.metrics.originDiagnosticToleranceM, 1e-6);
  assert.equal(JSON.stringify(document), authoredBefore, 'warning must not project authored truth');
});
