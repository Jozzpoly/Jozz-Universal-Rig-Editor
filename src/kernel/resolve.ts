import { composePose, distance, IDENTITY_POSE } from './math.js';
import type { Diagnostic, RigidPose, RigDocument, RigId } from './types.js';

export interface ResolvedRigView {
  documentId: RigId;
  revision: number;
  elementWorldPoses: ReadonlyMap<RigId, RigidPose>;
  frameWorldPoses: ReadonlyMap<RigId, RigidPose>;
  diagnostics: readonly Diagnostic[];
}

export function resolveRigDocument(doc: RigDocument): ResolvedRigView {
  const elementWorldPoses = new Map(doc.elements.map((element) => [element.id, element.pose]));
  const frameWorldPoses = new Map<RigId, RigidPose>();
  for (const frame of doc.frames) {
    const parent = frame.ownerElementId ? elementWorldPoses.get(frame.ownerElementId) : IDENTITY_POSE;
    if (!parent) continue;
    frameWorldPoses.set(frame.id, composePose(parent, frame.pose));
  }
  const diagnostics: Diagnostic[] = [];
  for (const relation of doc.relations) {
    if (relation.type !== 'origin-coincident') continue;
    const a = frameWorldPoses.get(relation.frameA);
    const b = frameWorldPoses.get(relation.frameB);
    if (!a || !b) continue;
    const residualM = distance(a.position, b.position);
    diagnostics.push({
      code: residualM <= relation.toleranceM ? 'relation.origin-coincident.ok' : 'relation.origin-coincident.residual',
      severity: residualM <= relation.toleranceM ? 'info' : 'warning',
      message: `${relation.id}: ${(residualM * 1000).toFixed(2)} mm origin residual.`,
      references: [relation.id, relation.frameA, relation.frameB],
      metrics: { residualM, toleranceM: relation.toleranceM },
    });
  }
  return { documentId: doc.documentId, revision: doc.revision, elementWorldPoses, frameWorldPoses, diagnostics };
}
