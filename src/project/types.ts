import type { RigDocument, RigidPose, SourceRevision } from '../kernel/types.js';
import type { RigRepresentationDocument } from '../representation/types.js';

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

export interface SourceAdoptionSourceSnapshot {
  sourceInstanceId: string;
  sourceRevisionId: string;
  sourceInstancePose: RigidPose;
  locator: string;
}

export interface SourceAdoptionRecord {
  id: string;
  source: SourceAdoptionSourceSnapshot;
  target: {
    documentId: string;
    kind: 'element' | 'frame';
    id: string;
  };
}

export interface AuthoredRigProjectDocument {
  kind: 'rig';
  document: RigDocument;
}

export interface AuthoredRigRepresentationProjectDocument {
  kind: 'rig-representation';
  document: RigRepresentationDocument;
}

export type AuthoredProjectDocument = AuthoredRigProjectDocument | AuthoredRigRepresentationProjectDocument;

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
  sourceAdoptions: SourceAdoptionRecord[];
  authoredDocuments: AuthoredProjectDocument[];
}
