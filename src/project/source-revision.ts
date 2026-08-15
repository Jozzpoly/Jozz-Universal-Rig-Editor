import type { SourceAdapterRef, SourceRevision } from '../kernel/types.js';
import type { JureProjectCommand } from './session.js';
import type { JureProjectModel } from './types.js';

function cloneSourceRevision(source: SourceRevision): SourceRevision {
  return {
    id: source.id,
    label: source.label,
    uri: source.uri,
    sha256: source.sha256.toLowerCase(),
    adapter: { id: source.adapter.id, version: source.adapter.version },
  };
}

function validExactIdentity(source: SourceRevision): boolean {
  return typeof source.id === 'string' && source.id.trim().length > 0
    && /^[a-f0-9]{64}$/i.test(source.sha256)
    && typeof source.adapter?.id === 'string' && source.adapter.id.trim().length > 0
    && Number.isInteger(source.adapter.version) && source.adapter.version > 0;
}

function sameExactSourceRevision(a: SourceRevision, b: SourceRevision): boolean {
  return a.id === b.id
    && a.sha256.toLowerCase() === b.sha256.toLowerCase()
    && a.adapter.id === b.adapter.id
    && a.adapter.version === b.adapter.version;
}

function projectHasTopLevelIdOutsideSources(project: JureProjectModel, id: string): boolean {
  return project.sourceInstances.some((instance) => instance.id === id)
    || project.consumerReferences.some((reference) => reference.id === id)
    || project.sourceAdoptions.some((adoption) => adoption.id === id)
    || project.authoredDocuments.some((authored) => authored.document.documentId === id);
}

export function findExactSourceRevision(
  project: JureProjectModel,
  sha256: string,
  adapter: SourceAdapterRef,
): SourceRevision | null {
  const normalizedHash = sha256.toLowerCase();
  return project.sourceRevisions.find((source) => source.sha256.toLowerCase() === normalizedHash
    && source.adapter.id === adapter.id
    && source.adapter.version === adapter.version) ?? null;
}

export function registerSourceRevision(source: SourceRevision): JureProjectCommand {
  const snapshot = cloneSourceRevision(source);
  if (!validExactIdentity(snapshot)) throw new Error(`SourceRevision ${snapshot.id || '<empty>'} has invalid exact identity.`);
  return {
    label: `Register SOURCE revision: ${snapshot.id}`,
    apply(project) {
      const existing = project.sourceRevisions.find((candidate) => candidate.id === snapshot.id);
      if (existing) {
        if (sameExactSourceRevision(existing, snapshot)) return project;
        throw new Error(`SourceRevision ID ${snapshot.id} already exists with different exact bytes or adapter identity.`);
      }
      if (projectHasTopLevelIdOutsideSources(project, snapshot.id)) throw new Error(`Project ID ${snapshot.id} is already in use.`);
      return { ...project, sourceRevisions: [...project.sourceRevisions, cloneSourceRevision(snapshot)] };
    },
  };
}
