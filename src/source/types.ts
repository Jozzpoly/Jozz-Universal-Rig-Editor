import type { RigidPose, Vec3 } from '../kernel/types.js';

export interface SourceAdapterIdentity {
  id: string;
  version: number;
}

export interface SourceNodeInspection {
  locator: string;
  index: number;
  name: string | null;
  parentLocator: string | null;
  childCount: number;
  hasMesh: boolean;
  isSkinJoint: boolean;
  localScale: Vec3;
  localRigidPose: RigidPose | null;
  worldRigidPose: RigidPose | null;
  rigidCompatibility: 'rigid' | 'local-scale' | 'matrix-transform' | 'non-rigid-ancestor';
}

export interface SourceDerivedPointDatumInspection {
  locator: string;
  name: string;
  sourceNodeLocator: string;
  sourceNodeName: string | null;
  sourceRevisionWorldPosition: Vec3;
  derivation: {
    algorithm: 'rigid-geometry-x-end-v1';
    side: 'min' | 'max';
    boundsMin: Vec3;
    boundsMax: Vec3;
    triangleCount: number;
  };
}

export interface SourceInspection {
  adapter: SourceAdapterIdentity;
  nodeCount: number;
  meshCount: number;
  skinCount: number;
  jointCount: number;
  nodes: SourceNodeInspection[];
  /** Optional while older saved/runtime inspection fixtures remain valid. */
  derivedPointDatums?: SourceDerivedPointDatumInspection[];
}
