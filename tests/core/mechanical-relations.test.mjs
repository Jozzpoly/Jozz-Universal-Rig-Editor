import test from 'node:test';
import assert from 'node:assert/strict';

const { validateRigDocument } = await import('../../.core-dist/kernel/validate.js');

const pose = (x = 0, y = 0, z = 0) => ({ position: { x, y, z }, rotation: { x: 0, y: 0, z: 0, w: 1 } });
const frame = (id, ownerElementId, position = [0, 0, 0]) => ({
  id,
  name: id,
  ownerElementId,
  pose: pose(...position),
  provenance: { kind: 'synthetic' },
});

function cornerDocument() {
  const elements = ['chassis', 'rack', 'carrier', 'knuckle', 'wheel', 'upper-arm', 'lower-arm'].map((id) => ({
    id: `element.${id}`,
    name: id,
    pose: pose(),
  }));
  const frames = [
    frame('frame.chassis.rack', 'element.chassis'), frame('frame.rack.chassis', 'element.rack'),
    frame('frame.chassis.upper-hinge', 'element.chassis'), frame('frame.upper-arm.hinge', 'element.upper-arm'),
    frame('frame.upper-arm.ball', 'element.upper-arm'), frame('frame.carrier.upper-ball', 'element.carrier'),
    frame('frame.chassis.lower-hinge', 'element.chassis'), frame('frame.lower-arm.hinge', 'element.lower-arm'),
    frame('frame.lower-arm.ball', 'element.lower-arm'), frame('frame.carrier.lower-ball', 'element.carrier'),
    frame('frame.carrier.steering', 'element.carrier'), frame('frame.knuckle.steering', 'element.knuckle'),
    frame('frame.knuckle.wheel-spin', 'element.knuckle'), frame('frame.wheel.spin', 'element.wheel'),
    frame('frame.chassis.coilover', 'element.chassis'), frame('frame.carrier.coilover', 'element.carrier', [0, -0.4, 0]),
    frame('frame.rack.tie-rod', 'element.rack'), frame('frame.knuckle.tie-rod', 'element.knuckle', [0, 0, 0.5]),
  ];
  return {
    schemaVersion: 1,
    documentId: 'fixture.mechanical-corner',
    revision: 0,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [],
    elements,
    frames,
    relations: [
      { id: 'relation.rack', type: 'prismatic', frameA: 'frame.chassis.rack', frameB: 'frame.rack.chassis', limits: { lowerM: -0.2, upperM: 0.2 } },
      { id: 'relation.upper-hinge', type: 'revolute', frameA: 'frame.chassis.upper-hinge', frameB: 'frame.upper-arm.hinge', limits: { lowerRad: -0.5, upperRad: 0.5 } },
      { id: 'relation.upper-ball', type: 'spherical', frameA: 'frame.upper-arm.ball', frameB: 'frame.carrier.upper-ball' },
      { id: 'relation.lower-hinge', type: 'revolute', frameA: 'frame.chassis.lower-hinge', frameB: 'frame.lower-arm.hinge', limits: { lowerRad: -0.5, upperRad: 0.5 } },
      { id: 'relation.lower-ball', type: 'spherical', frameA: 'frame.lower-arm.ball', frameB: 'frame.carrier.lower-ball' },
      { id: 'relation.steering', type: 'revolute', frameA: 'frame.carrier.steering', frameB: 'frame.knuckle.steering', limits: { lowerRad: -0.7, upperRad: 0.7 } },
      { id: 'relation.wheel-spin', type: 'revolute', frameA: 'frame.knuckle.wheel-spin', frameB: 'frame.wheel.spin' },
      { id: 'relation.coilover', type: 'distance-range', frameA: 'frame.chassis.coilover', frameB: 'frame.carrier.coilover', minLengthM: 0.25, maxLengthM: 0.55 },
      { id: 'relation.tie-rod', type: 'distance', frameA: 'frame.rack.tie-rod', frameB: 'frame.knuckle.tie-rod', lengthM: 0.5 },
    ],
  };
}

test('neutral mechanical relations describe a full wishbone/steering/wheel corner without consumer dynamics', () => {
  const document = cornerDocument();
  assert.deepEqual(validateRigDocument(document).filter((diagnostic) => diagnostic.severity === 'error'), []);
  const serializedRelations = JSON.stringify(document.relations).toLowerCase();
  for (const forbidden of ['mass', 'inertia', 'friction', 'hertz', 'damping', 'motor', 'servo', 'solver', 'box3d']) {
    assert.equal(serializedRelations.includes(forbidden), false, `mechanical intent leaked consumer field ${forbidden}`);
  }
});

test('the same relation vocabulary covers a piston and a rotor without new kernel entity types', () => {
  const document = cornerDocument();
  document.relations = [
    { id: 'relation.piston', type: 'prismatic', frameA: 'frame.chassis.rack', frameB: 'frame.rack.chassis', limits: { lowerM: 0, upperM: 0.3 } },
    { id: 'relation.rotor', type: 'revolute', frameA: 'frame.knuckle.wheel-spin', frameB: 'frame.wheel.spin' },
  ];
  assert.deepEqual(validateRigDocument(document).filter((diagnostic) => diagnostic.severity === 'error'), []);
});

test('mechanical geometric limits fail closed when reversed or non-finite', () => {
  const document = cornerDocument();
  document.relations = [
    { id: 'relation.bad-revolute', type: 'revolute', frameA: 'frame.carrier.steering', frameB: 'frame.knuckle.steering', limits: { lowerRad: 1, upperRad: -1 } },
    { id: 'relation.bad-prismatic', type: 'prismatic', frameA: 'frame.chassis.rack', frameB: 'frame.rack.chassis', limits: { lowerM: 0, upperM: Number.POSITIVE_INFINITY } },
    { id: 'relation.bad-distance', type: 'distance', frameA: 'frame.rack.tie-rod', frameB: 'frame.knuckle.tie-rod', lengthM: -1 },
    { id: 'relation.bad-range', type: 'distance-range', frameA: 'frame.chassis.coilover', frameB: 'frame.carrier.coilover', minLengthM: 0.6, maxLengthM: 0.3 },
  ];
  const codes = validateRigDocument(document).map((diagnostic) => diagnostic.code);
  assert.ok(codes.includes('relation.revolute.limits.invalid'));
  assert.ok(codes.includes('relation.prismatic.limits.invalid'));
  assert.ok(codes.includes('relation.distance.length.invalid'));
  assert.ok(codes.includes('relation.distance-range.limits.invalid'));
});
