import type { SourceAdapterRef, SourceRevision } from '../../kernel/types.js';
import { addSourceInstance } from '../../project/commands.js';
import { addSourceRevisionWithInstance, findExactSourceRevision } from '../../project/source-revision.js';
import type { JureProjectCommand } from '../../project/session.js';
import type { JureProjectModel, SourceInstance } from '../../project/types.js';

export interface OpenedSourceIdentity {
  name: string;
  sha256: string;
  adapter: SourceAdapterRef;
}

export interface SourceOpenPlan {
  revision: SourceRevision;
  sourceInstance: SourceInstance;
  command: JureProjectCommand | null;
  kind: 'relink' | 'add-instance' | 'add-revision-and-instance';
}

function slug(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'source';
}

function topLevelProjectIdInUse(project: JureProjectModel, id: string): boolean {
  return project.sourceRevisions.some((source) => source.id === id)
    || project.sourceInstances.some((instance) => instance.id === id)
    || project.consumerReferences.some((reference) => reference.id === id)
    || project.sourceAdoptions.some((adoption) => adoption.id === id)
    || project.authoredDocuments.some((authored) => authored.document.documentId === id);
}

function sourceRevisionIdForAsset(source: OpenedSourceIdentity): string {
  return `source.${slug(source.adapter.id)}.v${source.adapter.version}.sha256.${source.sha256.toLowerCase()}`;
}

function allocateSourceInstanceId(project: JureProjectModel, sha256: string): string {
  const stem = `source-instance.${sha256.slice(0, 12).toLowerCase()}`;
  for (let index = 1; index < 10000; index += 1) {
    const id = `${stem}.${index}`;
    if (!topLevelProjectIdInUse(project, id)) return id;
  }
  throw new Error(`Could not allocate SourceInstance ID for ${sha256}.`);
}

function identityPose() {
  return { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0, w: 1 } };
}

export function planSourceOpen(
  project: JureProjectModel,
  activeSourceInstanceId: string | null,
  source: OpenedSourceIdentity,
): SourceOpenPlan {
  const exact = findExactSourceRevision(project, source.sha256, source.adapter);
  if (exact) {
    const existingInstances = project.sourceInstances.filter((instance) => instance.sourceRevisionId === exact.id);
    if (existingInstances.length > 0) {
      const sourceInstance = existingInstances.find((instance) => instance.id === activeSourceInstanceId) ?? existingInstances[0];
      return { revision: exact, sourceInstance, command: null, kind: 'relink' };
    }
    const sourceInstance: SourceInstance = {
      id: allocateSourceInstanceId(project, source.sha256),
      name: source.name,
      sourceRevisionId: exact.id,
      pose: identityPose(),
    };
    return { revision: exact, sourceInstance, command: addSourceInstance(sourceInstance), kind: 'add-instance' };
  }

  const revision: SourceRevision = {
    id: sourceRevisionIdForAsset(source),
    label: source.name,
    uri: source.name,
    sha256: source.sha256.toLowerCase(),
    adapter: { ...source.adapter },
  };
  const sourceInstance: SourceInstance = {
    id: allocateSourceInstanceId(project, source.sha256),
    name: source.name,
    sourceRevisionId: revision.id,
    pose: identityPose(),
  };
  return {
    revision,
    sourceInstance,
    command: addSourceRevisionWithInstance(revision, sourceInstance),
    kind: 'add-revision-and-instance',
  };
}

export function allocateFrameAdoptionIds(
  project: JureProjectModel,
  rigDocumentId: string,
  preferredName: string,
): { frameId: string; adoptionId: string } {
  const authored = project.authoredDocuments.find((entry) => entry.kind === 'rig' && entry.document.documentId === rigDocumentId);
  if (!authored || authored.kind !== 'rig') throw new Error(`RigDocument ${rigDocumentId} not found.`);
  const stem = `frame.${slug(preferredName || 'datum')}`;
  for (let index = 1; index < 10000; index += 1) {
    const frameId = index === 1 ? stem : `${stem}.${index}`;
    const rigIdUsed = authored.document.elements.some((element) => element.id === frameId)
      || authored.document.frames.some((frame) => frame.id === frameId)
      || authored.document.relations.some((relation) => relation.id === frameId);
    if (rigIdUsed) continue;
    const adoptionId = `adoption.${frameId}`;
    if (!topLevelProjectIdInUse(project, adoptionId)) return { frameId, adoptionId };
  }
  throw new Error(`Could not allocate RigFrame ID for ${preferredName}.`);
}
