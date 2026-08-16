import { composePose, IDENTITY_POSE, quat } from '../kernel/math.js';
import type { RigidPose, Vec3 } from '../kernel/types.js';
import { parseGltfContainer } from './gltf-container.js';
import { extractGltfRigidGeometryPieces } from './gltf-rigid-geometry.js';
import { deriveRigidGeometryXEndpointDatums } from './rigid-geometry-point-datums.js';
import type { SourceDerivedPointDatumInspection, SourceInspection, SourceNodeInspection } from './types.js';

export const GLTF2_SOURCE_ADAPTER = { id: 'gltf-2.0', version: 1 } as const;
const SCALE_EPSILON = 1e-9;

interface GltfNode {
  name?: unknown;
  children?: unknown;
  mesh?: unknown;
  translation?: unknown;
  rotation?: unknown;
  scale?: unknown;
  matrix?: unknown;
}

interface GltfSkin { joints?: unknown }
interface GltfJson {
  asset?: { version?: unknown };
  nodes?: unknown;
  meshes?: unknown;
  skins?: unknown;
}

function asFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} must be a finite number.`);
  return value;
}

function asIndex(value: unknown, upperBound: number, label: string): number {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) >= upperBound) throw new Error(`${label} must reference an existing node.`);
  return value as number;
}

function readVec3(value: unknown, fallback: readonly [number, number, number], label: string): Vec3 {
  if (value === undefined) return { x: fallback[0], y: fallback[1], z: fallback[2] };
  if (!Array.isArray(value) || value.length !== 3) throw new Error(`${label} must contain exactly 3 numbers.`);
  return {
    x: asFiniteNumber(value[0], `${label}[0]`),
    y: asFiniteNumber(value[1], `${label}[1]`),
    z: asFiniteNumber(value[2], `${label}[2]`),
  };
}

function readRigidPose(node: GltfNode, index: number): { pose: RigidPose | null; scale: Vec3; compatibility: SourceNodeInspection['rigidCompatibility'] } {
  const scale = readVec3(node.scale, [1, 1, 1], `nodes[${index}].scale`);
  if (node.matrix !== undefined) return { pose: null, scale, compatibility: 'matrix-transform' };
  if (Math.abs(scale.x - 1) > SCALE_EPSILON || Math.abs(scale.y - 1) > SCALE_EPSILON || Math.abs(scale.z - 1) > SCALE_EPSILON) {
    return { pose: null, scale, compatibility: 'local-scale' };
  }

  const translation = readVec3(node.translation, [0, 0, 0], `nodes[${index}].translation`);
  let rotation = IDENTITY_POSE.rotation;
  if (node.rotation !== undefined) {
    if (!Array.isArray(node.rotation) || node.rotation.length !== 4) throw new Error(`nodes[${index}].rotation must contain exactly 4 numbers.`);
    rotation = quat(
      asFiniteNumber(node.rotation[0], `nodes[${index}].rotation[0]`),
      asFiniteNumber(node.rotation[1], `nodes[${index}].rotation[1]`),
      asFiniteNumber(node.rotation[2], `nodes[${index}].rotation[2]`),
      asFiniteNumber(node.rotation[3], `nodes[${index}].rotation[3]`),
    );
  }
  return { pose: { position: translation, rotation }, scale, compatibility: 'rigid' };
}

function asNodeArray(value: unknown): GltfNode[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'object' || entry === null || Array.isArray(entry))) throw new Error('glTF nodes must be an array of objects.');
  return value as GltfNode[];
}

function countArray(value: unknown, label: string): number {
  if (value === undefined) return 0;
  if (!Array.isArray(value)) throw new Error(`glTF ${label} must be an array.`);
  return value.length;
}

function deriveAvailableRigidXEnds(
  pieces: ReturnType<typeof extractGltfRigidGeometryPieces>,
): SourceDerivedPointDatumInspection[] {
  const datums: SourceDerivedPointDatumInspection[] = [];
  for (const piece of pieces) {
    try {
      datums.push(...deriveRigidGeometryXEndpointDatums([piece]));
    } catch (error) {
      if (error instanceof Error && error.message.includes('has no non-zero X extent')) continue;
      throw error;
    }
  }
  return datums;
}

export function inspectGltfSource(bytes: ArrayBuffer): SourceInspection {
  const container = parseGltfContainer(bytes);
  const gltf = container.document as GltfJson;
  if (gltf.asset?.version !== '2.0') throw new Error(`Unsupported glTF asset version ${String(gltf.asset?.version)}; expected 2.0.`);

  const nodes = asNodeArray(gltf.nodes);
  const parents = new Array<number | null>(nodes.length).fill(null);
  for (let parentIndex = 0; parentIndex < nodes.length; parentIndex += 1) {
    const children = nodes[parentIndex].children;
    if (children === undefined) continue;
    if (!Array.isArray(children)) throw new Error(`nodes[${parentIndex}].children must be an array.`);
    for (const childValue of children) {
      const childIndex = asIndex(childValue, nodes.length, `nodes[${parentIndex}].children`);
      if (parents[childIndex] !== null) throw new Error(`Node ${childIndex} has more than one parent; source hierarchy is ambiguous.`);
      parents[childIndex] = parentIndex;
    }
  }

  const skinJoints = new Set<number>();
  if (gltf.skins !== undefined) {
    if (!Array.isArray(gltf.skins)) throw new Error('glTF skins must be an array.');
    for (let skinIndex = 0; skinIndex < gltf.skins.length; skinIndex += 1) {
      const skin = gltf.skins[skinIndex] as GltfSkin;
      if (!skin || typeof skin !== 'object' || Array.isArray(skin)) throw new Error(`skins[${skinIndex}] must be an object.`);
      if (skin.joints === undefined || !Array.isArray(skin.joints)) throw new Error(`skins[${skinIndex}].joints must be an array.`);
      for (const jointValue of skin.joints) skinJoints.add(asIndex(jointValue, nodes.length, `skins[${skinIndex}].joints`));
    }
  }

  const local = nodes.map((node, index) => readRigidPose(node, index));
  const worldCache = new Array<RigidPose | null | undefined>(nodes.length).fill(undefined);
  const compatibilityCache = new Array<SourceNodeInspection['rigidCompatibility'] | undefined>(nodes.length).fill(undefined);
  const visiting = new Set<number>();

  const resolveWorld = (index: number): { pose: RigidPose | null; compatibility: SourceNodeInspection['rigidCompatibility'] } => {
    if (worldCache[index] !== undefined && compatibilityCache[index] !== undefined) {
      return { pose: worldCache[index]!, compatibility: compatibilityCache[index]! };
    }
    if (visiting.has(index)) throw new Error(`Cycle detected in glTF node hierarchy at node ${index}.`);
    visiting.add(index);
    const localState = local[index];
    let pose = localState.pose;
    let compatibility = localState.compatibility;
    const parentIndex = parents[index];
    if (parentIndex !== null) {
      const parent = resolveWorld(parentIndex);
      if (parent.pose === null || pose === null) {
        pose = null;
        if (compatibility === 'rigid') compatibility = 'non-rigid-ancestor';
      } else {
        pose = composePose(parent.pose, pose);
      }
    }
    visiting.delete(index);
    worldCache[index] = pose;
    compatibilityCache[index] = compatibility;
    return { pose, compatibility };
  };

  const inspectedNodes = nodes.map((node, index): SourceNodeInspection => {
    const world = resolveWorld(index);
    const children = node.children;
    return {
      locator: `gltf2.node:${index}`,
      index,
      name: typeof node.name === 'string' ? node.name : null,
      parentLocator: parents[index] === null ? null : `gltf2.node:${parents[index]}`,
      childCount: Array.isArray(children) ? children.length : 0,
      hasMesh: Number.isInteger(node.mesh) && (node.mesh as number) >= 0,
      isSkinJoint: skinJoints.has(index),
      localScale: local[index].scale,
      localRigidPose: local[index].pose,
      worldRigidPose: world.pose,
      rigidCompatibility: world.compatibility,
    };
  });

  const rigidPieces = extractGltfRigidGeometryPieces(
    container.document,
    container.internalBuffers,
    inspectedNodes.map((node) => node.worldRigidPose),
  );
  const derivedPointDatums = deriveAvailableRigidXEnds(rigidPieces);

  return {
    adapter: GLTF2_SOURCE_ADAPTER,
    nodeCount: nodes.length,
    meshCount: countArray(gltf.meshes, 'meshes'),
    skinCount: countArray(gltf.skins, 'skins'),
    jointCount: skinJoints.size,
    nodes: inspectedNodes,
    derivedPointDatums,
  };
}
