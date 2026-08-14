import type { CameraPreset, ViewFitTarget } from '../../render/rig-viewport-controller.js';

interface ViewportChromeProps {
  cameraPreset: CameraPreset;
  transformMode: 'translate' | 'rotate';
  transformSpace: 'world' | 'local';
  hasSource: boolean;
  hasSourceSelection: boolean;
  onCameraPreset(preset: CameraPreset): void;
  onTransformMode(mode: 'translate' | 'rotate'): void;
  onToggleTransformSpace(): void;
  onFit(target: ViewFitTarget): void;
}

export function ViewportChrome({ cameraPreset, transformMode, transformSpace, hasSource, hasSourceSelection, onCameraPreset, onTransformMode, onToggleTransformSpace, onFit }: ViewportChromeProps) {
  return (
    <>
      <div className="viewport-toolrail" aria-label="Authored transform tools">
        <button className={transformMode === 'translate' ? 'active' : ''} onClick={() => onTransformMode('translate')}>Move</button>
        <button className={transformMode === 'rotate' ? 'active' : ''} onClick={() => onTransformMode('rotate')}>Rotate</button>
        <button className="space-control" onClick={onToggleTransformSpace}>{transformSpace === 'world' ? 'World' : 'Local'}</button>
      </div>

      <div className="viewport-viewbar" aria-label="Viewport navigation">
        {(['perspective', 'front', 'top', 'side'] as CameraPreset[]).map((preset) => (
          <button key={preset} className={cameraPreset === preset ? 'active' : ''} onClick={() => onCameraPreset(preset)}>{preset}</button>
        ))}
        <button disabled={!hasSourceSelection} onClick={() => onFit('source-selection')}>Focus</button>
        <button disabled={!hasSource} onClick={() => onFit('source')}>Fit Source</button>
        <button onClick={() => onFit('rig')}>Fit Rig</button>
        <button disabled={!hasSource} onClick={() => onFit('all')}>Fit All</button>
      </div>

      <div className="viewport-modehint"><b>AUTHOR</b> · authored and SOURCE selections are independent · Esc cancels drag</div>
      <div className="viewport-orientation" aria-label="Workspace orientation">
        <div className="up">+Y · UP</div>
        <div className="x">+X · SIDE</div>
        <div className="z">+Z · FRONT</div>
      </div>
    </>
  );
}
