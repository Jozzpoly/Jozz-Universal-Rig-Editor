import type { EditorCommand } from '../../editor/session.js';
import type { MapDocument, MapVec3 } from '../../map/types.js';

// Tool-level degeneracy floor only. This is not a statement about the final map schema
// or the smallest meaningful authored feature; it prevents a scale gizmo from collapsing
// a box to an exactly degenerate shape during interactive preview.
export const MAP_BOX_MIN_HALF_EXTENT = 1e-6;

function assertFinitePositiveVec3(value: MapVec3, label: string): void {
  if (![value.x, value.y, value.z].every((component) => Number.isFinite(component) && component > 0)) {
    throw new Error(`${label} must contain finite positive components.`);
  }
}

function cloneHalfExtents(value: MapVec3): MapVec3 {
  assertFinitePositiveVec3(value, 'Map box halfExtents');
  return { x: value.x, y: value.y, z: value.z };
}

export function boxHalfExtentsFromScale(source: MapVec3, scale: MapVec3): MapVec3 {
  assertFinitePositiveVec3(source, 'Source map box halfExtents');
  if (![scale.x, scale.y, scale.z].every((component) => Number.isFinite(component))) {
    throw new Error('Map box resize scale must contain finite components.');
  }

  // Box authored dimensions have magnitude but no handedness. A renderer proxy may cross
  // through zero and report a negative local scale; the authored box remains a positive
  // dimension with the same rigid pose. Clamp only the exact degeneracy neighborhood.
  return {
    x: Math.max(Math.abs(source.x * scale.x), MAP_BOX_MIN_HALF_EXTENT),
    y: Math.max(Math.abs(source.y * scale.y), MAP_BOX_MIN_HALF_EXTENT),
    z: Math.max(Math.abs(source.z * scale.z), MAP_BOX_MIN_HALF_EXTENT),
  };
}

export function setMapBoxHalfExtents(entityId: string, halfExtents: MapVec3): EditorCommand<MapDocument> {
  const authoredHalfExtents = cloneHalfExtents(halfExtents);

  return {
    label: `Resize map box: ${entityId}`,
    apply(document: MapDocument): MapDocument {
      let found = false;
      const entities = document.entities.map((entity) => {
        if (entity.id !== entityId) return entity;
        found = true;
        if (entity.collision.kind !== 'box') {
          throw new Error(`Map entity ${entityId} is ${entity.collision.kind}, not box geometry.`);
        }
        return {
          ...entity,
          collision: {
            ...entity.collision,
            halfExtents: { ...authoredHalfExtents },
          },
        };
      });

      if (!found) throw new Error(`Map entity ${entityId} not found.`);
      return { ...document, entities };
    },
  };
}
