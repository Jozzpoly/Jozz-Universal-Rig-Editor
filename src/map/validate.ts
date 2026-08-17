import type { MapDiagnostic, MapRigidPose, MapVec3 } from './types.js';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function vec3Finite(value: unknown): value is MapVec3 {
  if (!isRecord(value)) return false;
  return ['x', 'y', 'z'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
}

function poseValid(value: unknown): value is MapRigidPose {
  if (!isRecord(value) || !vec3Finite(value.position) || !isRecord(value.rotation)) return false;
  const rotation = value.rotation;
  const components = ['x', 'y', 'z', 'w'].map((key) => rotation[key]);
  if (!components.every((component) => typeof component === 'number' && Number.isFinite(component))) return false;
  const [x, y, z, w] = components as number[];
  return Math.abs(Math.hypot(x, y, z, w) - 1) <= 1e-6;
}

function positiveVec3(value: unknown): boolean {
  return vec3Finite(value) && value.x > 0 && value.y > 0 && value.z > 0;
}

function rgbaValid(value: unknown): boolean {
  return Array.isArray(value)
    && value.length === 4
    && value.every((component) => typeof component === 'number' && Number.isFinite(component) && component >= 0 && component <= 1);
}

function capsuleLength(pointA: MapVec3, pointB: MapVec3): number {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y, pointB.z - pointA.z);
}

export function validateMapDocument(value: unknown): MapDiagnostic[] {
  const diagnostics: MapDiagnostic[] = [];
  const error = (code: string, message: string, references: string[] = []) => {
    diagnostics.push({ code, severity: 'error', message, references });
  };

  if (!isRecord(value)) {
    error('document.invalid', 'MapDocument must be an object.');
    return diagnostics;
  }

  if (value.schemaVersion !== 1) error('schema.unsupported', `Unsupported schemaVersion ${String(value.schemaVersion)}.`);
  if (!isNonEmptyString(value.documentId)) error('document.id.invalid', 'MapDocument documentId must be a non-empty string.');
  if (!Number.isInteger(value.revision) || typeof value.revision !== 'number' || value.revision < 0) {
    error('revision.invalid', 'MapDocument revision must be a non-negative integer.');
  }
  if (value.units !== 'meter') error('units.unsupported', 'MapDocument v1 requires meter units.');

  const coordinates = value.coordinateSystem;
  if (!isRecord(coordinates)
    || coordinates.handedness !== 'right'
    || coordinates.forwardAxis !== '+X'
    || coordinates.upAxis !== '+Y'
    || coordinates.rightAxis !== '+Z') {
    error('coordinates.unsupported', 'MapDocument v1 requires right-handed +X forward, +Y up, +Z right coordinates.');
  }

  const ids = new Map<string, string>();
  const registerId = (id: unknown, kind: string): string | null => {
    if (!isNonEmptyString(id)) {
      error('identity.invalid', `${kind} must have a non-empty ID.`);
      return null;
    }
    const previous = ids.get(id);
    if (previous) error('identity.duplicate', `ID ${id} is used by both ${previous} and ${kind}.`, [id]);
    else ids.set(id, kind);
    return id;
  };

  if (!Array.isArray(value.spawnPoints)) {
    error('spawnPoints.invalid', 'MapDocument spawnPoints must be an array.');
  } else {
    for (const entry of value.spawnPoints) {
      if (!isRecord(entry)) {
        error('spawn.invalid', 'Spawn point entries must be objects.');
        continue;
      }
      const id = registerId(entry.id, 'spawn point');
      if (!poseValid(entry.pose)) error('spawn.pose.invalid', `Spawn point ${id ?? '<invalid>'} has an invalid rigid pose.`, id ? [id] : []);
    }
  }

  if (!Array.isArray(value.entities)) {
    error('entities.invalid', 'MapDocument entities must be an array.');
  } else {
    for (const entry of value.entities) {
      if (!isRecord(entry)) {
        error('entity.invalid', 'Map entity entries must be objects.');
        continue;
      }

      const id = registerId(entry.id, 'map entity');
      const reference = id ? [id] : [];
      if (!isNonEmptyString(entry.name)) error('entity.name.invalid', `Map entity ${id ?? '<invalid>'} must have a non-empty name.`, reference);
      if (!poseValid(entry.pose)) error('entity.pose.invalid', `Map entity ${id ?? '<invalid>'} has an invalid rigid pose.`, reference);

      const collision = entry.collision;
      if (!isRecord(collision)) {
        error('collision.invalid', `Map entity ${id ?? '<invalid>'} must define a collision object.`, reference);
      } else if (collision.kind === 'box') {
        if (!positiveVec3(collision.halfExtents)) {
          error('collision.box.halfExtents.invalid', `Map entity ${id ?? '<invalid>'} box halfExtents must be finite and positive.`, reference);
        }
      } else if (collision.kind === 'capsule') {
        const radiusValid = typeof collision.radius === 'number' && Number.isFinite(collision.radius) && collision.radius > 0;
        if (!vec3Finite(collision.pointA) || !vec3Finite(collision.pointB) || !radiusValid) {
          error('collision.capsule.invalid', `Map entity ${id ?? '<invalid>'} capsule requires finite endpoints and a positive radius.`, reference);
        } else if (capsuleLength(collision.pointA, collision.pointB) <= 1e-9) {
          error('collision.capsule.degenerate', `Map entity ${id ?? '<invalid>'} capsule endpoints must not coincide.`, reference);
        }
      } else {
        error('collision.kind.unsupported', `Map entity ${id ?? '<invalid>'} uses an unsupported collision kind ${String(collision.kind)}.`, reference);
      }

      const visual = entry.visual;
      if (!isRecord(visual)) {
        error('visual.invalid', `Map entity ${id ?? '<invalid>'} must define a visual object.`, reference);
      } else if (visual.kind === 'collision-proxy') {
        if (!rgbaValid(visual.color)) error('visual.color.invalid', `Map entity ${id ?? '<invalid>'} visual color must contain four normalized finite channels.`, reference);
      } else if (visual.kind !== 'none') {
        error('visual.kind.unsupported', `Map entity ${id ?? '<invalid>'} uses an unsupported visual kind ${String(visual.kind)}.`, reference);
      }

      const surface = entry.surface;
      if (!isRecord(surface)
        || typeof surface.friction !== 'number'
        || !Number.isFinite(surface.friction)
        || surface.friction < 0) {
        error('surface.friction.invalid', `Map entity ${id ?? '<invalid>'} friction must be finite and non-negative.`, reference);
      }
    }
  }

  return diagnostics;
}
