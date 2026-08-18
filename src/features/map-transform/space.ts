import type { MapTransformMode } from '../../render/map-viewport-controller.js';

export type MapTransformSpace = 'world' | 'local';

export function effectiveMapTransformSpace(
  mode: MapTransformMode,
  preferredSpace: MapTransformSpace,
): MapTransformSpace {
  return mode === 'resize' ? 'local' : preferredSpace;
}
