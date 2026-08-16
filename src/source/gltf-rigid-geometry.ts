import { rotateVec3 } from '../kernel/math.js';
import type { RigidPose, Vec3 } from '../kernel/types.js';
import type { SourceRigidGeometryPiece } from './rigid-geometry-point-datums.js';

const WEIGHT_TOLERANCE = 2e-4;

interface DecodedAccessor {
  values: number[];
  count: number;
  width: number;
}

function objectRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value;
}

function indexValue(value: unknown, upperBound: number, label: string): number {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) >= upperBound) throw new Error(`${label} references an invalid index.`);
  return value as number;
}

function nonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) throw new Error(`${label} must be a non-negative integer.`);
  return value as number;
}

function componentBytes(componentType: number): number | null {
  if (componentType === 5121) return 1;
  if (componentType === 5123) return 2;
  if (componentType === 5125 || componentType === 5126) return 4;
  return null;
}

function typeWidth(type: unknown): number | null {
  if (type === 'SCALAR') return 1;
  if (type === 'VEC3') return 3;
  if (type === 'VEC4') return 4;
  return null;
}

function componentReader(componentType: number, view: DataView, offset: number): number {
  if (componentType === 5121) return view.getUint8(offset);
  if (componentType === 5123) return view.getUint16(offset, true);
  if (componentType === 5125) return view.getUint32(offset, true);
  if (componentType === 5126) return view.getFloat32(offset, true);
  throw new Error(`Unsupported accessor component type ${componentType}.`);
}

function decodeAccessorIfSupported(
  document: Record<string, unknown>,
  internalBuffers: ReadonlyMap<number, Uint8Array>,
  accessorIndexValue: unknown,
  expectedType: 'SCALAR' | 'VEC3' | 'VEC4',
  allowedComponentTypes: readonly number[],
  label: string,
): DecodedAccessor | null {
  const accessorsRaw = document.accessors;
  const viewsRaw = document.bufferViews;
  if (!Array.isArray(accessorsRaw) || !Array.isArray(viewsRaw)) return null;
  if (!Number.isInteger(accessorIndexValue) || (accessorIndexValue as number) < 0 || (accessorIndexValue as number) >= accessorsRaw.length) return null;
  const accessor = objectRecord(accessorsRaw[accessorIndexValue as number], `${label}.accessor`);
  if (accessor.sparse !== undefined || accessor.type !== expectedType) return null;
  const componentType = accessor.componentType;
  if (!Number.isInteger(componentType) || !allowedComponentTypes.includes(componentType as number)) return null;
  const bytesPerComponent = componentBytes(componentType as number);
  const width = typeWidth(accessor.type);
  if (bytesPerComponent === null || width === null) return null;
  if (!Number.isInteger(accessor.bufferView) || (accessor.bufferView as number) < 0 || (accessor.bufferView as number) >= viewsRaw.length) return null;
  const bufferView = objectRecord(viewsRaw[accessor.bufferView as number], `${label}.bufferView`);
  const bufferIndex = Number.isInteger(bufferView.buffer) ? bufferView.buffer as number : 0;
  const binary = internalBuffers.get(bufferIndex);
  if (!binary) return null;

  const count = nonNegativeInteger(accessor.count, `${label}.count`);
  if (count < 1) return null;
  const viewOffset = bufferView.byteOffset === undefined ? 0 : nonNegativeInteger(bufferView.byteOffset, `${label}.bufferView.byteOffset`);
  const accessorOffset = accessor.byteOffset === undefined ? 0 : nonNegativeInteger(accessor.byteOffset, `${label}.byteOffset`);
  const elementBytes = bytesPerComponent * width;
  const stride = bufferView.byteStride === undefined ? elementBytes : nonNegativeInteger(bufferView.byteStride, `${label}.bufferView.byteStride`);
  if (stride < elementBytes || stride % bytesPerComponent !== 0) throw new Error(`${label} has invalid byteStride.`);
  const viewLength = nonNegativeInteger(bufferView.byteLength, `${label}.bufferView.byteLength`);
  const start = viewOffset + accessorOffset;
  const end = start + (count - 1) * stride + elementBytes;
  if (end > viewOffset + viewLength || end > binary.byteLength) throw new Error(`${label} exceeds its internal bufferView.`);
  if (start % bytesPerComponent !== 0) throw new Error(`${label} violates component alignment.`);

  const dataView = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);
  const values = new Array<number>(count * width);
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const value = componentReader(componentType as number, dataView, start + row * stride + column * bytesPerComponent);
      if (!Number.isFinite(value)) throw new Error(`${label}[${row},${column}] must be finite.`);
      values[row * width + column] = value;
    }
  }
  return { values, count, width };
}

function rigidOwnerSlot(joints: DecodedAccessor, weights: DecodedAccessor, vertex: number, jointCount: number): number | null {
  let selectedSlot = -1;
  let selectedWeight = Number.NEGATIVE_INFINITY;
  let weightSum = 0;
  for (let slot = 0; slot < 4; slot += 1) {
    const joint = joints.values[vertex * 4 + slot];
    const weight = weights.values[vertex * 4 + slot];
    if (!Number.isInteger(joint) || joint < 0 || joint >= jointCount || weight < 0 || weight > 1) return null;
    weightSum += weight;
    if (weight > selectedWeight) {
      selectedWeight = weight;
      selectedSlot = joint;
    }
  }
  if (Math.abs(weightSum - 1) > WEIGHT_TOLERANCE || selectedWeight < 1 - WEIGHT_TOLERANCE) return null;
  for (let slot = 0; slot < 4; slot += 1) {
    const joint = joints.values[vertex * 4 + slot];
    const weight = weights.values[vertex * 4 + slot];
    if (joint !== selectedSlot && weight > WEIGHT_TOLERANCE) return null;
  }
  return selectedSlot;
}

function transformPoint(pose: RigidPose, local: Vec3): Vec3 {
  const rotated = rotateVec3(pose.rotation, local);
  return {
    x: pose.position.x + rotated.x,
    y: pose.position.y + rotated.y,
    z: pose.position.z + rotated.z,
  };
}

/**
 * Recover rigidly joint-owned skinned geometry conservatively.
 * Unsupported/deformable primitives are skipped rather than reinterpreted.
 */
export function extractGltfRigidGeometryPieces(
  document: Record<string, unknown>,
  internalBuffers: ReadonlyMap<number, Uint8Array>,
  nodeWorldPoses: readonly (RigidPose | null)[],
): SourceRigidGeometryPiece[] {
  const nodesRaw = document.nodes;
  const meshesRaw = document.meshes;
  const skinsRaw = document.skins;
  if (!Array.isArray(nodesRaw) || !Array.isArray(meshesRaw) || !Array.isArray(skinsRaw)) return [];

  const pieces = new Map<number, { sourceNodeLocator: string; sourceNodeName: string | null; positions: Vec3[]; triangleCount: number }>();

  for (let meshNodeIndex = 0; meshNodeIndex < nodesRaw.length; meshNodeIndex += 1) {
    const meshNode = objectRecord(nodesRaw[meshNodeIndex], `nodes[${meshNodeIndex}]`);
    if (!Number.isInteger(meshNode.mesh) || !Number.isInteger(meshNode.skin)) continue;
    const meshIndex = indexValue(meshNode.mesh, meshesRaw.length, `nodes[${meshNodeIndex}].mesh`);
    const skinIndex = indexValue(meshNode.skin, skinsRaw.length, `nodes[${meshNodeIndex}].skin`);
    const meshPose = nodeWorldPoses[meshNodeIndex] ?? null;
    if (meshPose === null) continue;

    const mesh = objectRecord(meshesRaw[meshIndex], `meshes[${meshIndex}]`);
    const skin = objectRecord(skinsRaw[skinIndex], `skins[${skinIndex}]`);
    const primitives = Array.isArray(mesh.primitives) ? mesh.primitives : [];
    const jointValues = Array.isArray(skin.joints) ? skin.joints : [];
    if (jointValues.length === 0) continue;
    const jointNodeIndices = jointValues.map((value, slot) => indexValue(value, nodesRaw.length, `skins[${skinIndex}].joints[${slot}]`));

    for (let primitiveIndex = 0; primitiveIndex < primitives.length; primitiveIndex += 1) {
      const primitive = objectRecord(primitives[primitiveIndex], `meshes[${meshIndex}].primitives[${primitiveIndex}]`);
      if (primitive.mode !== undefined && primitive.mode !== 4) continue;
      const attributes = typeof primitive.attributes === 'object' && primitive.attributes !== null && !Array.isArray(primitive.attributes)
        ? primitive.attributes as Record<string, unknown>
        : null;
      if (!attributes) continue;

      const positions = decodeAccessorIfSupported(document, internalBuffers, attributes.POSITION, 'VEC3', [5126], `primitive[${primitiveIndex}].POSITION`);
      const joints = decodeAccessorIfSupported(document, internalBuffers, attributes.JOINTS_0, 'VEC4', [5121, 5123], `primitive[${primitiveIndex}].JOINTS_0`);
      const weights = decodeAccessorIfSupported(document, internalBuffers, attributes.WEIGHTS_0, 'VEC4', [5126], `primitive[${primitiveIndex}].WEIGHTS_0`);
      const indices = decodeAccessorIfSupported(document, internalBuffers, primitive.indices, 'SCALAR', [5121, 5123, 5125], `primitive[${primitiveIndex}].indices`);
      if (!positions || !joints || !weights || !indices) continue;
      if (positions.count !== joints.count || positions.count !== weights.count || indices.values.length % 3 !== 0) continue;

      const ownerByVertex = new Array<number>(positions.count);
      let rigidPrimitive = true;
      for (let vertex = 0; vertex < positions.count; vertex += 1) {
        const owner = rigidOwnerSlot(joints, weights, vertex, jointNodeIndices.length);
        if (owner === null) {
          rigidPrimitive = false;
          break;
        }
        ownerByVertex[vertex] = owner;
      }
      if (!rigidPrimitive) continue;

      const triangles: Array<{ owner: number; vertices: number[] }> = [];
      for (let offset = 0; offset < indices.values.length; offset += 3) {
        const triangle = indices.values.slice(offset, offset + 3);
        if (triangle.some((value) => !Number.isInteger(value) || value < 0 || value >= positions.count)) {
          throw new Error(`primitive[${primitiveIndex}] contains an out-of-range index.`);
        }
        const owner = ownerByVertex[triangle[0]];
        if (ownerByVertex[triangle[1]] !== owner || ownerByVertex[triangle[2]] !== owner) {
          rigidPrimitive = false;
          break;
        }
        triangles.push({ owner, vertices: triangle });
      }
      if (!rigidPrimitive) continue;

      for (const triangle of triangles) {
        const sourceNodeIndex = jointNodeIndices[triangle.owner];
        const sourceNode = objectRecord(nodesRaw[sourceNodeIndex], `nodes[${sourceNodeIndex}]`);
        let piece = pieces.get(sourceNodeIndex);
        if (!piece) {
          piece = {
            sourceNodeLocator: `gltf2.node:${sourceNodeIndex}`,
            sourceNodeName: typeof sourceNode.name === 'string' ? sourceNode.name : null,
            positions: [],
            triangleCount: 0,
          };
          pieces.set(sourceNodeIndex, piece);
        }
        for (const vertex of triangle.vertices) {
          piece.positions.push(transformPoint(meshPose, {
            x: positions.values[vertex * 3],
            y: positions.values[vertex * 3 + 1],
            z: positions.values[vertex * 3 + 2],
          }));
        }
        piece.triangleCount += 1;
      }
    }
  }

  return [...pieces.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, piece]) => ({
      sourceNodeLocator: piece.sourceNodeLocator,
      sourceNodeName: piece.sourceNodeName,
      positions: piece.positions,
      triangleCount: piece.triangleCount,
    }));
}
