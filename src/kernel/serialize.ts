import type { RigDocument } from './types.js';
import { validateRigDocument } from './validate.js';

export function canonicalizeRigDocument(doc: RigDocument): RigDocument {
  return {
    schemaVersion: 1,
    documentId: doc.documentId,
    revision: doc.revision,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sources: [...doc.sources].sort((a, b) => a.id.localeCompare(b.id)),
    elements: [...doc.elements].sort((a, b) => a.id.localeCompare(b.id)),
    frames: [...doc.frames].sort((a, b) => a.id.localeCompare(b.id)),
    relations: [...doc.relations].sort((a, b) => a.id.localeCompare(b.id)),
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
