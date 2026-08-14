import type { CameraPreset, ViewFitTarget } from '../../render/rig-viewport-controller.js';

interface ViewportChromeProps {
  cameraPreset: CameraPreset;
  transformMode: 'translate' | 'rotate';
  transformSpace: 'world' | 'local';
  hasRig: boolean;
  hasSource: boolean;
  hasSourceSelection: boolean;
  onCameraPreset(preset: CameraPreset): void;
  onTransformMode(mode: 'translate' | 'rotate'): void;
  onToggleTransformSpace(): void;
  onFit(target: ViewFitTarget): void;
}

export function ViewportChrome({ cameraPreset, transformMode, transformSpace, hasRig, hasSource, hasSourceSelection, onCameraPreset, onTransformMode, onToggleTransformSpace, onFit }: ViewportChromeProps) {
  return (
    <>
      <div className="viewport-toolrail viewport-control-group" aria-label="Authored transform tools">
        <button className={transformMode === 'translate' ? 'active' : ''} onClick={() => onTransformMode('translate')}>Move</button>
        <button className={transformMode === 'rotate' ? 'active' : ''} onClick={() => onTransformMode('rotate')}>Rotate</button>
        <span className="control-divider" />
        <button className="space-control" onClick={onToggleTransformSpace}>{transformSpace === 'world' ? 'World' : 'Local'}</button>
      </div>

      <div className="viewport-viewbar viewport-control-group" aria-label="Viewport navigation">
        {(['perspective', 'front', 'top', 'side'] as CameraPreset[]).map((preset) => (
          <button key={preset} className={cameraPreset === preset ? 'active' : ''} onClick={() => onCameraPreset(preset)}>{preset}</button>
        ))}
        <span className="control-divider" />
        <button disabled={!hasSourceSelection} title="Focus selected SOURCE datum" onClick={() => onFit('source-selection')}>Focus</button>
        <button disabled={!hasSource} onClick={() => onFit('source')}>Source</button>
        <button disabled={!hasRig} onClick={() => onFit('rig')}>Rig</button>
        <button disabled={!hasRig && !hasSource} onClick={() => onFit('all')}>All</button>
      </div>

      <div className="viewport-modehint"><b>AUTHOR</b><span>Esc cancels drag</span></div>
      <div className="viewport-orientation" aria-label="Workspace orientation">
        <div className="up"><b>+Y</b><span>UP</span></div>
        <div className="x">+X</div>
        <div className="z">+Z</div>
      </div>
    </>
  );
}
