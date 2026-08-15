export interface ExactSourceRepresentationTarget {
  sourceInstanceId: string;
  sourceRevisionId: string;
  targetLocator: string;
}

export type RigDatumRef =
  | { kind: 'element'; id: string }
  | { kind: 'frame'; id: string };

export interface RepresentationRollCorrespondence {
  sourceLocator: string;
  rigFrameId: string;
}

interface RepresentationBindingBase {
  id: string;
  target: ExactSourceRepresentationTarget;
}

export interface RigidRepresentationBinding extends RepresentationBindingBase {
  type: 'rigid';
  sourceDatumLocator: string;
  rigDatum: RigDatumRef;
}

export interface AimRepresentationBinding extends RepresentationBindingBase {
  type: 'aim';
  sourceAnchorLocator: string;
  sourceAimLocator: string;
  rigAnchorFrameId: string;
  rigAimFrameId: string;
  roll?: RepresentationRollCorrespondence;
}

export interface SpanRepresentationBinding extends RepresentationBindingBase {
  type: 'span';
  sourceStartLocator: string;
  sourceEndLocator: string;
  rigStartFrameId: string;
  rigEndFrameId: string;
  roll?: RepresentationRollCorrespondence;
}

export type RigRepresentationBinding =
  | RigidRepresentationBinding
  | AimRepresentationBinding
  | SpanRepresentationBinding;

export interface RigRepresentationDocument {
  schemaVersion: 1;
  documentId: string;
  revision: number;
  rigDocumentId: string;
  bindings: RigRepresentationBinding[];
}
