import type {
  MapCollision,
  MapDocument,
  MapEntity,
  MapRigidPose,
  MapSpawnPoint,
  MapVisual,
} from './types.js';
import { validateMapDocument } from './validate.js';

function canonicalPose(pose: MapRigidPose): MapRigidPose {
  return {
    position: { x: pose.position.x, y: pose.position.y, z: pose.position.z },
    rotation: { x: pose.rotation.x, y: pose.rotation.y, z: pose.rotation.z, w: pose.rotation.w },
  };
}

function canonicalCollision(collision: MapCollision): MapCollision {
  if (collision.kind === 'box') {
    return {
      kind: 'box',
      halfExtents: {
        x: collision.halfExtents.x,
        y: collision.halfExtents.y,
        z: collision.halfExtents.z,
      },
    };
  }
  return {
    kind: 'capsule',
    pointA: { x: collision.pointA.x, y: collision.pointA.y, z: collision.pointA.z },
    pointB: { x: collision.pointB.x, y: collision.pointB.y, z: collision.pointB.z },
    radius: collision.radius,
  };
}

function canonicalVisual(visual: MapVisual): MapVisual {
  if (visual.kind === 'none') return { kind: 'none' };
  return {
    kind: 'collision-proxy',
    color: [visual.color[0], visual.color[1], visual.color[2], visual.color[3]],
  };
}

function canonicalSpawn(spawn: MapSpawnPoint): MapSpawnPoint {
  return { id: spawn.id, pose: canonicalPose(spawn.pose) };
}

function canonicalEntity(entity: MapEntity): MapEntity {
  return {
    id: entity.id,
    name: entity.name,
    pose: canonicalPose(entity.pose),
    collision: canonicalCollision(entity.collision),
    visual: canonicalVisual(entity.visual),
    surface: { friction: entity.surface.friction },
  };
}

export function canonicalizeMapDocument(document: MapDocument): MapDocument {
  return {
    schemaVersion: 1,
    documentId: document.documentId,
    revision: document.revision,
    units: 'meter',
    coordinateSystem: {
      handedness: 'right',
      forwardAxis: '+X',
      upAxis: '+Y',
      rightAxis: '+Z',
    },
    spawnPoints: [...document.spawnPoints]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(canonicalSpawn),
    entities: [...document.entities]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(canonicalEntity),
  };
}

export function serializeMapDocument(document: MapDocument): string {
  const errors = validateMapDocument(document).filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Cannot serialize invalid MapDocument: ${errors.map((error) => error.code).join(', ')}`);
  return `${JSON.stringify(canonicalizeMapDocument(document), null, 2)}\n`;
}

export function parseMapDocument(text: string): MapDocument {
  const value: unknown = JSON.parse(text);
  const errors = validateMapDocument(value).filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Invalid MapDocument: ${errors.map((error) => error.code).join(', ')}`);
  return canonicalizeMapDocument(value as MapDocument);
}
