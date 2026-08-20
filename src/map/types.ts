export type MapId = string;

export interface MapVec3 {
  x: number;
  y: number;
  z: number;
}

export interface MapQuat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface MapRigidPose {
  position: MapVec3;
  rotation: MapQuat;
}

export interface MapSpawnPoint {
  id: MapId;
  pose: MapRigidPose;
}

export interface MapBoxCollision {
  kind: 'box';
  halfExtents: MapVec3;
}

export interface MapCapsuleCollision {
  kind: 'capsule';
  pointA: MapVec3;
  pointB: MapVec3;
  radius: number;
}

export type MapCollision = MapBoxCollision | MapCapsuleCollision;

export interface MapNoVisual {
  kind: 'none';
}

export interface MapCollisionProxyVisual {
  kind: 'collision-proxy';
  color: [number, number, number, number];
}

export type MapVisual = MapNoVisual | MapCollisionProxyVisual;

export interface MapSurface {
  friction: number;
}

export interface MapEntity {
  id: MapId;
  name: string;
  pose: MapRigidPose;
  collision: MapCollision;
  visual: MapVisual;
  surface: MapSurface;
}

export interface MapDocument {
  schemaVersion: 1;
  documentId: MapId;
  revision: number;
  units: 'meter';
  coordinateSystem: {
    handedness: 'right';
    forwardAxis: '+X';
    upAxis: '+Y';
    rightAxis: '+Z';
  };
  spawnPoints: MapSpawnPoint[];
  entities: MapEntity[];
}

export type MapDiagnosticSeverity = 'info' | 'warning' | 'error';

export interface MapDiagnostic {
  code: string;
  severity: MapDiagnosticSeverity;
  message: string;
  references: MapId[];
}
