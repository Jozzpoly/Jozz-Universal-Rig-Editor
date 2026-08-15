import type { SourceInspection } from '../../source/types.js';

export interface SourceRuntimeAsset {
  name: string;
  sha256: string;
  objectUrl: string;
  inspection: SourceInspection;
}

export interface SourceRuntimeState {
  asset: SourceRuntimeAsset | null;
  selectedLocator: string | null;
}

export function createSourceRuntimeState(): SourceRuntimeState {
  return { asset: null, selectedLocator: null };
}

export function replaceSourceRuntimeAsset(state: SourceRuntimeState, asset: SourceRuntimeAsset): SourceRuntimeState {
  return { asset, selectedLocator: null };
}

export function clearSourceRuntimeAsset(): SourceRuntimeState {
  return createSourceRuntimeState();
}

export function selectSourceRuntimeLocator(state: SourceRuntimeState, locator: string | null): SourceRuntimeState {
  if (locator === null) return { ...state, selectedLocator: null };
  if (!state.asset) throw new Error(`Cannot select SOURCE locator ${locator} without a loaded source asset.`);
  if (!state.asset.inspection.nodes.some((node) => node.locator === locator)) throw new Error(`SOURCE locator ${locator} is not present in the loaded source asset.`);
  return { ...state, selectedLocator: locator };
}
