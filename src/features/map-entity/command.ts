import type { EditorCommand } from '../../editor/session.js';
import type { MapDocument, MapEntity } from '../../map/types.js';

export interface MapEntityDuplicatePlan {
  sourceEntityId: string;
  targetEntityId: string;
  targetName: string;
}

function occupiedMapIds(document: MapDocument): Set<string> {
  return new Set([
    ...document.spawnPoints.map((spawn) => spawn.id),
    ...document.entities.map((entity) => entity.id),
  ]);
}

function cloneMapEntity(entity: MapEntity, id: string, name: string): MapEntity {
  return {
    id,
    name,
    pose: {
      position: { ...entity.pose.position },
      rotation: { ...entity.pose.rotation },
    },
    collision: entity.collision.kind === 'box'
      ? {
          kind: 'box',
          halfExtents: { ...entity.collision.halfExtents },
        }
      : {
          kind: 'capsule',
          pointA: { ...entity.collision.pointA },
          pointB: { ...entity.collision.pointB },
          radius: entity.collision.radius,
        },
    visual: entity.visual.kind === 'none'
      ? { kind: 'none' }
      : {
          kind: 'collision-proxy',
          color: [...entity.visual.color],
        },
    surface: { ...entity.surface },
  };
}

export function planMapEntityDuplicate(document: MapDocument, sourceEntityId: string): MapEntityDuplicatePlan {
  const source = document.entities.find((entity) => entity.id === sourceEntityId);
  if (!source) throw new Error(`Map entity ${sourceEntityId} not found.`);

  const occupied = occupiedMapIds(document);
  let index = 1;
  let targetEntityId = `${source.id}.copy.${index}`;
  while (occupied.has(targetEntityId)) {
    index += 1;
    targetEntityId = `${source.id}.copy.${index}`;
  }

  return {
    sourceEntityId,
    targetEntityId,
    targetName: `${source.name} copy ${index}`,
  };
}

export function duplicateMapEntity(plan: MapEntityDuplicatePlan): EditorCommand<MapDocument> {
  return {
    label: `Duplicate map entity: ${plan.sourceEntityId} -> ${plan.targetEntityId}`,
    apply(document: MapDocument): MapDocument {
      const source = document.entities.find((entity) => entity.id === plan.sourceEntityId);
      if (!source) throw new Error(`Map entity ${plan.sourceEntityId} not found.`);
      if (!plan.targetEntityId.trim()) throw new Error('Duplicated map entity ID must be non-empty.');
      if (!plan.targetName.trim()) throw new Error('Duplicated map entity name must be non-empty.');
      if (occupiedMapIds(document).has(plan.targetEntityId)) {
        throw new Error(`Map ID ${plan.targetEntityId} already exists.`);
      }

      const duplicate = cloneMapEntity(source, plan.targetEntityId, plan.targetName);
      return { ...document, entities: [...document.entities, duplicate] };
    },
  };
}

export function deleteMapEntity(entityId: string): EditorCommand<MapDocument> {
  return {
    label: `Delete map entity: ${entityId}`,
    apply(document: MapDocument): MapDocument {
      const index = document.entities.findIndex((entity) => entity.id === entityId);
      if (index < 0) throw new Error(`Map entity ${entityId} not found.`);
      return {
        ...document,
        entities: document.entities.filter((entity) => entity.id !== entityId),
      };
    },
  };
}
