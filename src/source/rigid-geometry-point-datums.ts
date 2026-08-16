import type { Vec3 } from '../kernel/types.js';
import type { SourceDerivedPointDatumInspection } from './types.js';

export interface SourceRigidGeometryPiece {
  sourceNodeLocator: string;
  sourceNodeName: string | null;
  positions: readonly Vec3[];
  triangleCount: number;
}

function finiteVec3(value: Vec3, label: string): Vec3 {
  if (![value.x, value.y, value.z].every(Number.isFinite)) throw new Error(`${label} must contain finite coordinates.`);
  return { x: value.x, y: value.y, z: value.z };
}

function safeLocatorToken(locator: string): string {
  if (!locator.trim()) throw new Error('Rigid geometry piece must have a source node locator.');
  return encodeURIComponent(locator);
}

/**
 * Derive only the construction points demonstrated by the current real JV need:
 * the two X-axis ends of an axis-aligned rigid-piece bounding box.
 *
 * Position is geometry-derived. No mechanical axis/orientation is claimed here.
 */
export function deriveRigidGeometryXEndpointDatums(
  pieces: readonly SourceRigidGeometryPiece[],
): SourceDerivedPointDatumInspection[] {
  const output: SourceDerivedPointDatumInspection[] = [];
  for (const piece of pieces) {
    if (!Number.isInteger(piece.triangleCount) || piece.triangleCount < 1) throw new Error('Rigid geometry piece triangleCount must be a positive integer.');
    if (piece.positions.length < 3) throw new Error(`Rigid geometry piece ${piece.sourceNodeLocator} has too few positions.`);

    let min = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY, z: Number.POSITIVE_INFINITY };
    let max = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z: Number.NEGATIVE_INFINITY };
    for (let index = 0; index < piece.positions.length; index += 1) {
      const point = finiteVec3(piece.positions[index], `${piece.sourceNodeLocator}.positions[${index}]`);
      min = { x: Math.min(min.x, point.x), y: Math.min(min.y, point.y), z: Math.min(min.z, point.z) };
      max = { x: Math.max(max.x, point.x), y: Math.max(max.y, point.y), z: Math.max(max.z, point.z) };
    }
    if (!(max.x > min.x)) throw new Error(`Rigid geometry piece ${piece.sourceNodeLocator} has no non-zero X extent.`);

    const centerY = 0.5 * (min.y + max.y);
    const centerZ = 0.5 * (min.z + max.z);
    const sourceToken = safeLocatorToken(piece.sourceNodeLocator);
    const baseName = piece.sourceNodeName?.trim() || piece.sourceNodeLocator;
    for (const side of ['min', 'max'] as const) {
      output.push({
        locator: `gltf2.derived:rigid-x-end-v1:${sourceToken}:${side}`,
        name: `${baseName} · X ${side}`,
        sourceNodeLocator: piece.sourceNodeLocator,
        sourceNodeName: piece.sourceNodeName,
        sourceRevisionWorldPosition: {
          x: side === 'min' ? min.x : max.x,
          y: centerY,
          z: centerZ,
        },
        derivation: {
          algorithm: 'rigid-geometry-x-end-v1',
          side,
          boundsMin: { ...min },
          boundsMax: { ...max },
          triangleCount: piece.triangleCount,
        },
      });
    }
  }
  return output;
}
