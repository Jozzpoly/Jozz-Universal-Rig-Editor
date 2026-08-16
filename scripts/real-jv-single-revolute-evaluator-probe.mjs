import { readFileSync } from 'node:fs';
import { inspectGltfSource } from '../.core-dist/source/gltf-source-index.js';
import { createOrthogonalCrossAxisFrameLocator, resolveOrthogonalCrossAxisFrameLocator } from '../.core-dist/source/construction-frame-locator.js';
import { relativePose } from '../.core-dist/kernel/math.js';
import { relationPrimaryAxisWorld } from '../.core-dist/kernel/relation-frame.js';
import { createSingleRevoluteEvaluator } from '../.core-dist/evaluation/single-revolute-evaluator.js';
import { beginRigTest, createRigTestState, evaluateRigTest, resetRigTest, setRigTestControl } from '../.core-dist/evaluation/test-state.js';
import { resolveRigPoseView } from '../.core-dist/evaluation/view.js';

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

function close(actual, expected, label, tolerance = 1e-10) {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${label}: ${actual} != ${expected}`);
}

function closeVec(actual, expected, label, tolerance = 1e-10) {
  close(actual.x, expected.x, `${label}.x`, tolerance);
  close(actual.y, expected.y, `${label}.y`, tolerance);
  close(actual.z, expected.z, `${label}.z`, tolerance);
}

function closePose(actual, expected, label, tolerance = 1e-10) {
  closeVec(actual.position, expected.position, `${label}.position`, tolerance);
  close(actual.rotation.x, expected.rotation.x, `${label}.rotation.x`, tolerance);
  close(actual.rotation.y, expected.rotation.y, `${label}.rotation.y`, tolerance);
  close(actual.rotation.z, expected.rotation.z, `${label}.rotation.z`, tolerance);
  close(actual.rotation.w, expected.rotation.w, `${label}.rotation.w`, tolerance);
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
  documentId: 'rig.real-jv-single-revolute-test',
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

const authoredBefore = JSON.stringify(document);
const evaluator = createSingleRevoluteEvaluator({
  relationId: 'relation.lower-wishbone.chassis-hinge',
  movingElementId: 'element.lower-arm',
  controlId: 'lower-hinge-angle',
});

let state = beginRigTest(createRigTestState());
state = setRigTestControl(state, 'lower-hinge-angle', 0);
state = evaluateRigTest(document, state, evaluator);
const zeroView = resolveRigPoseView(document, state.result);
closePose(zeroView.elementWorldPoses.get('element.lower-arm'), lowerArmPose, 'zero-angle lower-arm');
if (JSON.stringify(document) !== authoredBefore) throw new Error('Zero-angle TEST mutated exact-JV AUTHORED truth.');

const angleRad = Math.PI / 6;
state = setRigTestControl(state, 'lower-hinge-angle', angleRad);
state = evaluateRigTest(document, state, evaluator);
const evaluated = resolveRigPoseView(document, state.result);
const evaluatedArm = evaluated.elementWorldPoses.get('element.lower-arm');
const movingHinge = evaluated.frameWorldPoses.get('frame.lower-arm.hinge');
const fixedHinge = evaluated.frameWorldPoses.get('frame.chassis.lower-hinge');
if (!evaluatedArm || !movingHinge || !fixedHinge) throw new Error('Exact-JV TEST evaluator lost required element/frame poses.');
if (JSON.stringify(evaluatedArm) === JSON.stringify(lowerArmPose)) throw new Error('Exact-JV +30° TEST did not move the lower arm.');
closeVec(movingHinge.position, lowerHinge.sourceRevisionWorldPose.position, 'evaluated moving hinge origin');
closeVec(fixedHinge.position, lowerHinge.sourceRevisionWorldPose.position, 'evaluated fixed hinge origin');
closeVec(relationPrimaryAxisWorld(movingHinge), { x: 0, y: 0, z: 1 }, 'evaluated moving +Z');
closeVec(relationPrimaryAxisWorld(fixedHinge), { x: 0, y: 0, z: 1 }, 'evaluated fixed +Z');
if (state.result.diagnostics[0]?.code !== 'evaluation.single-revolute.applied') throw new Error('Exact-JV TEST evaluator did not report its transient control diagnostic.');
if (JSON.stringify(document) !== authoredBefore) throw new Error('Exact-JV +30° TEST mutated AUTHORED truth.');

state = resetRigTest(state);
if (state.result !== null || Object.keys(state.controls).length !== 0) throw new Error('Exact-JV TEST Reset did not clear evaluator influence.');
const resetView = resolveRigPoseView(document, state.result);
if (resetView.mode !== 'authored') throw new Error(`Exact-JV TEST Reset returned ${resetView.mode} instead of authored.`);
closePose(resetView.elementWorldPoses.get('element.lower-arm'), lowerArmPose, 'reset lower-arm');

console.log('REAL_JV_SINGLE_REVOLUTE_EVALUATOR_PASS', JSON.stringify({
  locator,
  angleRad,
  authoredLowerArmPose: lowerArmPose,
  evaluatedLowerArmPose: evaluatedArm,
  hingeWorldPose: movingHinge,
  primaryAxis: relationPrimaryAxisWorld(movingHinge),
  resetMode: resetView.mode,
}));
