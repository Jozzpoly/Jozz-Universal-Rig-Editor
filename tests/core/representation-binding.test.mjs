import assert from 'node:assert/strict';
import test from 'node:test';

const {
  createRepresentationBindingDraft,
  evaluateRepresentationBindingPose,
  representationBindingMatchesSource,
} = await import('../../.core-dist/editor/representation-binding-draft.js');

const elementWorldPose = {
  position: { x: 0.55, y: 0.12, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
};

const sourceWorldPose = {
  position: { x: -1.1875, y: 0.5, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
};

test('representation binding draft preserves the source pose at bind time', () => {
  const binding = createRepresentationBindingDraft({
    elementId: 'element.link',
    elementWorldPose,
    sourceSha256: 'a'.repeat(64),
    sourceLocator: 'gltf2.node:8',
    sourceNodeIndex: 8,
    sourceWorldPose,
  });

  assert.deepEqual(evaluateRepresentationBindingPose(binding, elementWorldPose), sourceWorldPose);
});

test('representation binding draft follows later element motion through a stable rest pose', () => {
  const binding = createRepresentationBindingDraft({
    elementId: 'element.link',
    elementWorldPose,
    sourceSha256: 'a'.repeat(64),
    sourceLocator: 'gltf2.node:8',
    sourceNodeIndex: 8,
    sourceWorldPose,
  });

  const movedElement = {
    position: { x: 1.05, y: 0.32, z: -0.25 },
    rotation: { x: 0, y: Math.sin(Math.PI / 8), z: 0, w: Math.cos(Math.PI / 8) },
  };
  const movedSource = evaluateRepresentationBindingPose(binding, movedElement);

  assert.notDeepEqual(movedSource, sourceWorldPose);
  assert.equal(binding.elementId, 'element.link');
  assert.equal(binding.sourceLocator, 'gltf2.node:8');
});

test('representation binding draft is exact-source qualified', () => {
  const binding = createRepresentationBindingDraft({
    elementId: 'element.link',
    elementWorldPose,
    sourceSha256: 'a'.repeat(64),
    sourceLocator: 'gltf2.node:8',
    sourceNodeIndex: 8,
    sourceWorldPose,
  });

  assert.equal(representationBindingMatchesSource(binding, 'a'.repeat(64)), true);
  assert.equal(representationBindingMatchesSource(binding, 'b'.repeat(64)), false);
});
