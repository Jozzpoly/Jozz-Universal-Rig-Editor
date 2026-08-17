import { type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  MAP_BOX_MIN_HALF_EXTENT,
  boxDimensionsFromHalfExtents,
  boxHalfExtentsFromDimensions,
} from '../../features/map-resize/box-resize.js';
import type { MapVec3 } from '../../map/types.js';

const AXES = ['x', 'y', 'z'] as const;
type Axis = typeof AXES[number];

interface MapBoxDimensionsEditorProps {
  entityId: string;
  halfExtents: MapVec3;
  disabled?: boolean;
  onCommit(halfExtents: MapVec3): void;
}

function commitOnEnter(event: ReactKeyboardEvent<HTMLInputElement>): void {
  if (event.key === 'Enter') event.currentTarget.blur();
}

export function MapBoxDimensionsEditor({ entityId, halfExtents, disabled = false, onCommit }: MapBoxDimensionsEditorProps) {
  const dimensions = boxDimensionsFromHalfExtents(halfExtents);

  return (
    <div className="map-dimensions-editor">
      <div className="map-dimensions-title">Dimensions · m</div>
      <div className="map-dimensions-grid">
        {AXES.map((axis: Axis) => {
          const current = dimensions[axis];
          return (
            <label key={axis} className={`map-dimension-field axis-${axis}`}>
              <span>{axis.toUpperCase()}</span>
              <input
                type="number"
                step="0.001"
                min={MAP_BOX_MIN_HALF_EXTENT * 2}
                disabled={disabled}
                defaultValue={Number(current.toFixed(6))}
                key={`${entityId}-${axis}-${current}`}
                onKeyDown={commitOnEnter}
                onBlur={(event) => {
                  const value = Number(event.currentTarget.value);
                  if (!Number.isFinite(value) || value <= 0) {
                    event.currentTarget.value = String(Number(current.toFixed(6)));
                    return;
                  }
                  if (Math.abs(value - current) <= 1e-12) return;
                  const nextDimensions = { ...dimensions, [axis]: value };
                  onCommit(boxHalfExtentsFromDimensions(nextDimensions));
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
