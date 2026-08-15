import test from 'node:test';
import assert from 'node:assert/strict';

const { serializeJureProjectModel, parseJureProjectModel } = await import('../../.core-dist/project/serialize.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const sourceA = { id: 'source.a', label: 'A', uri: 'a.glb', sha256: 'a'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };
const sourceB = { id: 'source.b', label: 'B', uri: 'b.glb', sha256: 'b'.repeat(64), adapter: { id: 'gltf-2.0', version: 1 } };

function projectFixture() {
  const rig = {
    schemaVersion: 1,
    documentId: 'rig.vehicle',
    revision: 3,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [sourceB, sourceA],
    elements: [
      { id: 'element.wheel', name: 'Wheel', pose: pose(1, 0, 0), source: { sourceRevisionId: sourceA.id, locator: 'gltf2.node:1' } },
      { id: 'element.chassis', name: 'Chassis', pose: pose() },
    ],
    frames: [
      { id: 'frame.wheel.axis', name: 'Wheel axis', ownerElementId: 'element.wheel', pose: pose(), role: 'axis-datum', provenance: { kind: 'owner-authored' } },
      { id: 'frame.chassis.axis', name: 'Chassis axis', ownerElementId: 'element.chassis', pose: pose(), provenance: { kind: 'owner-authored' } },
    ],
    relations: [{ id: 'relation.wheel', type: 'revolute', frameA: 'frame.chassis.axis', frameB: 'frame.wheel.axis', limits: { lowerRad: -1, upperRad: 1 } }],
  };
  const representation = {
    schemaVersion: 1,
    documentId: 'representation.vehicle',
    revision: 2,
    rigDocumentId: rig.documentId,
    bindings: [{
      id: 'rep.wheel', type: 'rigid',
      target: { sourceInstanceId: 'instance.wheel', sourceRevisionId: sourceA.id, targetLocator: 'gltf2.node:5' },
      sourceDatumLocator: 'gltf2.node:1',
      rigDatum: { kind: 'element', id: 'element.wheel' },
    }],
  };
  return {
    schemaVersion: 1,
    projectId: 'project.roundtrip',
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: [sourceB, sourceA],
    sourceInstances: [
      { id: 'instance.wheel', name: 'Wheel', sourceRevisionId: sourceA.id, pose: pose(1, 0, 0) },
      { id: 'instance.chassis', name: 'Chassis', sourceRevisionId: sourceB.id, pose: pose() },
    ],
    consumerReferences: [{ id: 'reference.jv', label: 'JV', consumer: { id: 'jv-web', revision: 'abc123' }, payloadLocator: 'reference/jv.json', payloadSha256: 'c'.repeat(64) }],
    sourceAdoptions: [{ id: 'adopt.wheel', sourceInstanceId: 'instance.wheel', locator: 'gltf2.node:1', target: { documentId: rig.documentId, kind: 'element', id: 'element.wheel' } }],
    authoredDocuments: [{ kind: 'rig-representation', document: representation }, { kind: 'rig', document: rig }],
  };
}

test('logical project serialization is deterministic across array ordering and round-trips exactly', () => {
  const a = projectFixture();
  const b = structuredClone(a);
  b.sourceRevisions.reverse();
  b.sourceInstances.reverse();
  b.authoredDocuments.reverse();
  b.authoredDocuments.find((entry) => entry.kind === 'rig').document.sources.reverse();
  b.authoredDocuments.find((entry) => entry.kind === 'rig').document.elements.reverse();
  b.authoredDocuments.find((entry) => entry.kind === 'rig').document.frames.reverse();
  assert.equal(serializeJureProjectModel(a), serializeJureProjectModel(b));
  const once = serializeJureProjectModel(a);
  const parsed = parseJureProjectModel(once);
  assert.equal(serializeJureProjectModel(parsed), once);
});

test('canonical project save strips unknown fields instead of carrying accidental JSON payload forward', () => {
  const project = projectFixture();
  project.sourceRevisions[0].debug = 'drop-me';
  project.sourceInstances[0].pose.position.debug = 'drop-me';
  const rig = project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
  rig.elements[0].debug = 'drop-me';
  rig.relations[0].debug = 'drop-me';
  const text = serializeJureProjectModel(project);
  assert.equal(text.includes('drop-me'), false);
  assert.equal(text.includes('"debug"'), false);
});

test('unknown relation type is rejected before canonicalization', () => {
  const project = projectFixture();
  const rig = project.authoredDocuments.find((entry) => entry.kind === 'rig').document;
  rig.relations[0] = { id: 'relation.unknown', type: 'teleport', frameA: 'frame.chassis.axis', frameB: 'frame.wheel.axis' };
  assert.throws(() => serializeJureProjectModel(project), /project\.authored\.relation\.type\.unsupported/);
});

test('unknown representation binding type is rejected before canonicalization', () => {
  const project = projectFixture();
  const representation = project.authoredDocuments.find((entry) => entry.kind === 'rig-representation').document;
  representation.bindings[0] = {
    id: 'rep.unknown', type: 'magic',
    target: { sourceInstanceId: 'instance.wheel', sourceRevisionId: sourceA.id, targetLocator: 'gltf2.node:5' },
  };
  assert.throws(() => serializeJureProjectModel(project), /project\.authored\.representation\.binding\.type\.unsupported/);
});

test('unknown authored document kind is rejected rather than treated as representation', () => {
  const project = projectFixture();
  project.authoredDocuments.push({ kind: 'map', document: { documentId: 'map.test' } });
  assert.throws(() => serializeJureProjectModel(project), /project\.authored\.kind\.unsupported/);
});

test('exact source mismatch blocks serialization and requires explicit rebind', () => {
  const project = projectFixture();
  project.sourceInstances[0] = { ...project.sourceInstances[0], sourceRevisionId: sourceB.id };
  assert.throws(() => serializeJureProjectModel(project), /project\.representation\.source-revision\.mismatch/);
});

test('project parser rejects malformed top-level shapes', () => {
  assert.throws(() => parseJureProjectModel('{"schemaVersion":1,"projectId":"x"}'), /project\.shape\.invalid/);
});
