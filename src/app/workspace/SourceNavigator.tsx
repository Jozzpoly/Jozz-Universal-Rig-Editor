import { useMemo, useState } from 'react';
import type { OpenSourceAsset } from '../../io/source-file.js';

export interface SourceLayerVisibility {
  geometry: boolean;
  datum: boolean;
}

interface SourceNavigatorProps {
  sourceAsset: OpenSourceAsset | null;
  selectedSourceLocator: string | null;
  visible: boolean;
  layers: SourceLayerVisibility;
  onVisibleChange(visible: boolean): void;
  onLayerChange(layer: keyof SourceLayerVisibility, visible: boolean): void;
  onSelect(locator: string): void;
}

export function SourceNavigator({ sourceAsset, selectedSourceLocator, visible, layers, onVisibleChange, onLayerChange, onSelect }: SourceNavigatorProps) {
  const [filter, setFilter] = useState('');
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const filteredNodes = useMemo(() => sourceAsset?.inspection.nodes.filter((node) => {
    if (!normalizedFilter) return true;
    return (node.name ?? '').toLocaleLowerCase().includes(normalizedFilter)
      || node.locator.toLocaleLowerCase().includes(normalizedFilter)
      || (node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node').includes(normalizedFilter);
  }) ?? [], [sourceAsset, normalizedFilter]);
  const shownNodes = filteredNodes.slice(0, 240);

  const layerToggle = (layer: keyof SourceLayerVisibility, label: string) => (
    <button
      type="button"
      className={`layer-toggle source ${layers[layer] ? 'active' : ''}`}
      aria-pressed={layers[layer]}
      disabled={!sourceAsset || !visible}
      title={`${layers[layer] ? 'Hide' : 'Show'} SOURCE ${label.toLocaleLowerCase()}`}
      onClick={() => onLayerChange(layer, !layers[layer])}
    >
      <span className="layer-state-dot" />{label}
    </button>
  );

  return (
    <div className="navigator-pane">
      <div className="pane-head">
        <span>Source</span>
        <span className="pane-count">{sourceAsset ? 'reference' : 'none'}</span>
        <button className={`master-visibility source ${visible ? 'active' : ''}`} disabled={!sourceAsset} title={visible ? 'Hide SOURCE reference' : 'Show SOURCE reference'} onClick={() => onVisibleChange(!visible)} aria-pressed={visible}>{visible ? 'Hide' : 'Show'}</button>
      </div>
      {sourceAsset ? (
        <>
          <div className="layer-strip source-layers" aria-label="Source display layers">
            {layerToggle('geometry', 'Geometry')}
            {layerToggle('datum', 'Datum')}
          </div>
          <div className="source-asset-head">
            <div className="source-asset-title">
              <strong>{sourceAsset.name}</strong>
              <span>REFERENCE · READ ONLY</span>
            </div>
            <span className="source-asset-stats">{sourceAsset.inspection.nodeCount} nodes · {sourceAsset.inspection.jointCount} joints · {sourceAsset.inspection.meshCount} mesh{sourceAsset.inspection.meshCount === 1 ? '' : 'es'}</span>
            <code title={sourceAsset.sha256}>sha256 {sourceAsset.sha256.slice(0, 16)}… · {sourceAsset.inspection.adapter.id}/v{sourceAsset.inspection.adapter.version}</code>
          </div>
          <input className="navigator-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter source…" />
          <div className="navigator-tree source-tree">
            {shownNodes.map((node) => (
              <button
                type="button"
                className={`nav-row source-row ${selectedSourceLocator === node.locator ? 'selected-source' : ''}`}
                key={node.locator}
                onClick={() => onSelect(node.locator)}
                title={node.worldRigidPose ? 'Select read-only SOURCE datum' : `Inspect only: ${node.rigidCompatibility}`}
              >
                <span className="row-bullet source" />
                <span className="row-name">{node.name ?? `Node ${node.index}`}</span>
                <span className="row-kind">{node.locator.replace('gltf2.', '')}</span>
                <small>{node.isSkinJoint ? 'joint' : node.hasMesh ? 'mesh' : 'node'}{node.worldRigidPose ? '' : ` · ${node.rigidCompatibility}`}</small>
              </button>
            ))}
            {filteredNodes.length > shownNodes.length ? <div className="tree-more">+{filteredNodes.length - shownNodes.length} more matches</div> : null}
          </div>
        </>
      ) : (
        <div className="empty-copy source-empty">Open a local glTF/GLB to inspect its reference geometry and datums.</div>
      )}
    </div>
  );
}
