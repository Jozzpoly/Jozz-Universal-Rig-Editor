import { composePose, distance, IDENTITY_POSE } from './math.js';
import { measureRevoluteFrameResidual } from './relation-frame.js';
import type { Diagnostic, RigidPose, RigDocument, RigId } from './types.js';

const REVOLUTE_ORIGIN_DIAGNOSTIC_TOLERANCE_M = 1e-6;
const REVOLUTE_AXIS_DIAGNOSTIC_TOLERANCE_RAD = 1e-6;

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
    const a = frameWorldPoses.get(relation.frameA);
    const b = frameWorldPoses.get(relation.frameB);
    if (!a || !b) continue;

    if (relation.type === 'origin-coincident') {
      const residualM = distance(a.position, b.position);
      diagnostics.push({
        code: residualM <= relation.toleranceM ? 'relation.origin-coincident.ok' : 'relation.origin-coincident.residual',
        severity: residualM <= relation.toleranceM ? 'info' : 'warning',
        message: `${relation.id}: ${(residualM * 1000).toFixed(2)} mm origin residual.`,
        references: [relation.id, relation.frameA, relation.frameB],
        metrics: { residualM, toleranceM: relation.toleranceM },
      });
      continue;
    }

    if (relation.type === 'revolute') {
      const residual = measureRevoluteFrameResidual(a, b);
      const withinDiagnosticTolerance = residual.originResidualM <= REVOLUTE_ORIGIN_DIAGNOSTIC_TOLERANCE_M
        && residual.axisAngleRad <= REVOLUTE_AXIS_DIAGNOSTIC_TOLERANCE_RAD;
      diagnostics.push({
        code: withinDiagnosticTolerance ? 'relation.revolute.ok' : 'relation.revolute.residual',
        severity: withinDiagnosticTolerance ? 'info' : 'warning',
        message: `${relation.id}: ${(residual.originResidualM * 1000).toFixed(3)} mm origin residual; ${(residual.axisAngleRad * 180 / Math.PI).toFixed(4)}° signed-axis angle.`,
        references: [relation.id, relation.frameA, relation.frameB],
        metrics: {
          originResidualM: residual.originResidualM,
          axisAngleRad: residual.axisAngleRad,
          axisDot: residual.axisDot,
          originDiagnosticToleranceM: REVOLUTE_ORIGIN_DIAGNOSTIC_TOLERANCE_M,
          axisDiagnosticToleranceRad: REVOLUTE_AXIS_DIAGNOSTIC_TOLERANCE_RAD,
        },
      });
    }
  }
  return { documentId: doc.documentId, revision: doc.revision, elementWorldPoses, frameWorldPoses, diagnostics };
}
