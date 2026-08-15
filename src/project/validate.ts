import type { Diagnostic, Quat, RigDocument, RigidPose, SourceRevision } from '../kernel/types.js';
import { validateRigDocument } from '../kernel/validate.js';
import type { RigRepresentationBinding, RigRepresentationDocument } from '../representation/types.js';
import { validateRigRepresentationDocument } from '../representation/validate.js';
import type { JureProjectModel, SourceInstance } from './types.js';

function poseFinite(pose: RigidPose): boolean {
  const values = [pose.position.x, pose.position.y, pose.position.z, pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w];
  return values.every(Number.isFinite);
}
function quatNormalized(q: Quat): boolean { return Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1) <= 1e-6; }
function sourceRevisionValid(source: SourceRevision): boolean {
  return /^[a-f0-9]{64}$/i.test(source.sha256) && typeof source.adapter?.id === 'string' && source.adapter.id.trim().length > 0 && Number.isInteger(source.adapter.version) && source.adapter.version > 0;
}
function sameExactSourceRevision(a: SourceRevision, b: SourceRevision): boolean {
  return a.id === b.id && a.sha256.toLowerCase() === b.sha256.toLowerCase() && a.adapter.id === b.adapter.id && a.adapter.version === b.adapter.version;
}
function rigHasFrame(rig: RigDocument, id: string): boolean { return rig.frames.some((frame) => frame.id === id); }
function rigHasDatum(rig: RigDocument, datum: { kind: 'element' | 'frame'; id: string }): boolean {
  return datum.kind === 'element' ? rig.elements.some((element) => element.id === datum.id) : rigHasFrame(rig, datum.id);
}

function validateRepresentationProjectReferences(
  document: RigRepresentationDocument,
  rigById: ReadonlyMap<string, RigDocument>,
  instanceById: ReadonlyMap<string, SourceInstance>,
  sourceById: ReadonlyMap<string, SourceRevision>,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const rig = rigById.get(document.rigDocumentId);
  if (!rig) {
    diagnostics.push({ code: 'project.representation.rig.missing', severity: 'error', message: `Representation ${document.documentId} references missing rig ${document.rigDocumentId}.`, references: [document.documentId, document.rigDocumentId] });
    return diagnostics;
  }

  const validateTarget = (binding: RigRepresentationBinding) => {
    const target = binding.target;
    const instance = instanceById.get(target.sourceInstanceId);
    if (!instance) diagnostics.push({ code: 'project.representation.source-instance.missing', severity: 'error', message: `Representation binding ${binding.id} references missing source instance ${target.sourceInstanceId}.`, references: [document.documentId, binding.id, target.sourceInstanceId] });
    if (!sourceById.has(target.sourceRevisionId)) diagnostics.push({ code: 'project.representation.source-revision.missing', severity: 'error', message: `Representation binding ${binding.id} references missing source revision ${target.sourceRevisionId}.`, references: [document.documentId, binding.id, target.sourceRevisionId] });
    if (instance && instance.sourceRevisionId !== target.sourceRevisionId) diagnostics.push({ code: 'project.representation.source-revision.mismatch', severity: 'error', message: `Representation binding ${binding.id} exact revision does not match source instance ${instance.id}. Rebind explicitly.`, references: [document.documentId, binding.id, instance.id, target.sourceRevisionId] });
  };

  for (const binding of document.bindings) {
    validateTarget(binding);
    if (binding.type === 'rigid') {
      if (!rigHasDatum(rig, binding.rigDatum)) diagnostics.push({ code: 'project.representation.rig-datum.missing', severity: 'error', message: `Rigid representation ${binding.id} references missing authored ${binding.rigDatum.kind} ${binding.rigDatum.id}.`, references: [document.documentId, binding.id, binding.rigDatum.id] });
    } else if (binding.type === 'aim') {
      for (const frameId of [binding.rigAnchorFrameId, binding.rigAimFrameId, binding.roll?.rigFrameId].filter((id): id is string => Boolean(id))) {
        if (!rigHasFrame(rig, frameId)) diagnostics.push({ code: 'project.representation.rig-frame.missing', severity: 'error', message: `Aim representation ${binding.id} references missing authored frame ${frameId}.`, references: [document.documentId, binding.id, frameId] });
      }
    } else if (binding.type === 'span') {
      for (const frameId of [binding.rigStartFrameId, binding.rigEndFrameId, binding.roll?.rigFrameId].filter((id): id is string => Boolean(id))) {
        if (!rigHasFrame(rig, frameId)) diagnostics.push({ code: 'project.representation.rig-frame.missing', severity: 'error', message: `Span representation ${binding.id} references missing authored frame ${frameId}.`, references: [document.documentId, binding.id, frameId] });
      }
    }
  }
  return diagnostics;
}

export function validateJureProjectModel(project: JureProjectModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (project.schemaVersion !== 1) diagnostics.push({ code: 'project.schema.unsupported', severity: 'error', message: `Unsupported project schemaVersion ${project.schemaVersion}.`, references: [] });
  if (project.units !== 'm-rad') diagnostics.push({ code: 'project.units.unsupported', severity: 'error', message: 'Project must use m-rad units.', references: [] });
  if (project.coordinateSystem.handedness !== 'right' || project.coordinateSystem.upAxis !== 'Y') diagnostics.push({ code: 'project.coordinates.unsupported', severity: 'error', message: 'Project requires right-handed Y-up coordinates.', references: [] });
  if (typeof project.projectId !== 'string' || project.projectId.trim().length === 0) diagnostics.push({ code: 'project.identity.invalid', severity: 'error', message: 'Project ID must be non-empty.', references: [] });

  const topLevelIds = new Map<string, string>();
  const register = (id: string, kind: string) => {
    if (typeof id !== 'string' || id.trim().length === 0) { diagnostics.push({ code: 'project.identity.invalid', severity: 'error', message: `${kind} has an empty ID.`, references: [] }); return; }
    const previous = topLevelIds.get(id);
    if (previous) diagnostics.push({ code: 'project.identity.duplicate', severity: 'error', message: `Project ID ${id} is used by both ${previous} and ${kind}.`, references: [id] });
    else topLevelIds.set(id, kind);
  };

  const sourceById = new Map<string, SourceRevision>();
  for (const source of project.sourceRevisions) {
    register(source.id, 'source revision');
    if (!sourceRevisionValid(source)) diagnostics.push({ code: 'project.source.invalid', severity: 'error', message: `Source revision ${source.id} has invalid exact identity.`, references: [source.id] });
    sourceById.set(source.id, source);
  }

  const instanceById = new Map<string, SourceInstance>();
  for (const instance of project.sourceInstances) {
    register(instance.id, 'source instance');
    instanceById.set(instance.id, instance);
    if (!sourceById.has(instance.sourceRevisionId)) diagnostics.push({ code: 'project.source-instance.revision.missing', severity: 'error', message: `Source instance ${instance.id} references missing revision ${instance.sourceRevisionId}.`, references: [instance.id, instance.sourceRevisionId] });
    if (!poseFinite(instance.pose) || !quatNormalized(instance.pose.rotation)) diagnostics.push({ code: 'project.source-instance.pose.invalid', severity: 'error', message: `Source instance ${instance.id} has an invalid rigid pose.`, references: [instance.id] });
  }

  for (const reference of project.consumerReferences) {
    register(reference.id, 'consumer reference');
    if (reference.consumer.id.trim().length === 0 || reference.consumer.revision.trim().length === 0) diagnostics.push({ code: 'project.reference.consumer.invalid', severity: 'error', message: `Consumer reference ${reference.id} has incomplete consumer identity.`, references: [reference.id] });
    if (reference.payloadLocator.trim().length === 0 || !/^[a-f0-9]{64}$/i.test(reference.payloadSha256)) diagnostics.push({ code: 'project.reference.payload.invalid', severity: 'error', message: `Consumer reference ${reference.id} has invalid payload identity.`, references: [reference.id] });
  }

  const rigById = new Map<string, RigDocument>();
  const representationDocuments: RigRepresentationDocument[] = [];
  for (const authored of project.authoredDocuments) {
    register(authored.document.documentId, authored.kind === 'rig' ? 'authored rig document' : 'authored rig representation document');
    if (authored.kind === 'rig') {
      rigById.set(authored.document.documentId, authored.document);
      const rigDiagnostics = validateRigDocument(authored.document);
      diagnostics.push(...rigDiagnostics.map((diagnostic) => ({ ...diagnostic, code: `project.authored.${diagnostic.code}` })));
      for (const source of authored.document.sources) {
        const projectSource = sourceById.get(source.id);
        if (!projectSource) diagnostics.push({ code: 'project.authored.source.missing', severity: 'error', message: `Authored rig ${authored.document.documentId} references source revision ${source.id} that is absent from the project.`, references: [authored.document.documentId, source.id] });
        else if (!sameExactSourceRevision(source, projectSource)) diagnostics.push({ code: 'project.authored.source.mismatch', severity: 'error', message: `Authored rig ${authored.document.documentId} disagrees with project exact source revision ${source.id}.`, references: [authored.document.documentId, source.id] });
      }
    } else if (authored.kind === 'rig-representation') {
      representationDocuments.push(authored.document);
      const representationDiagnostics = validateRigRepresentationDocument(authored.document);
      diagnostics.push(...representationDiagnostics.map((diagnostic) => ({ ...diagnostic, code: `project.authored.${diagnostic.code}` })));
    } else {
      diagnostics.push({ code: 'project.authored.kind.unsupported', severity: 'error', message: `Unsupported authored document kind ${(authored as { kind?: unknown }).kind}.`, references: [] });
    }
  }

  for (const adoption of project.sourceAdoptions) {
    register(adoption.id, 'source adoption');
    const instance = instanceById.get(adoption.sourceInstanceId);
    if (!instance) { diagnostics.push({ code: 'project.adoption.instance.missing', severity: 'error', message: `Source adoption ${adoption.id} references missing instance ${adoption.sourceInstanceId}.`, references: [adoption.id, adoption.sourceInstanceId] }); continue; }
    const rig = rigById.get(adoption.target.documentId);
    if (!rig) { diagnostics.push({ code: 'project.adoption.document.missing', severity: 'error', message: `Source adoption ${adoption.id} references missing rig document ${adoption.target.documentId}.`, references: [adoption.id, adoption.target.documentId] }); continue; }
    const target = adoption.target.kind === 'element' ? rig.elements.find((element) => element.id === adoption.target.id) : rig.frames.find((frame) => frame.id === adoption.target.id);
    if (!target) { diagnostics.push({ code: 'project.adoption.target.missing', severity: 'error', message: `Source adoption ${adoption.id} references missing ${adoption.target.kind} ${adoption.target.id}.`, references: [adoption.id, adoption.target.id] }); continue; }
    if (!target.source) { diagnostics.push({ code: 'project.adoption.provenance.missing', severity: 'error', message: `Source adoption ${adoption.id} targets ${adoption.target.id} without exact kernel source provenance.`, references: [adoption.id, adoption.target.id] }); continue; }
    if (target.source.sourceRevisionId !== instance.sourceRevisionId || target.source.locator !== adoption.locator) diagnostics.push({ code: 'project.adoption.provenance.mismatch', severity: 'error', message: `Source adoption ${adoption.id} disagrees with exact kernel provenance on ${adoption.target.id}.`, references: [adoption.id, adoption.target.id, adoption.sourceInstanceId] });
  }

  for (const representation of representationDocuments) diagnostics.push(...validateRepresentationProjectReferences(representation, rigById, instanceById, sourceById));
  return diagnostics;
}
