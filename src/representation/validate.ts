import type { Diagnostic } from '../kernel/types.js';
import type { RigRepresentationDocument } from './types.js';

function nonEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateRigRepresentationDocument(document: RigRepresentationDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (document.schemaVersion !== 1) diagnostics.push({ code: 'representation.schema.unsupported', severity: 'error', message: `Unsupported representation schemaVersion ${document.schemaVersion}.`, references: [] });
  if (!nonEmpty(document.documentId) || !nonEmpty(document.rigDocumentId)) diagnostics.push({ code: 'representation.identity.invalid', severity: 'error', message: 'Representation document and rig document IDs must be non-empty.', references: [] });
  if (!Number.isInteger(document.revision) || document.revision < 0) diagnostics.push({ code: 'representation.revision.invalid', severity: 'error', message: 'Representation revision must be a non-negative integer.', references: [document.documentId] });

  const ids = new Set<string>();
  const locator = (value: string, bindingId: string, field: string) => {
    if (!nonEmpty(value)) diagnostics.push({ code: 'representation.locator.invalid', severity: 'error', message: `Representation binding ${bindingId} has an empty ${field}.`, references: [bindingId] });
  };

  for (const binding of document.bindings) {
    if (!nonEmpty(binding.id) || ids.has(binding.id)) diagnostics.push({ code: 'representation.binding.identity.invalid', severity: 'error', message: `Representation binding ID ${binding.id || '<empty>'} is empty or duplicated.`, references: binding.id ? [binding.id] : [] });
    ids.add(binding.id);
    if (!nonEmpty(binding.target.sourceInstanceId) || !nonEmpty(binding.target.sourceRevisionId)) diagnostics.push({ code: 'representation.source.identity.invalid', severity: 'error', message: `Representation binding ${binding.id} has incomplete exact source identity.`, references: [binding.id] });
    locator(binding.target.targetLocator, binding.id, 'target locator');

    if (binding.type === 'rigid') {
      locator(binding.sourceDatumLocator, binding.id, 'source datum locator');
      if (!nonEmpty(binding.rigDatum.id)) diagnostics.push({ code: 'representation.rig-datum.invalid', severity: 'error', message: `Rigid representation ${binding.id} has an empty rig datum.`, references: [binding.id] });
    } else if (binding.type === 'aim') {
      locator(binding.sourceAnchorLocator, binding.id, 'source anchor locator');
      locator(binding.sourceAimLocator, binding.id, 'source aim locator');
      if (!nonEmpty(binding.rigAnchorFrameId) || !nonEmpty(binding.rigAimFrameId)) diagnostics.push({ code: 'representation.rig-span.invalid', severity: 'error', message: `Aim representation ${binding.id} has incomplete rig frame correspondence.`, references: [binding.id] });
      if (binding.roll && (!nonEmpty(binding.roll.sourceLocator) || !nonEmpty(binding.roll.rigFrameId))) diagnostics.push({ code: 'representation.roll.invalid', severity: 'error', message: `Aim representation ${binding.id} has incomplete roll correspondence.`, references: [binding.id] });
    } else if (binding.type === 'span') {
      locator(binding.sourceStartLocator, binding.id, 'source start locator');
      locator(binding.sourceEndLocator, binding.id, 'source end locator');
      if (!nonEmpty(binding.rigStartFrameId) || !nonEmpty(binding.rigEndFrameId)) diagnostics.push({ code: 'representation.rig-span.invalid', severity: 'error', message: `Span representation ${binding.id} has incomplete rig frame correspondence.`, references: [binding.id] });
      if (binding.roll && (!nonEmpty(binding.roll.sourceLocator) || !nonEmpty(binding.roll.rigFrameId))) diagnostics.push({ code: 'representation.roll.invalid', severity: 'error', message: `Span representation ${binding.id} has incomplete roll correspondence.`, references: [binding.id] });
    } else {
      const unknown = binding as unknown as { id?: unknown; type?: unknown };
      const id = typeof unknown.id === 'string' ? unknown.id : '<unknown>';
      diagnostics.push({ code: 'representation.binding.type.unsupported', severity: 'error', message: `Representation binding ${id} has unsupported type ${String(unknown.type)}.`, references: id === '<unknown>' ? [] : [id] });
    }
  }
  return diagnostics;
}
