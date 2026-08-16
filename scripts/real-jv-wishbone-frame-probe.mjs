import { readFileSync } from 'node:fs';
import { inspectGltfSource } from '../.core-dist/source/gltf-source-index.js';
import { deriveOrthogonalCrossAxisFrame } from '../.core-dist/source/construction-frame.js';

const sourcePath = process.env.JURE_REAL_SOURCE_PATH;
if (!sourcePath) throw new Error('JURE_REAL_SOURCE_PATH is required.');
const bytes = readFileSync(sourcePath);
const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const inspection = inspectGltfSource(arrayBuffer);
const points = inspection.derivedPointDatums ?? [];

function point(sourceNodeLocator, side) {
  const datum = points.find((candidate) => candidate.sourceNodeLocator === sourceNodeLocator && candidate.derivation.side === side);
  if (!datum) throw new Error(`Missing derived ${side} X-end for ${sourceNodeLocator}.`);
  return { locator: datum.locator, position: datum.sourceRevisionWorldPosition };
}

function nodePosition(name) {
  const node = inspection.nodes.find((candidate) => candidate.name === name);
  if (!node?.worldRigidPose) throw new Error(`Missing exact rigid SOURCE node ${name}.`);
  return { locator: node.locator, position: node.worldRigidPose.position };
}

function close(actual, expected, label, tolerance = 1e-10) {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${label}: ${actual} != ${expected}`);
}

function closeVec(actual, expected, label, tolerance = 1e-10) {
  close(actual.x, expected.x, `${label}.x`, tolerance);
  close(actual.y, expected.y, `${label}.y`, tolerance);
  close(actual.z, expected.z, `${label}.z`, tolerance);
}

const upBottom = nodePosition('Axis_SuspensionTravel_Bottom');
const upTop = nodePosition('Axis_SuspensionTravel_Top');

function wishboneFrame(label, sourceNodeLocator) {
  // Current JV S2 independently establishes max-X as the inboard/chassis end
  // and min-X as the wheel/outboard end for this exact unmirrored left SOURCE.
  // JURE's construction algorithm itself is neutral; this probe supplies that
  // evidenced ordering explicitly rather than baking vehicle semantics into it.
  return deriveOrthogonalCrossAxisFrame({
    locator: `probe.${label}.hinge-frame`,
    name: `${label} wishbone hinge frame`,
    origin: point(sourceNodeLocator, 'max'),
    radialEndpoint: point(sourceNodeLocator, 'min'),
    up: {
      startLocator: upBottom.locator,
      start: upBottom.position,
      endLocator: upTop.locator,
      end: upTop.position,
    },
  });
}

const upper = wishboneFrame('upper', 'gltf2.node:3');
const lower = wishboneFrame('lower', 'gltf2.node:5');

closeVec(upper.sourceRevisionWorldPose.position, { x: 0.5, y: 0.96875, z: 0 }, 'upper.origin');
closeVec(lower.sourceRevisionWorldPose.position, { x: 0.5, y: 0.03125, z: 0 }, 'lower.origin');
for (const [label, frame] of [['upper', upper], ['lower', lower]]) {
  closeVec(frame.basis.x, { x: 1, y: 0, z: 0 }, `${label}.basis.x`);
  closeVec(frame.basis.y, { x: 0, y: 1, z: 0 }, `${label}.basis.y`);
  closeVec(frame.basis.z, { x: 0, y: 0, z: 1 }, `${label}.basis.z`);
  close(frame.derivation.orthogonalityError, 0, `${label}.orthogonalityError`);
  close(frame.sourceRevisionWorldPose.rotation.x, 0, `${label}.rotation.x`);
  close(frame.sourceRevisionWorldPose.rotation.y, 0, `${label}.rotation.y`);
  close(frame.sourceRevisionWorldPose.rotation.z, 0, `${label}.rotation.z`);
  close(frame.sourceRevisionWorldPose.rotation.w, 1, `${label}.rotation.w`);
}

console.log('REAL_JV_WISHBONE_HINGE_FRAME_PASS', JSON.stringify({
  upper: {
    pose: upper.sourceRevisionWorldPose,
    basis: upper.basis,
    derivation: upper.derivation,
  },
  lower: {
    pose: lower.sourceRevisionWorldPose,
    basis: lower.basis,
    derivation: lower.derivation,
  },
}));
