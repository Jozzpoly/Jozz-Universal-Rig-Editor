import test from 'node:test';
import assert from 'node:assert/strict';

const { validateJureProjectModel } = await import('../../.core-dist/project/validate.js');
const { validateRigRepresentationDocument } = await import('../../.core-dist/representation/validate.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const source = { id: 'source.suspension.rev-a', label: 'Suspension', uri: 'suspension.gltf', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };
const target = (locator) => ({ sourceInstanceId: 'source-instance.fl', sourceRevisionId: source.id, targetLocator: locator });
const rig = {
  schemaVersion: 1,
  documentId: 'rig.vehicle',
  revision: 0,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [],
  elements: [
    { id: 'element.wheel', name: 'Wheel', pose: pose() },
    { id: 'element.knuckle', name: 'Knuckle', pose: pose() },
  ],
  frames: [
    { id: 'frame.wheel-center', name: 'Wheel center', ownerElementId: 'element.wheel', pose: pose(), provenance: { kind: 'owner-authored' } },
    { id: 'frame.damper-upper', name: 'Damper upper', ownerElementId: null, pose: pose(0, 1, 0), provenance: { kind: 'owner-authored' } },
    { id: 'frame.damper-lower', name: 'Damper lower', ownerElementId: 'element.knuckle', pose: pose(0, -1, 0), provenance: { kind: 'owner-authored' } },
    { id: 'frame.wishbone-inboard', name: 'Wishbone inboard', ownerElementId: null, pose: pose(-1, 0, 0), provenance: { kind: 'owner-authored' } },
    { id: 'frame.wishbone-outboard', name: 'Wishbone outboard', ownerElementId: 'element.knuckle', pose: pose(1, 0, 0), provenance: { kind: 'owner-authored' } },
    { id: 'frame.wishbone-roll', name: 'Wishbone roll', ownerElementId: null, pose: pose(0, 1, 0), provenance: { kind: 'owner-authored' } },
  ],
  relations: [],
};
const representation = {
  schemaVersion: 1,
  documentId: 'representation.vehicle',
  revision: 0,
  rigDocumentId: rig.documentId,
  bindings: [
    { id: 'rep.wheel', type: 'rigid', target: target('gltf2.node:wheel'), sourceDatumLocator: 'gltf2.node:wheel-center', rigDatum: { kind: 'frame', id: 'frame.wheel-center' } },
    { id: 'rep.skin-joint', type: 'rigid', target: target('gltf2.node:joint-wheel'), sourceDatumLocator: 'gltf2.node:joint-wheel', rigDatum: { kind: 'element', id: 'element.knuckle' } },
    { id: 'rep.damper-upper', type: 'aim', target: target('gltf2.node:damper-upper'), sourceAnchorLocator: 'gltf2.node:damper-source-upper', sourceAimLocator: 'gltf2.node:damper-source-lower', rigAnchorFrameId: 'frame.damper-upper', rigAimFrameId: 'frame.damper-lower' },
    { id: 'rep.damper-middle', type: 'span', target: target('gltf2.node:damper-middle'), sourceStartLocator: 'gltf2.node:damper-source-upper', sourceEndLocator: 'gltf2.node:damper-source-lower', rigStartFrameId: 'frame.damper-upper', rigEndFrameId: 'frame.damper-lower' },
    { id: 'rep.damper-lower', type: 'aim', target: target('gltf2.node:damper-lower'), sourceAnchorLocator: 'gltf2.node:damper-source-lower', sourceAimLocator: 'gltf2.node:damper-source-upper', rigAnchorFrameId: 'frame.damper-lower', rigAimFrameId: 'frame.damper-upper' },
    { id: 'rep.wishbone', type: 'span', target: target('gltf2.node:wishbone'), sourceStartLocator: 'gltf2.node:wishbone-inboard', sourceEndLocator: 'gltf2.node:wishbone-outboard', rigStartFrameId: 'frame.wishbone-inboard', rigEndFrameId: 'frame.wishbone-outboard', roll: { sourceLocator: 'gltf2.node:wishbone-roll', rigFrameId: 'frame.wishbone-roll' } },
  ],
};
const project = () => ({
  schemaVersion: 1,
  projectId: 'project.rep',
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sourceRevisions: [source],
  sourceInstances: [{ id: 'source-instance.fl', name: 'FL suspension', sourceRevisionId: source.id, pose: pose() }],
  consumerReferences: [],
  sourceAdoptions: [],
  authoredDocuments: [{ kind: 'rig', document: rig }, { kind: 'rig-representation', document: representation }],
});

test('separate authored representation document covers simultaneous rigid, aim, stretch-span and roll-pinned span mappings', () => {
  assert.deepEqual(validateRigRepresentationDocument(representation).filter((diagnostic) => diagnostic.severity === 'error'), []);
  assert.deepEqual(validateJureProjectModel(project()).filter((diagnostic) => diagnostic.severity === 'error'), []);
  assert.equal(representation.bindings.length, 6);
});

test('representation target captures exact source revision and fails closed when an instance is re-registered', () => {
  const candidate = project();
  candidate.sourceRevisions.push({ ...source, id: 'source.suspension.rev-b', sha256: 'b'.repeat(64) });
  candidate.sourceInstances[0] = { ...candidate.sourceInstances[0], sourceRevisionId: 'source.suspension.rev-b' };
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.representation.source-revision.mismatch'));
});

test('representation fails closed when authored rig datums disappear', () => {
  const candidate = project();
  candidate.authoredDocuments[0].document.frames = candidate.authoredDocuments[0].document.frames.filter((frame) => frame.id !== 'frame.damper-lower');
  const codes = validateJureProjectModel(candidate).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('project.representation.rig-frame.missing'));
});

test('representation remains outside RigDocument and carries non-rigid span intent without adding scale to rigid poses', () => {
  assert.equal('representations' in rig, false);
  assert.equal('scale' in rig.elements[0].pose, false);
  assert.equal(representation.bindings.some((binding) => binding.type === 'span'), true);
});
