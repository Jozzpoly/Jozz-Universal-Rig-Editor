import type { RigDocument, RigidPose, SourceRevision } from '../kernel/types.js';

export interface SourceInstance {
  id: string;
  name: string;
  sourceRevisionId: string;
  pose: RigidPose;
}

export interface ConsumerReferenceSnapshot {
  id: string;
  label: string;
  consumer: {
    id: string;
    revision: string;
  };
  payloadLocator: string;
  payloadSha256: string;
}

export interface AuthoredRigProjectDocument {
  kind: 'rig';
  document: RigDocument;
}

export type AuthoredProjectDocument = AuthoredRigProjectDocument;

export interface JureProjectModel {
  schemaVersion: 1;
  projectId: string;
  units: 'm-rad';
  coordinateSystem: {
    handedness: 'right';
    upAxis: 'Y';
  };
  sourceRevisions: SourceRevision[];
  sourceInstances: SourceInstance[];
  consumerReferences: ConsumerReferenceSnapshot[];
  authoredDocuments: AuthoredProjectDocument[];
}
