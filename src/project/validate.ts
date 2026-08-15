import type { Diagnostic, Quat, RigidPose, SourceRevision } from '../kernel/types.js';
import { validateRigDocument } from '../kernel/validate.js';
import type { JureProjectModel } from './types.js';

function poseFinite(pose: RigidPose): boolean {
  const values = [pose.position.x, pose.position.y, pose.position.z, pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w];
  return values.every(Number.isFinite);
}

function quatNormalized(q: Quat): boolean {
  return Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1) <= 1e-6;
}

function sourceRevisionValid(source: SourceRevision): boolean {
  return /^[a-f0-9]{64}$/i.test(source.sha256)
    && typeof source.adapter?.id === 'string'
    && source.adapter.id.trim().length > 0
    && Number.isInteger(source.adapter.version)
    && source.adapter.version > 0;
}

function sameExactSourceRevision(a: SourceRevision, b: SourceRevision): boolean {
  return a.id === b.id
    && a.sha256.toLowerCase() === b.sha256.toLowerCase()
    && a.adapter.id === b.adapter.id
    && a.adapter.version === b.adapter.version;
}

export function validateJureProjectModel(project: JureProjectModel): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (project.schemaVersion !== 1) diagnostics.push({ code: 'project.schema.unsupported', severity: 'error', message: `Unsupported project schemaVersion ${project.schemaVersion}.`, references: [] });
  if (project.units !== 'm-rad') diagnostics.push({ code: 'project.units.unsupported', severity: 'error', message: 'Project must use m-rad units.', references: [] });
  if (project.coordinateSystem.handedness !== 'right' || project.coordinateSystem.upAxis !== 'Y') diagnostics.push({ code: 'project.coordinates.unsupported', severity: 'error', message: 'Project requires right-handed Y-up coordinates.', references: [] });
  if (typeof project.projectId !== 'string' || project.projectId.trim().length === 0) diagnostics.push({ code: 'project.identity.invalid', severity: 'error', message: 'Project ID must be non-empty.', references: [] });

  const topLevelIds = new Map<string, string>();
  const register = (id: string, kind: string) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      diagnostics.push({ code: 'project.identity.invalid', severity: 'error', message: `${kind} has an empty ID.`, references: [] });
      return;
    }
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

  for (const instance of project.sourceInstances) {
    register(instance.id, 'source instance');
    if (!sourceById.has(instance.sourceRevisionId)) diagnostics.push({ code: 'project.source-instance.revision.missing', severity: 'error', message: `Source instance ${instance.id} references missing revision ${instance.sourceRevisionId}.`, references: [instance.id, instance.sourceRevisionId] });
    if (!poseFinite(instance.pose) || !quatNormalized(instance.pose.rotation)) diagnostics.push({ code: 'project.source-instance.pose.invalid', severity: 'error', message: `Source instance ${instance.id} has an invalid rigid pose.`, references: [instance.id] });
  }

  for (const reference of project.consumerReferences) {
    register(reference.id, 'consumer reference');
    if (reference.consumer.id.trim().length === 0 || reference.consumer.revision.trim().length === 0) diagnostics.push({ code: 'project.reference.consumer.invalid', severity: 'error', message: `Consumer reference ${reference.id} has incomplete consumer identity.`, references: [reference.id] });
    if (reference.payloadLocator.trim().length === 0 || !/^[a-f0-9]{64}$/i.test(reference.payloadSha256)) diagnostics.push({ code: 'project.reference.payload.invalid', severity: 'error', message: `Consumer reference ${reference.id} has invalid payload identity.`, references: [reference.id] });
  }

  for (const authored of project.authoredDocuments) {
    register(authored.document.documentId, 'authored rig document');
    const rigDiagnostics = validateRigDocument(authored.document);
    diagnostics.push(...rigDiagnostics.map((diagnostic) => ({ ...diagnostic, code: `project.authored.${diagnostic.code}` })));
    for (const source of authored.document.sources) {
      const projectSource = sourceById.get(source.id);
      if (!projectSource) {
        diagnostics.push({ code: 'project.authored.source.missing', severity: 'error', message: `Authored rig ${authored.document.documentId} references source revision ${source.id} that is absent from the project.`, references: [authored.document.documentId, source.id] });
      } else if (!sameExactSourceRevision(source, projectSource)) {
        diagnostics.push({ code: 'project.authored.source.mismatch', severity: 'error', message: `Authored rig ${authored.document.documentId} disagrees with project exact source revision ${source.id}.`, references: [authored.document.documentId, source.id] });
      }
    }
  }

  return diagnostics;
}
