import type { JureProjectModel } from '../../project/types.js';
import type { SourceInspection } from '../../source/types.js';

export interface LinkedProjectSourceAsset {
  sourceRevisionId: string;
  name: string;
  sha256: string;
  objectUrl: string;
  inspection: SourceInspection;
}

export interface ProjectSourceDatumSelection {
  sourceInstanceId: string;
  locator: string;
}

export interface ProjectSourceRuntimeState {
  linkedAssets: LinkedProjectSourceAsset[];
  selection: ProjectSourceDatumSelection | null;
}

export interface SourceRuntimeAssetCandidate {
  name: string;
  sha256: string;
  objectUrl: string;
  inspection: SourceInspection;
}

export function createProjectSourceRuntimeState(): ProjectSourceRuntimeState {
  return { linkedAssets: [], selection: null };
}

export function linkExactSourceRuntimeAsset(
  state: ProjectSourceRuntimeState,
  project: JureProjectModel,
  sourceRevisionId: string,
  asset: SourceRuntimeAssetCandidate,
): ProjectSourceRuntimeState {
  const revision = project.sourceRevisions.find((source) => source.id === sourceRevisionId);
  if (!revision) throw new Error(`SourceRevision ${sourceRevisionId} not found in project.`);
  if (asset.sha256.toLowerCase() !== revision.sha256.toLowerCase()) throw new Error(`SOURCE relink hash mismatch for ${sourceRevisionId}. Expected ${revision.sha256}, received ${asset.sha256}.`);
  if (asset.inspection.adapter.id !== revision.adapter.id || asset.inspection.adapter.version !== revision.adapter.version) throw new Error(`SOURCE relink adapter mismatch for ${sourceRevisionId}.`);

  const linked: LinkedProjectSourceAsset = {
    sourceRevisionId,
    name: asset.name,
    sha256: asset.sha256.toLowerCase(),
    objectUrl: asset.objectUrl,
    inspection: asset.inspection,
  };
  const existingIndex = state.linkedAssets.findIndex((entry) => entry.sourceRevisionId === sourceRevisionId);
  const linkedAssets = existingIndex < 0
    ? [...state.linkedAssets, linked]
    : state.linkedAssets.map((entry, index) => index === existingIndex ? linked : entry);
  return { ...state, linkedAssets };
}

export function unlinkSourceRuntimeAsset(
  state: ProjectSourceRuntimeState,
  project: JureProjectModel,
  sourceRevisionId: string,
): ProjectSourceRuntimeState {
  const linkedAssets = state.linkedAssets.filter((entry) => entry.sourceRevisionId !== sourceRevisionId);
  if (!state.selection) return { ...state, linkedAssets };
  const selectedInstance = project.sourceInstances.find((instance) => instance.id === state.selection?.sourceInstanceId);
  const selection = selectedInstance?.sourceRevisionId === sourceRevisionId ? null : state.selection;
  return { linkedAssets, selection };
}

export function linkedSourceRuntimeForInstance(
  state: ProjectSourceRuntimeState,
  project: JureProjectModel,
  sourceInstanceId: string,
): LinkedProjectSourceAsset | null {
  const instance = project.sourceInstances.find((candidate) => candidate.id === sourceInstanceId);
  if (!instance) return null;
  return state.linkedAssets.find((asset) => asset.sourceRevisionId === instance.sourceRevisionId) ?? null;
}

export function selectProjectSourceDatum(
  state: ProjectSourceRuntimeState,
  project: JureProjectModel,
  sourceInstanceId: string,
  locator: string | null,
): ProjectSourceRuntimeState {
  if (locator === null) return { ...state, selection: null };
  const instance = project.sourceInstances.find((candidate) => candidate.id === sourceInstanceId);
  if (!instance) throw new Error(`SourceInstance ${sourceInstanceId} not found in project.`);
  const asset = state.linkedAssets.find((candidate) => candidate.sourceRevisionId === instance.sourceRevisionId);
  if (!asset) throw new Error(`SourceRevision ${instance.sourceRevisionId} is not linked to runtime bytes.`);
  if (!asset.inspection.nodes.some((node) => node.locator === locator)) throw new Error(`SOURCE locator ${locator} is not present in linked revision ${instance.sourceRevisionId}.`);
  return { ...state, selection: { sourceInstanceId, locator } };
}

export function reconcileProjectSourceRuntimeState(
  state: ProjectSourceRuntimeState,
  project: JureProjectModel,
): ProjectSourceRuntimeState {
  if (!state.selection) return state;
  const instance = project.sourceInstances.find((candidate) => candidate.id === state.selection?.sourceInstanceId);
  if (!instance) return { ...state, selection: null };
  const asset = state.linkedAssets.find((candidate) => candidate.sourceRevisionId === instance.sourceRevisionId);
  if (!asset || !asset.inspection.nodes.some((node) => node.locator === state.selection?.locator)) return { ...state, selection: null };
  return state;
}
