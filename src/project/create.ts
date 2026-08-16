import { canonicalizeRigDocument } from '../kernel/serialize.js';
import type { RigDocument } from '../kernel/types.js';
import { validateRigDocument } from '../kernel/validate.js';
import type { JureProjectModel } from './types.js';

export function createJureRigProject(projectId: string, rigDocument: RigDocument): JureProjectModel {
  if (typeof projectId !== 'string' || projectId.trim().length === 0) throw new Error('JURE project ID must be non-empty.');
  const errors = validateRigDocument(rigDocument).filter((diagnostic) => diagnostic.severity === 'error');
  if (errors.length > 0) throw new Error(`Cannot create JURE project from invalid RigDocument: ${errors.map((diagnostic) => diagnostic.code).join(', ')}`);
  const rig = canonicalizeRigDocument(rigDocument);
  return {
    schemaVersion: 1,
    projectId,
    units: 'm-rad',
    coordinateSystem: { handedness: 'right', upAxis: 'Y' },
    sourceRevisions: rig.sources.map((source) => ({ ...source, adapter: { ...source.adapter } })),
    sourceInstances: [],
    consumerReferences: [],
    sourceAdoptions: [],
    authoredDocuments: [{ kind: 'rig', document: rig }],
  };
}
