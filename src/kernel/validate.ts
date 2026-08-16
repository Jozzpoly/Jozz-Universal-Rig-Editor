import type { Diagnostic, Quat, RigDocument, RigidPose } from './types.js';

function poseFinite(pose: RigidPose): boolean {
  const values = [pose.position.x, pose.position.y, pose.position.z, pose.rotation.x, pose.rotation.y, pose.rotation.z, pose.rotation.w];
  return values.every(Number.isFinite);
}

function quatNormalized(q: Quat): boolean {
  return Math.abs(Math.hypot(q.x, q.y, q.z, q.w) - 1) <= 1e-6;
}

export function validateRigDocument(doc: RigDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (doc.schemaVersion !== 1) diagnostics.push({ code: 'schema.unsupported', severity: 'error', message: `Unsupported schemaVersion ${doc.schemaVersion}.`, references: [] });
  if (doc.units !== 'm-rad') diagnostics.push({ code: 'units.unsupported', severity: 'error', message: 'RigDocument must use m-rad units.', references: [] });
  if (doc.coordinateSystem.handedness !== 'right' || doc.coordinateSystem.upAxis !== 'Y') diagnostics.push({ code: 'coordinates.unsupported', severity: 'error', message: 'Foundation v1 requires right-handed Y-up authored coordinates.', references: [] });

  const allIds = new Map<string, string>();
  const register = (id: string, kind: string) => {
    const previous = allIds.get(id);
    if (previous) diagnostics.push({ code: 'identity.duplicate', severity: 'error', message: `ID ${id} is used by both ${previous} and ${kind}.`, references: [id] });
    else allIds.set(id, kind);
  };

  for (const source of doc.sources) {
    register(source.id, 'source');
    if (!/^[a-f0-9]{64}$/i.test(source.sha256)) diagnostics.push({ code: 'source.sha256.invalid', severity: 'error', message: `Source ${source.id} has an invalid SHA-256.`, references: [source.id] });
    if (!source.adapter || typeof source.adapter.id !== 'string' || source.adapter.id.trim().length === 0 || !Number.isInteger(source.adapter.version) || source.adapter.version <= 0) diagnostics.push({ code: 'source.adapter.invalid', severity: 'error', message: `Source ${source.id} has an invalid adapter identity.`, references: [source.id] });
  }
  const sourceIds = new Set(doc.sources.map((source) => source.id));
  const validateBinding = (binding: { sourceRevisionId: string; locator: string }, ownerId: string) => {
    if (!sourceIds.has(binding.sourceRevisionId)) diagnostics.push({ code: 'source.binding.missing', severity: 'error', message: `${ownerId} references missing source ${binding.sourceRevisionId}.`, references: [ownerId, binding.sourceRevisionId] });
    if (typeof binding.locator !== 'string' || binding.locator.trim().length === 0) diagnostics.push({ code: 'source.binding.locator.invalid', severity: 'error', message: `${ownerId} has an empty source locator.`, references: [ownerId, binding.sourceRevisionId] });
  };
  const elementIds = new Set<string>();
  for (const element of doc.elements) {
    register(element.id, 'element'); elementIds.add(element.id);
    if (!poseFinite(element.pose) || !quatNormalized(element.pose.rotation)) diagnostics.push({ code: 'element.pose.invalid', severity: 'error', message: `Element ${element.id} has an invalid rigid pose.`, references: [element.id] });
    if (element.source) validateBinding(element.source, element.id);
  }
  const frameIds = new Set<string>();
  for (const frame of doc.frames) {
    register(frame.id, 'frame'); frameIds.add(frame.id);
    if (frame.ownerElementId !== null && !elementIds.has(frame.ownerElementId)) diagnostics.push({ code: 'frame.owner.missing', severity: 'error', message: `Frame ${frame.id} references missing owner element ${frame.ownerElementId}.`, references: [frame.id, frame.ownerElementId] });
    if (!poseFinite(frame.pose) || !quatNormalized(frame.pose.rotation)) diagnostics.push({ code: 'frame.pose.invalid', severity: 'error', message: `Frame ${frame.id} has an invalid rigid pose.`, references: [frame.id] });
    if (frame.source) validateBinding(frame.source, frame.id);
  }
  for (const relation of doc.relations) {
    register(relation.id, 'relation');
    if (!frameIds.has(relation.frameA) || !frameIds.has(relation.frameB)) diagnostics.push({ code: 'relation.frame.missing', severity: 'error', message: `Relation ${relation.id} references a missing frame.`, references: [relation.id, relation.frameA, relation.frameB] });

    switch (relation.type) {
      case 'origin-coincident':
        if (!Number.isFinite(relation.toleranceM) || relation.toleranceM <= 0) diagnostics.push({ code: 'relation.tolerance.invalid', severity: 'error', message: `Relation ${relation.id} tolerance must be finite and positive.`, references: [relation.id] });
        break;
      case 'revolute':
        if (relation.limits && (!Number.isFinite(relation.limits.lowerRad) || !Number.isFinite(relation.limits.upperRad) || relation.limits.lowerRad > relation.limits.upperRad)) diagnostics.push({ code: 'relation.revolute.limits.invalid', severity: 'error', message: `Revolute relation ${relation.id} has invalid angular limits.`, references: [relation.id] });
        break;
      case 'prismatic':
        if (relation.limits && (!Number.isFinite(relation.limits.lowerM) || !Number.isFinite(relation.limits.upperM) || relation.limits.lowerM > relation.limits.upperM)) diagnostics.push({ code: 'relation.prismatic.limits.invalid', severity: 'error', message: `Prismatic relation ${relation.id} has invalid translation limits.`, references: [relation.id] });
        break;
      case 'spherical':
        break;
      case 'distance':
        if (!Number.isFinite(relation.lengthM) || relation.lengthM < 0) diagnostics.push({ code: 'relation.distance.length.invalid', severity: 'error', message: `Distance relation ${relation.id} must have a finite non-negative length.`, references: [relation.id] });
        break;
      case 'distance-range':
        if (!Number.isFinite(relation.minLengthM) || !Number.isFinite(relation.maxLengthM) || relation.minLengthM < 0 || relation.minLengthM > relation.maxLengthM) diagnostics.push({ code: 'relation.distance-range.limits.invalid', severity: 'error', message: `Distance-range relation ${relation.id} has invalid length limits.`, references: [relation.id] });
        break;
      default: {
        const unknown = relation as unknown as { id?: unknown; type?: unknown };
        const id = typeof unknown.id === 'string' ? unknown.id : '<unknown>';
        diagnostics.push({ code: 'relation.type.unsupported', severity: 'error', message: `Relation ${id} has unsupported type ${String(unknown.type)}.`, references: id === '<unknown>' ? [] : [id] });
        break;
      }
    }
  }
  return diagnostics;
}
