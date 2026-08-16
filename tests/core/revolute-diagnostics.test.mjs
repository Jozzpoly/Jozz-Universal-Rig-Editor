import test from 'node:test';
import assert from 'node:assert/strict';

const { measureRevoluteFrameResidual } = await import('../../.core-dist/kernel/relation-frame.js');
const { resolveRigDocument } = await import('../../.core-dist/kernel/resolve.js');

const pose = (x = 0, y = 0, z = 0, rotation = { x: 0, y: 0, z: 0, w: 1 }) => ({ position: { x, y, z }, rotation });
const qx = (angle) => ({ x: Math.sin(angle / 2), y: 0, z: 0, w: Math.cos(angle / 2) });

function rig(frameBPose = pose()) {
  return {
    schemaVersion: 1,
    documentId: 'rig.revolute-diagnostic',
    revision: 1,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements: [
      { id: 'element.a', name: 'A', pose: pose() },
      { id: 'element.b', name: 'B', pose: pose() },
    ],
    frames: [
      { id: 'frame.a', name: 'A hinge', ownerElementId: 'element.a', pose: pose(), provenance: { kind: 'owner-authored' } },
      { id: 'frame.b', name: 'B hinge', ownerElementId: 'element.b', pose: frameBPose, provenance: { kind: 'owner-authored' } },
    ],
    relations: [{ id: 'relation.hinge', type: 'revolute', frameA: 'frame.a', frameB: 'frame.b' }],
  };
}

test('revolute diagnostic measures neutral origin and signed +Z alignment without solving', () => {
  const authored = rig();
  const before = JSON.stringify(authored);
  const resolved = resolveRigDocument(authored);
  const diagnostic = resolved.diagnostics.find((entry) => entry.code === 'relation.revolute.ok');
  assert.ok(diagnostic);
  assert.equal(diagnostic.severity, 'info');
  assert.equal(diagnostic.metrics.originResidualM, 0);
  assert.equal(diagnostic.metrics.axisAngleRad, 0);
  assert.equal(diagnostic.metrics.axisDot, 1);
  assert.equal(JSON.stringify(authored), before);
});

test('revolute diagnostic warns on origin or axis residual but never projects authored truth', () => {
  const moved = rig(pose(0.002, 0, 0));
  const movedBefore = JSON.stringify(moved);
  const movedDiagnostic = resolveRigDocument(moved).diagnostics.find((entry) => entry.code === 'relation.revolute.residual');
  assert.ok(movedDiagnostic);
  assert.equal(movedDiagnostic.severity, 'warning');
  assert.equal(movedDiagnostic.metrics.originResidualM, 0.002);
  assert.equal(movedDiagnostic.metrics.axisAngleRad, 0);
  assert.equal(JSON.stringify(moved), movedBefore);

  const tilted = rig(pose(0, 0, 0, qx(Math.PI / 2)));
  const tiltedDiagnostic = resolveRigDocument(tilted).diagnostics.find((entry) => entry.code === 'relation.revolute.residual');
  assert.ok(tiltedDiagnostic);
  assert.ok(Math.abs(tiltedDiagnostic.metrics.axisAngleRad - Math.PI / 2) < 1e-12);
  assert.ok(Math.abs(tiltedDiagnostic.metrics.axisDot) < 1e-12);
});

test('revolute primary-axis direction remains signed: anti-parallel +Z reports pi radians', () => {
  const residual = measureRevoluteFrameResidual(pose(), pose(0, 0, 0, qx(Math.PI)));
  assert.ok(Math.abs(residual.originResidualM) < 1e-12);
  assert.ok(Math.abs(residual.axisDot + 1) < 1e-12);
  assert.ok(Math.abs(residual.axisAngleRad - Math.PI) < 1e-12);
});
