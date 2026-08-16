import { readFileSync } from 'node:fs';
import { inspectGltfSource } from '../.core-dist/source/gltf-source-index.js';
import { createOrthogonalCrossAxisFrameLocator, resolveOrthogonalCrossAxisFrameLocator } from '../.core-dist/source/construction-frame-locator.js';
import { relativePose } from '../.core-dist/kernel/math.js';
import { resolveRigDocument } from '../.core-dist/kernel/resolve.js';

const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');
const bytes = readFileSync(sourcePath);
const inspection = inspectGltfSource(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const points = inspection.derivedPointDatums ?? [];

function nodeByName(name) {
  const node = inspection.nodes.find((candidate) => candidate.name === name);
  if (!node?.worldRigidPose || node.rigidCompatibility !== 'rigid') throw new Error(`Missing exact rigid SOURCE node ${name}.`);
  return node;
}

function pointLocator(sourceNodeLocator, side) {
  const point = points.find((candidate) => candidate.sourceNodeLocator === sourceNodeLocator && candidate.derivation.side === side);
  if (!point) throw new Error(`Missing exact derived ${side} X-end for ${sourceNodeLocator}.`);
  return point.locator;
}

const lowerArmSource = nodeByName('Chassis_Bottom');
const upStart = nodeByName('Axis_SuspensionTravel_Bottom');
const upEnd = nodeByName('Axis_SuspensionTravel_Top');
const locator = createOrthogonalCrossAxisFrameLocator({
  originPointLocator: pointLocator(lowerArmSource.locator, 'max'),
  radialEndpointPointLocator: pointLocator(lowerArmSource.locator, 'min'),
  upStartNodeLocator: upStart.locator,
  upEndNodeLocator: upEnd.locator,
});
const lowerHinge = resolveOrthogonalCrossAxisFrameLocator(inspection, locator, 'Lower wishbone hinge');

const lowerArmPose = lowerArmSource.worldRigidPose;
const chassisPose = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };
const document = {
  schemaVersion: 1,
  documentId: 'rig.real-jv-revolute-diagnostic',
  revision: 1,
  units: 'm-rad',
  coordinateSystem: { handedness: 'right', upAxis: 'Y' },
  sources: [],
  elements: [
    { id: 'element.lower-arm', name: 'Lower arm', pose: lowerArmPose },
    { id: 'element.chassis-reference', name: 'Owner chassis reference', pose: chassisPose },
  ],
  frames: [
    {
      id: 'frame.lower-arm.hinge',
      name: 'Lower hinge · arm side',
      ownerElementId: 'element.lower-arm',
      pose: relativePose(lowerArmPose, lowerHinge.sourceRevisionWorldPose),
      provenance: { kind: 'owner-authored' },
    },
    {
      id: 'frame.chassis.lower-hinge',
      name: 'Lower hinge · chassis side',
      ownerElementId: 'element.chassis-reference',
      pose: relativePose(chassisPose, lowerHinge.sourceRevisionWorldPose),
      provenance: { kind: 'owner-authored' },
    },
  ],
  relations: [{
    id: 'relation.lower-wishbone.chassis-hinge',
    type: 'revolute',
    frameA: 'frame.lower-arm.hinge',
    frameB: 'frame.chassis.lower-hinge',
  }],
};

const before = JSON.stringify(document);
const resolved = resolveRigDocument(document);
if (JSON.stringify(document) !== before) throw new Error('Revolute diagnostic mutated authored truth.');
const diagnostic = resolved.diagnostics.find((entry) => entry.references?.includes('relation.lower-wishbone.chassis-hinge'));
if (!diagnostic) throw new Error('Missing exact-JV revolute diagnostic.');
if (diagnostic.code !== 'relation.revolute.ok' || diagnostic.severity !== 'info') {
  throw new Error(`Exact-JV revolute diagnostic is not satisfied: ${JSON.stringify(diagnostic)}`);
}
if (diagnostic.metrics?.originResidualM !== 0 || diagnostic.metrics?.axisAngleRad !== 0 || diagnostic.metrics?.axisDot !== 1) {
  throw new Error(`Unexpected exact-JV revolute residual metrics: ${JSON.stringify(diagnostic.metrics)}`);
}

console.log('REAL_JV_REVOLUTE_DIAGNOSTIC_PASS', JSON.stringify({
  locator,
  diagnostic,
  lowerArmLocalFrame: document.frames[0].pose,
  chassisLocalFrame: document.frames[1].pose,
  worldFrame: lowerHinge.sourceRevisionWorldPose,
}));
