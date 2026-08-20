export type MapTransformMode = 'translate' | 'rotate' | 'resize';
export type MapTransformSpace = 'world' | 'local';

export function effectiveMapTransformSpace(
  mode: MapTransformMode,
  preferredSpace: MapTransformSpace,
): MapTransformSpace {
  return mode === 'resize' ? 'local' : preferredSpace;
}
