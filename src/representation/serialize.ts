import type { RigRepresentationBinding, RigRepresentationDocument } from './types.js';
import { validateRigRepresentationDocument } from './validate.js';

function canonicalizeBinding(binding: RigRepresentationBinding): RigRepresentationBinding {
  const target = {
    sourceInstanceId: binding.target.sourceInstanceId,
    sourceRevisionId: binding.target.sourceRevisionId,
    targetLocator: binding.target.targetLocator,
  };
  if (binding.type === 'rigid') return { id: binding.id, type: 'rigid', target, sourceDatumLocator: binding.sourceDatumLocator, rigDatum: { kind: binding.rigDatum.kind, id: binding.rigDatum.id } };
  if (binding.type === 'aim') return {
    id: binding.id,
    type: 'aim',
    target,
    sourceAnchorLocator: binding.sourceAnchorLocator,
    sourceAimLocator: binding.sourceAimLocator,
    rigAnchorFrameId: binding.rigAnchorFrameId,
    rigAimFrameId: binding.rigAimFrameId,
    ...(binding.roll ? { roll: { sourceLocator: binding.roll.sourceLocator, rigFrameId: binding.roll.rigFrameId } } : {}),
  };
  return {
    id: binding.id,
    type: 'span',
    target,
    sourceStartLocator: binding.sourceStartLocator,
    sourceEndLocator: binding.sourceEndLocator,
    rigStartFrameId: binding.rigStartFrameId,
    rigEndFrameId: binding.rigEndFrameId,
    ...(binding.roll ? { roll: { sourceLocator: binding.roll.sourceLocator, rigFrameId: binding.roll.rigFrameId } } : {}),
  };
}

export function canonicalizeRigRepresentationDocument(document: RigRepresentationDocument): RigRepresentationDocument {
  return {
    schemaVersion: 1,
    documentId: document.documentId,
    revision: document.revision,
    rigDocumentId: document.rigDocumentId,
    bindings: [...document.bindings].sort((a, b) => a.id.localeCompare(b.id)).map(canonicalizeBinding),
  };
}

export function serializeRigRepresentationDocument(document: RigRepresentationDocument): string {
  const errors = validateRigRepresentationDocument(document).filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Cannot serialize invalid RigRepresentationDocument: ${errors.map((error) => error.code).join(', ')}`);
  return `${JSON.stringify(canonicalizeRigRepresentationDocument(document), null, 2)}\n`;
}
