export type RigId = string;

export interface Vec3 { x: number; y: number; z: number }
export interface Quat { x: number; y: number; z: number; w: number }
export interface RigidPose { position: Vec3; rotation: Quat }

export interface SourceAdapterRef {
  id: string;
  version: number;
}

export interface SourceRevision {
  id: RigId;
  label: string;
  uri: string;
  sha256: string;
  adapter: SourceAdapterRef;
}

export interface SourceBinding {
  sourceRevisionId: RigId;
  locator: string;
}

export interface RigElement {
  id: RigId;
  name: string;
  pose: RigidPose;
  source?: SourceBinding;
}

export type FrameProvenanceKind = 'owner-authored' | 'source-proposal' | 'legacy-seed' | 'synthetic';

export interface FrameProvenance {
  kind: FrameProvenanceKind;
}

export interface RigFrame {
  id: RigId;
  name: string;
  ownerElementId: RigId | null;
  pose: RigidPose;
  role?: string;
  source?: SourceBinding;
  provenance: FrameProvenance;
}

export interface OriginCoincidentRelation {
  id: RigId;
  type: 'origin-coincident';
  frameA: RigId;
  frameB: RigId;
  toleranceM: number;
}

export type RigRelation = OriginCoincidentRelation;

export interface RigDocument {
  schemaVersion: 1;
  documentId: RigId;
  revision: number;
  units: 'm-rad';
  coordinateSystem: {
    handedness: 'right';
    upAxis: 'Y';
  };
  sources: SourceRevision[];
  elements: RigElement[];
  frames: RigFrame[];
  relations: RigRelation[];
}

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  references: RigId[];
  metrics?: Record<string, number>;
}
