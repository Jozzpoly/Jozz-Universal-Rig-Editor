import assert from 'node:assert/strict';
import test from 'node:test';

const { SYNTHETIC_RIG } = await import('../../.core-dist/fixtures/synthetic-rig.js');
const { parseRigDocument, serializeRigDocument } = await import('../../.core-dist/kernel/serialize.js');
const { resolveRigDocument } = await import('../../.core-dist/kernel/resolve.js');
const { validateRigDocument } = await import('../../.core-dist/kernel/validate.js');

const { composePose, relativePose } = await import('../../.core-dist/kernel/math.js');
const sessionApi = await import('../../.core-dist/editor/session.js');
const { worldPoseToAuthoredPose } = await import('../../.core-dist/editor/transform-target.js');
const { setElementPose, setFramePose, setTransformTargetPose } = await import('../../.core-dist/features/rig-transform/command.js');

test('RigDocument deterministic round trip', () => {
  const text = serializeRigDocument(SYNTHETIC_RIG);
  assert.equal(serializeRigDocument(parseRigDocument(text)), text);
});

test('a RigFrame may exist without any RigRelation', () => {
  assert.equal(SYNTHETIC_RIG.frames.some((frame) => frame.id === 'frame.link.axis'), true);
  assert.equal(SYNTHETIC_RIG.relations.some((relation) => relation.frameA === 'frame.link.axis' || relation.frameB === 'frame.link.axis'), false);
});

test('preview does not mutate committed authored truth until accept', () => {
  let session = sessionApi.createEditorSession(SYNTHETIC_RIG);
  session = sessionApi.beginPreview(session, 'Move link mount');
  session = sessionApi.updatePreview(session, setFramePose('frame.link.mount', {
    position: { x: -0.30, y: 0.12, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  }));
  assert.notDeepEqual(sessionApi.visibleDocument(session), session.committed);
  assert.equal(session.committed.revision, 0);
  session = sessionApi.cancelPreview(session);
  assert.equal(sessionApi.visibleDocument(session), SYNTHETIC_RIG);
});

test('commit + undo + redo preserves authored snapshots', () => {
  let session = sessionApi.createEditorSession(SYNTHETIC_RIG);
  session = sessionApi.applyCommand(session, setFramePose('frame.link.mount', {
    position: { x: -0.30, y: 0.12, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  }));
  assert.equal(session.committed.revision, 1);
  const committedText = serializeRigDocument(session.committed);
  session = sessionApi.undo(session);
  assert.equal(session.committed.revision, 0);
  session = sessionApi.redo(session);
  assert.equal(serializeRigDocument(session.committed), committedText);
});

test('origin-coincident diagnostic reports geometric residual', () => {
  const view = resolveRigDocument(SYNTHETIC_RIG);
  const diagnostic = view.diagnostics.find((item) => item.code === 'relation.origin-coincident.residual');
  assert.ok(diagnostic);
  assert.ok(diagnostic.metrics.residualM > 0.09 && diagnostic.metrics.residualM < 0.11);
});


test('world/local pose conversion round-trips through owner element space', () => {
  const owner = SYNTHETIC_RIG.elements.find((element) => element.id === 'element.link');
  const frame = SYNTHETIC_RIG.frames.find((item) => item.id === 'frame.link.mount');
  const world = composePose(owner.pose, frame.pose);
  const local = relativePose(owner.pose, world);
  assert.ok(Math.abs(local.position.x - frame.pose.position.x) < 1e-9);
  assert.ok(Math.abs(local.position.y - frame.pose.position.y) < 1e-9);
  assert.ok(Math.abs(local.position.z - frame.pose.position.z) < 1e-9);
});

test('moving a RigElement preserves its frame-local authored poses while resolved world frames follow it', () => {
  const originalFrame = SYNTHETIC_RIG.frames.find((frame) => frame.id === 'frame.link.mount');
  assert.ok(originalFrame);

  const nextElementPose = {
    position: { x: 1.1, y: 0.35, z: -0.2 },
    rotation: { x: 0, y: Math.sin(Math.PI / 8), z: 0, w: Math.cos(Math.PI / 8) },
  };

  let session = sessionApi.createEditorSession(SYNTHETIC_RIG);
  session = sessionApi.applyCommand(session, setElementPose('element.link', nextElementPose));

  const authoredFrame = session.committed.frames.find((frame) => frame.id === 'frame.link.mount');
  assert.deepEqual(authoredFrame.pose, originalFrame.pose);

  const resolved = resolveRigDocument(session.committed);
  const worldFrame = resolved.frameWorldPoses.get('frame.link.mount');
  const expectedWorld = composePose(nextElementPose, originalFrame.pose);
  assert.deepEqual(worldFrame, expectedWorld);
});

test('world gizmo poses convert to the correct authored space for both elements and frames', () => {
  const elementWorldPose = {
    position: { x: 0.8, y: 0.4, z: 0.1 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  assert.deepEqual(
    worldPoseToAuthoredPose(SYNTHETIC_RIG, { kind: 'element', id: 'element.link' }, elementWorldPose),
    elementWorldPose,
  );

  const owner = SYNTHETIC_RIG.elements.find((element) => element.id === 'element.link');
  assert.ok(owner);
  const desiredLocalFramePose = {
    position: { x: 0.11, y: -0.03, z: 0.07 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  };
  const desiredWorldFramePose = composePose(owner.pose, desiredLocalFramePose);
  const authored = worldPoseToAuthoredPose(
    SYNTHETIC_RIG,
    { kind: 'frame', id: 'frame.link.mount' },
    desiredWorldFramePose,
  );
  assert.ok(Math.abs(authored.position.x - desiredLocalFramePose.position.x) < 1e-9);
  assert.ok(Math.abs(authored.position.y - desiredLocalFramePose.position.y) < 1e-9);
  assert.ok(Math.abs(authored.position.z - desiredLocalFramePose.position.z) < 1e-9);
});

test('generic transform target command dispatches element and frame edits without parallel session logic', () => {
  let session = sessionApi.createEditorSession(SYNTHETIC_RIG);
  session = sessionApi.applyCommand(session, setTransformTargetPose(
    { kind: 'element', id: 'element.link' },
    {
      position: { x: 0.7, y: 0.2, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 2 },
    },
  ));
  const element = session.committed.elements.find((entry) => entry.id === 'element.link');
  assert.equal(element.pose.position.x, 0.7);
  assert.equal(element.pose.rotation.w, 1);

  session = sessionApi.applyCommand(session, setTransformTargetPose(
    { kind: 'frame', id: 'frame.link.axis' },
    {
      position: { x: 0.2, y: 0.01, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
    },
  ));
  const frame = session.committed.frames.find((entry) => entry.id === 'frame.link.axis');
  assert.equal(frame.pose.position.x, 0.2);
  assert.equal(frame.provenance.kind, 'owner-authored');
});

const { inspectGltfSource } = await import('../../.core-dist/source/gltf-source-index.js');

function utf8Buffer(text) {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function glbBuffer(json) {
  const encoder = new TextEncoder();
  const raw = encoder.encode(JSON.stringify(json));
  const paddedLength = Math.ceil(raw.length / 4) * 4;
  const totalLength = 20 + paddedLength;
  const bytes = new Uint8Array(totalLength);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);
  view.setUint32(12, paddedLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(raw, 20);
  bytes.fill(0x20, 20 + raw.length);
  return bytes.buffer;
}

test('glTF SOURCE inspection uses exact revision-local node indices as locators and resolves rigid hierarchy', () => {
  const source = {
    asset: { version: '2.0' },
    scenes: [{ nodes: [0] }],
    nodes: [
      { name: 'Duplicate', translation: [1, 0, 0], children: [1] },
      { name: 'Duplicate', translation: [0, 2, 0] },
    ],
    meshes: [],
    skins: [{ joints: [1] }],
  };
  const inspected = inspectGltfSource(utf8Buffer(JSON.stringify(source)));
  assert.equal(inspected.adapter.id, 'gltf-2.0');
  assert.equal(inspected.nodeCount, 2);
  assert.equal(inspected.jointCount, 1);
  assert.equal(inspected.nodes[0].locator, 'gltf2.node:0');
  assert.equal(inspected.nodes[1].locator, 'gltf2.node:1');
  assert.equal(inspected.nodes[1].parentLocator, 'gltf2.node:0');
  assert.equal(inspected.nodes[1].isSkinJoint, true);
  assert.deepEqual(inspected.nodes[1].worldRigidPose.position, { x: 1, y: 2, z: 0 });
});

test('glTF SOURCE inspection fails closed when scale makes a node unsuitable as a rigid authored proposal', () => {
  const source = {
    asset: { version: '2.0' },
    nodes: [
      { name: 'Scaled parent', scale: [2, 1, 1], children: [1] },
      { name: 'Child datum', translation: [0, 1, 0] },
    ],
  };
  const inspected = inspectGltfSource(utf8Buffer(JSON.stringify(source)));
  assert.equal(inspected.nodes[0].worldRigidPose, null);
  assert.equal(inspected.nodes[0].rigidCompatibility, 'local-scale');
  assert.equal(inspected.nodes[1].worldRigidPose, null);
  assert.equal(inspected.nodes[1].rigidCompatibility, 'non-rigid-ancestor');
});

test('GLB JSON container uses the same deterministic SOURCE locator contract', () => {
  const inspected = inspectGltfSource(glbBuffer({
    asset: { version: '2.0' },
    nodes: [{ name: 'Socket_WheelCenter' }],
    meshes: [{}],
  }));
  assert.equal(inspected.nodeCount, 1);
  assert.equal(inspected.meshCount, 1);
  assert.equal(inspected.nodes[0].locator, 'gltf2.node:0');
  assert.equal(inspected.nodes[0].name, 'Socket_WheelCenter');
});


test('source bindings are exact revision + adapter-qualified locators and frame owner edits preserve the binding', () => {
  const sourceId = 'source.test';
  const withSource = {
    ...SYNTHETIC_RIG,
    sources: [{
      id: sourceId,
      label: 'fixture.gltf',
      uri: 'fixture.gltf',
      sha256: 'a'.repeat(64),
      adapter: { id: 'gltf-2.0', version: 1 },
    }],
    frames: SYNTHETIC_RIG.frames.map((frame) => frame.id === 'frame.link.mount'
      ? { ...frame, source: { sourceRevisionId: sourceId, locator: 'gltf2.node:8' }, provenance: { kind: 'source-proposal' } }
      : frame),
  };
  assert.equal(validateRigDocument(withSource).filter((entry) => entry.severity === 'error').length, 0);

  let session = sessionApi.createEditorSession(withSource);
  session = sessionApi.applyCommand(session, setFramePose('frame.link.mount', {
    position: { x: -0.19, y: 0.03, z: 0 },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
  }));
  const frame = session.committed.frames.find((entry) => entry.id === 'frame.link.mount');
  assert.deepEqual(frame.source, { sourceRevisionId: sourceId, locator: 'gltf2.node:8' });
  assert.equal(frame.provenance.kind, 'owner-authored');
});

test('source binding validation fails closed for missing revisions or empty locators', () => {
  const invalid = {
    ...SYNTHETIC_RIG,
    frames: SYNTHETIC_RIG.frames.map((frame) => frame.id === 'frame.link.mount'
      ? { ...frame, source: { sourceRevisionId: 'source.missing', locator: '' } }
      : frame),
  };
  const codes = validateRigDocument(invalid).map((entry) => entry.code);
  assert.ok(codes.includes('source.binding.missing'));
  assert.ok(codes.includes('source.binding.locator.invalid'));
});
