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

export interface SourceInspection {
  adapter: SourceAdapterIdentity;
  nodeCount: number;
  meshCount: number;
  skinCount: number;
  jointCount: number;
  nodes: SourceNodeInspection[];
}
