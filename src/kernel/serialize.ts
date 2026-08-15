import type { RigDocument, RigElement, RigFrame, RigRelation, SourceRevision } from './types.js';
import { validateRigDocument } from './validate.js';

function canonicalizeSource(source: SourceRevision): SourceRevision {
  return {
    id: source.id,
    label: source.label,
    uri: source.uri,
    sha256: source.sha256,
    adapter: { id: source.adapter.id, version: source.adapter.version },
  };
}

function canonicalizeElement(element: RigElement): RigElement {
  return {
    id: element.id,
    name: element.name,
    pose: {
      position: { x: element.pose.position.x, y: element.pose.position.y, z: element.pose.position.z },
      rotation: { x: element.pose.rotation.x, y: element.pose.rotation.y, z: element.pose.rotation.z, w: element.pose.rotation.w },
    },
    ...(element.source ? { source: { sourceRevisionId: element.source.sourceRevisionId, locator: element.source.locator } } : {}),
  };
}

function canonicalizeFrame(frame: RigFrame): RigFrame {
  return {
    id: frame.id,
    name: frame.name,
    ownerElementId: frame.ownerElementId,
    pose: {
      position: { x: frame.pose.position.x, y: frame.pose.position.y, z: frame.pose.position.z },
      rotation: { x: frame.pose.rotation.x, y: frame.pose.rotation.y, z: frame.pose.rotation.z, w: frame.pose.rotation.w },
    },
    ...(frame.role !== undefined ? { role: frame.role } : {}),
    ...(frame.source ? { source: { sourceRevisionId: frame.source.sourceRevisionId, locator: frame.source.locator } } : {}),
    provenance: { kind: frame.provenance.kind },
  };
}

function canonicalizeRelation(relation: RigRelation): RigRelation {
  const base = { id: relation.id, type: relation.type, frameA: relation.frameA, frameB: relation.frameB };
  switch (relation.type) {
    case 'origin-coincident': return { ...base, type: 'origin-coincident', toleranceM: relation.toleranceM };
    case 'revolute': return { ...base, type: 'revolute', ...(relation.limits ? { limits: { lowerRad: relation.limits.lowerRad, upperRad: relation.limits.upperRad } } : {}) };
    case 'prismatic': return { ...base, type: 'prismatic', ...(relation.limits ? { limits: { lowerM: relation.limits.lowerM, upperM: relation.limits.upperM } } : {}) };
    case 'spherical': return { ...base, type: 'spherical' };
    case 'distance': return { ...base, type: 'distance', lengthM: relation.lengthM };
    case 'distance-range': return { ...base, type: 'distance-range', minLengthM: relation.minLengthM, maxLengthM: relation.maxLengthM };
  }
}

export function canonicalizeRigDocument(doc: RigDocument): RigDocument {
  return {
    schemaVersion: 1,
    documentId: doc.documentId,
    revision: doc.revision,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [...doc.sources].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalizeSource),
    elements: [...doc.elements].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalizeElement),
    frames: [...doc.frames].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalizeFrame),
    relations: [...doc.relations].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalizeRelation),
  };
}

export function serializeRigDocument(doc: RigDocument): string {
  const diagnostics = validateRigDocument(doc);
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Cannot serialize invalid RigDocument: ${errors.map((error) => error.code).join(', ')}`);
  return `${JSON.stringify(canonicalizeRigDocument(doc), null, 2)}\n`;
}

export function parseRigDocument(text: string): RigDocument {
  const value = JSON.parse(text) as RigDocument;
  const diagnostics = validateRigDocument(value);
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Invalid RigDocument: ${errors.map((error) => error.code).join(', ')}`);
  return canonicalizeRigDocument(value);
}
